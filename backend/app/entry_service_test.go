package app

import (
	"context"
	"database/sql"
	"testing"
	"time"

	"strings"

	"github.com/cho45/hanrangon/backend/model/maindb"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func createEntryForService(t *testing.T, e *testEnv, status string, date time.Time, path string) int64 {
	ctx := context.Background()
	var publishAt sql.NullTime
	if status == "scheduled" || status == "reserved" {
		publishAt = sql.NullTime{Time: date, Valid: true}
	}
	entry, err := e.app.MainDB().Q.CreateEntry(ctx, maindb.CreateEntryParams{
		Date:          date.Format("2006-01-02"),
		Title:         "Title",
		Body:          "Body",
		FormattedBody: "Body",
		Format:        "Markdown",
		Status:        status,
		Path:          path,
		CreatedAt:     date,
		ModifiedAt:    date,
		PublishAt:     publishAt,
	})
	require.NoError(t, err)
	return entry.ID
}

func TestEntryService_CalculateNextPath(t *testing.T) {
	e := setupTest(t)
	defer e.close()
	ctx := context.Background()
	service := e.app.EntryService()

	date := "2025-01-01"

	t.Run("first entry of the day", func(t *testing.T) {
		path, err := service.CalculateNextPath(ctx, e.app.MainDB().Q, date)
		require.NoError(t, err)
		assert.Equal(t, "2025/01/01/1", path)
	})

	t.Run("increment from existing", func(t *testing.T) {
		_, err := e.app.MainDB().Q.CreateEntry(ctx, maindb.CreateEntryParams{
			Date:   date,
			Path:   "2025/01/01/1",
			Status: "public",
		})
		require.NoError(t, err)

		path, err := service.CalculateNextPath(ctx, e.app.MainDB().Q, date)
		require.NoError(t, err)
		assert.Equal(t, "2025/01/01/2", path)
	})

	t.Run("gap in numbering", func(t *testing.T) {
		_, err := e.app.MainDB().Q.CreateEntry(ctx, maindb.CreateEntryParams{
			Date:   date,
			Path:   "2025/01/01/5",
			Status: "public",
		})
		require.NoError(t, err)

		path, err := service.CalculateNextPath(ctx, e.app.MainDB().Q, date)
		require.NoError(t, err)
		assert.Equal(t, "2025/01/01/6", path)
	})
}

func TestEntryService_SaveEntry_Basic(t *testing.T) {
	e := setupTest(t)
	defer e.close()
	ctx := context.Background()
	service := e.app.EntryService()

	t.Run("create new draft", func(t *testing.T) {
		entry, err := service.SaveEntry(ctx, SaveEntryParams{
			Title:  "New Draft",
			Body:   "Body",
			Format: "Markdown",
			Status: "draft",
		})
		require.NoError(t, err)
		assert.NotZero(t, entry.ID)
		assert.Equal(t, "draft", entry.Status)
		assert.Empty(t, entry.Path)
	})

	t.Run("create new public", func(t *testing.T) {
		entry, err := service.SaveEntry(ctx, SaveEntryParams{
			Title:  "New Public",
			Body:   "Body",
			Format: "Markdown",
			Status: "public",
		})
		require.NoError(t, err)
		assert.Equal(t, "public", entry.Status)
		assert.NotEmpty(t, entry.Path)
		assert.Contains(t, entry.Path, time.Now().Format("2006/01/02"))
	})
}

func TestEntryService_PublishScheduledEntries(t *testing.T) {
	e := setupTest(t)
	defer e.close()
	ctx := context.Background()
	service := e.app.EntryService()

	past := time.Now().Add(-1 * time.Hour)

	// 1. Reserved entry (no path yet)
	reserved, err := e.app.MainDB().Q.CreateEntry(ctx, maindb.CreateEntryParams{
		Title:      "Reserved",
		Body:       "Body",
		Status:     "reserved",
		PublishAt:  sql.NullTime{Time: past, Valid: true},
		CreatedAt:  past,
		ModifiedAt: past,
		Date:       past.Format("2006-01-02"),
	})
	require.NoError(t, err)

	// 2. Scheduled entry (path already determined)
	scheduledPath := past.Format("2006/01/02") + "/100"
	scheduled, err := e.app.MainDB().Q.CreateEntry(ctx, maindb.CreateEntryParams{
		Title:      "Scheduled",
		Body:       "Body",
		Status:     "scheduled",
		Path:       scheduledPath,
		PublishAt:  sql.NullTime{Time: past, Valid: true},
		CreatedAt:  past,
		ModifiedAt: past,
		Date:       past.Format("2006-01-02"),
	})
	require.NoError(t, err)

	err = service.PublishScheduledEntries(ctx)
	require.NoError(t, err)

	// Verify reserved
	res, err := e.app.MainDB().Q.GetEntryById(ctx, reserved.ID)
	require.NoError(t, err)
	assert.Equal(t, "public", res.Status)
	assert.NotEmpty(t, res.Path)
	assert.NotEqual(t, reserved.Path, res.Path)

	// Verify scheduled
	sch, err := e.app.MainDB().Q.GetEntryById(ctx, scheduled.ID)
	require.NoError(t, err)
	assert.Equal(t, "public", sch.Status)
	assert.Equal(t, scheduledPath, sch.Path)
}

func TestEntryService_SaveEntry_StateTransitions(t *testing.T) {
	DRAFT, PUBLI, SCHED, RESER, NONE_ := "draft", "public", "scheduled", "reserved", ""
	KEEP_, GENT_, EMPT_ := "maintained", "generated", "empty"

	NOW__ := time.Now().Truncate(time.Second)
	TODAY := NOW__.Format("2006/01/02")
	PAST_ := NOW__.Add(-24 * time.Hour)
	FUTUR := NOW__.Add(24 * time.Hour)

	ZERO_ := time.Time{}
	_____ := ""
	P2025 := "2025/01/01/1"

	type Transition struct{ From, To string }
	FromTo := func(f, t string) Transition { return Transition{f, t} }

	tests := []struct {
		ST        Transition
		SavedPath string
		PubAt     time.Time
		WantStat  string
		WantPath  string
		Name      string
	}{
		//    Transition        SavedPath  PubAt    WantStat  WantPath
		// --- New Entry ---
		{FromTo(NONE_, DRAFT), _____, ZERO_, DRAFT, EMPT_, "New -> Draft"},
		{FromTo(NONE_, PUBLI), _____, ZERO_, PUBLI, GENT_, "New -> Public"},
		{FromTo(NONE_, PUBLI), _____, FUTUR, PUBLI, GENT_, "New -> Public (Future Ignored)"},
		{FromTo(NONE_, SCHED), _____, FUTUR, SCHED, GENT_, "New -> Scheduled"},
		{FromTo(NONE_, RESER), _____, FUTUR, RESER, EMPT_, "New -> Reserved"},

		// --- From Draft ---
		{FromTo(DRAFT, DRAFT), _____, ZERO_, DRAFT, EMPT_, "Draft -> Draft"},
		{FromTo(DRAFT, PUBLI), _____, ZERO_, PUBLI, GENT_, "Draft -> Public"},
		{FromTo(DRAFT, SCHED), _____, FUTUR, SCHED, GENT_, "Draft -> Scheduled"},
		{FromTo(DRAFT, SCHED), _____, FUTUR, SCHED, TODAY + "/1", "Draft -> Scheduled (Path is Today, not Future)"},
		{FromTo(DRAFT, RESER), _____, FUTUR, RESER, EMPT_, "Draft -> Reserved"},

		// --- From Public (URL Immutability) ---
		{FromTo(PUBLI, DRAFT), P2025, ZERO_, DRAFT, KEEP_, "Public -> Draft (Keep URL)"},
		{FromTo(PUBLI, PUBLI), P2025, ZERO_, PUBLI, KEEP_, "Public -> Public (Keep URL)"},
		{FromTo(PUBLI, SCHED), P2025, FUTUR, SCHED, KEEP_, "Public -> Scheduled (Keep URL)"},
		{FromTo(PUBLI, RESER), P2025, FUTUR, RESER, KEEP_, "Public -> Reserved (Keep URL until publish)"},

		// --- From Scheduled (URL Immutability) ---
		{FromTo(SCHED, DRAFT), P2025, ZERO_, DRAFT, KEEP_, "Scheduled -> Draft (Keep URL)"},
		{FromTo(SCHED, PUBLI), P2025, ZERO_, PUBLI, KEEP_, "Scheduled -> Public (Keep URL)"},
		{FromTo(SCHED, SCHED), P2025, FUTUR, SCHED, KEEP_, "Scheduled -> Scheduled (Keep URL)"},
		{FromTo(SCHED, RESER), P2025, FUTUR, RESER, KEEP_, "Scheduled -> Reserved (Keep URL until publish)"},

		// --- From Reserved ---
		{FromTo(RESER, DRAFT), _____, ZERO_, DRAFT, EMPT_, "Reserved -> Draft"},
		{FromTo(RESER, PUBLI), _____, ZERO_, PUBLI, GENT_, "Reserved -> Public"},
		{FromTo(RESER, SCHED), _____, FUTUR, SCHED, GENT_, "Reserved -> Scheduled"},
		{FromTo(RESER, RESER), _____, FUTUR, RESER, EMPT_, "Reserved -> Reserved"},

		// --- From Draft with Path (Previously Published) ---
		{FromTo(DRAFT, DRAFT), P2025, ZERO_, DRAFT, KEEP_, "Draft(P) -> Draft (Keep URL)"},
		{FromTo(DRAFT, PUBLI), P2025, ZERO_, PUBLI, KEEP_, "Draft(P) -> Public (Keep URL)"},
		{FromTo(DRAFT, SCHED), P2025, FUTUR, SCHED, KEEP_, "Draft(P) -> Scheduled (Keep URL)"},
		{FromTo(DRAFT, RESER), P2025, FUTUR, RESER, KEEP_, "Draft(P) -> Reserved (Keep URL until publish)"},
	}

	for _, tt := range tests {
		t.Run(tt.Name, func(t *testing.T) {
			e := setupTest(t)
			defer e.close()
			ctx := context.Background()
			service := e.app.EntryService()

			var id int64
			if tt.ST.From != NONE_ {
				initDate := PAST_
				if tt.SavedPath != "" {
					p := strings.Split(tt.SavedPath, "/")
					if len(p) >= 3 {
						d, _ := time.Parse("2006-01-02", strings.Join(p[:3], "-"))
						initDate = d
					}
				}
				id = createEntryForService(t, e, tt.ST.From, initDate, tt.SavedPath)
			}

			var publishAt sql.NullTime
			if !tt.PubAt.IsZero() {
				publishAt = sql.NullTime{Time: tt.PubAt, Valid: true}
			}

			en, err := service.SaveEntry(ctx, SaveEntryParams{
				ID:        id,
				Title:     "Title",
				Body:      "Body",
				Format:    "Markdown",
				Status:    tt.ST.To,
				PublishAt: publishAt,
			})

			require.NoError(t, err)
			assert.Equal(t, tt.WantStat, en.Status, "Status mismatch")

			if strings.Contains(tt.WantPath, "/") {
				assert.Equal(t, tt.WantPath, en.Path)
			} else {
				switch tt.WantPath {
				case EMPT_:
					assert.Empty(t, en.Path)
				case GENT_:
					assert.NotEmpty(t, en.Path)
					if tt.SavedPath != "" {
						assert.NotEqual(t, tt.SavedPath, en.Path)
					}
				case KEEP_:
					assert.Equal(t, tt.SavedPath, en.Path)
				}
			}

			if en.Path != "" {
				pathParts := strings.Split(en.Path, "/")
				require.GreaterOrEqual(t, len(pathParts), 3)
				pathDate := strings.Join(pathParts[:3], "-")
				assert.Equal(t, pathDate, en.Date)
			}
		})
	}

	t.Run("Immutability:Chain", func(t *testing.T) {
		e := setupTest(t)
		defer e.close()
		ctx := context.Background()
		service := e.app.EntryService()

		// 1. New -> Public (Path A generated)
		entry, err := service.SaveEntry(ctx, SaveEntryParams{
			Title:  "Title",
			Body:   "Body",
			Format: "Markdown",
			Status: "public",
		})
		require.NoError(t, err)
		pathA := entry.Path
		assert.NotEmpty(t, pathA)

		// 2. Public -> Draft (Path A maintained)
		entry, err = service.SaveEntry(ctx, SaveEntryParams{
			ID:     entry.ID,
			Title:  "Title",
			Body:   "Body",
			Format: "Markdown",
			Status: "draft",
		})
		require.NoError(t, err)
		assert.Equal(t, pathA, entry.Path)

		// 3. Draft -> Scheduled (Path A maintained)
		future := time.Now().Add(24 * time.Hour)
		entry, err = service.SaveEntry(ctx, SaveEntryParams{
			ID:        entry.ID,
			Title:     "Title",
			Body:      "Body",
			Format:    "Markdown",
			Status:    "scheduled",
			PublishAt: sql.NullTime{Time: future, Valid: true},
		})
		require.NoError(t, err)
		assert.Equal(t, pathA, entry.Path)
	})

	t.Run("Exception:ReservedMove", func(t *testing.T) {
		e := setupTest(t)
		defer e.close()
		ctx := context.Background()
		service := e.app.EntryService()
		pastDate := time.Date(2020, 1, 1, 12, 0, 0, 0, time.Local)
		futureDate := time.Now().Add(24 * time.Hour)

		// 1. Existing Public Entry
		id := createEntryForService(t, e, "public", pastDate, "2020/01/01/1")

		// 2. Move to Reserved (Path should be KEPT during reservation)
		entry, err := service.SaveEntry(ctx, SaveEntryParams{
			ID:        id,
			Title:     "Title",
			Body:      "Body",
			Format:    "Markdown",
			Status:    "reserved",
			PublishAt: sql.NullTime{Time: futureDate, Valid: true},
		})
		require.NoError(t, err)
		assert.Equal(t, "2020/01/01/1", entry.Path)

		// 3. Publish from Reserved (Should get NEW path with today's date)
		entry, err = service.SaveEntry(ctx, SaveEntryParams{
			ID:     id,
			Title:  "Title",
			Body:   "Body",
			Format: "Markdown",
			Status: "public",
		})
		require.NoError(t, err)
		assert.Contains(t, entry.Path, time.Now().Format("2006/01/02"))
		assert.NotEqual(t, "2020/01/01/1", entry.Path)
	})

	t.Run("Edge:ReservedJobOverwrite", func(t *testing.T) {
		e := setupTest(t)
		defer e.close()
		ctx := context.Background()
		service := e.app.EntryService()
		pastDate := time.Date(2020, 1, 1, 12, 0, 0, 0, time.Local)
		publishDate := time.Now().Add(1 * time.Hour)

		// 1. Existing Public Entry
		id := createEntryForService(t, e, "public", pastDate, "2020/01/01/1")

		// 2. Reserved に変更して保存 (Path維持)
		entry, err := service.SaveEntry(ctx, SaveEntryParams{
			ID:        id,
			Title:     "Title",
			Body:      "Body",
			Format:    "Markdown",
			Status:    "reserved",
			PublishAt: sql.NullTime{Time: publishDate, Valid: true},
		})
		require.NoError(t, err)
		assert.Equal(t, "2020/01/01/1", entry.Path)

		// 過去に書き換えてジョブ対象にする
		_, err = e.app.MainDB().ExecContext(ctx, "UPDATE entries SET publish_at = ? WHERE id = ?", time.Now().Add(-1*time.Hour), id)
		require.NoError(t, err)

		// 3. ジョブ実行 (再採番)
		err = service.PublishScheduledEntries(ctx)
		require.NoError(t, err)

		en, _ := e.app.MainDB().Q.GetEntryById(ctx, id)
		assert.Equal(t, "public", en.Status)
		// publish_at に設定した時刻の日付が含まれているはず
		expectedDate := time.Now().Add(-1 * time.Hour).Format("2006/01/02")
		assert.Contains(t, en.Path, expectedDate, "Path should contain the date from publish_at")
		assert.NotEqual(t, "2020/01/01/1", en.Path)
	})

	t.Run("Edge:Gap", func(t *testing.T) {
		e := setupTest(t)
		defer e.close()
		ctx := context.Background()
		service := e.app.EntryService()
		d := time.Date(2025, 1, 1, 12, 0, 0, 0, time.Local)

		// Create entries with a gap in path numbering
		createEntryForService(t, e, "public", d, "2025/01/01/1")
		createEntryForService(t, e, "public", d, "2025/01/01/3")

		// New entry should fill the next available number (4, not 2)
		id := createEntryForService(t, e, "reserved", d, "")
		entry, err := service.SaveEntry(ctx, SaveEntryParams{
			ID:        id,
			Title:     "Title",
			Body:      "Body",
			Format:    "Markdown",
			Status:    "public",
			PublishAt: sql.NullTime{Time: d, Valid: true},
		})
		require.NoError(t, err)
		assert.Equal(t, "2025/01/01/4", entry.Path)
	})

	t.Run("Validation:ScheduledErrors", func(t *testing.T) {
		e := setupTest(t)
		defer e.close()
		ctx := context.Background()
		service := e.app.EntryService()
		past := time.Now().Add(-1 * time.Hour)

		// Past error
		_, err := service.SaveEntry(ctx, SaveEntryParams{
			Status:    "scheduled",
			PublishAt: sql.NullTime{Time: past, Valid: true},
		})
		assert.Error(t, err)
		assert.Contains(t, err.Error(), "Scheduled status requires a future publish_at")

		// Empty error
		_, err = service.SaveEntry(ctx, SaveEntryParams{
			Status: "reserved",
		})
		assert.Error(t, err)
		assert.Contains(t, err.Error(), "Reserved status requires a future publish_at")
	})

	t.Run("CreatedAtUpdate", func(t *testing.T) {
		e := setupTest(t)
		defer e.close()
		ctx := context.Background()
		service := e.app.EntryService()

		past := time.Now().Add(-24 * time.Hour).Truncate(time.Second)

		t.Run("draft to draft: maintain CreatedAt", func(t *testing.T) {
			id := createEntryForService(t, e, "draft", past, "")
			entry, err := service.SaveEntry(ctx, SaveEntryParams{
				ID:     id,
				Title:  "Still Draft",
				Body:   "Body",
				Format: "Markdown",
				Status: "draft",
			})
			require.NoError(t, err)
			assert.True(t, entry.CreatedAt.Equal(past), "CreatedAt should be maintained for draft entries")
		})

		t.Run("draft to public: update CreatedAt", func(t *testing.T) {
			id := createEntryForService(t, e, "draft", past, "")
			now := time.Now()
			entry, err := service.SaveEntry(ctx, SaveEntryParams{
				ID:     id,
				Title:  "Published",
				Body:   "Body",
				Format: "Markdown",
				Status: "public",
			})
			require.NoError(t, err)
			assert.True(t, entry.CreatedAt.After(past), "CreatedAt should be updated when transitioning from draft to public")
			assert.True(t, entry.CreatedAt.After(now.Add(-5*time.Second)), "CreatedAt should be near now")
		})

		t.Run("public to public: maintain CreatedAt", func(t *testing.T) {
			id := createEntryForService(t, e, "public", past, "2025/01/01/1")
			entry, err := service.SaveEntry(ctx, SaveEntryParams{
				ID:     id,
				Title:  "Updated Public",
				Body:   "Body",
				Format: "Markdown",
				Status: "public",
			})
			require.NoError(t, err)
			assert.True(t, entry.CreatedAt.Equal(past), "CreatedAt should be maintained for public entries")
		})

		t.Run("public to draft: maintain CreatedAt", func(t *testing.T) {
			id := createEntryForService(t, e, "public", past, "2025/01/01/1")
			entry, err := service.SaveEntry(ctx, SaveEntryParams{
				ID:     id,
				Title:  "Back to Draft",
				Body:   "Body",
				Format: "Markdown",
				Status: "draft",
			})
			require.NoError(t, err)
			assert.True(t, entry.CreatedAt.Equal(past), "CreatedAt should be maintained when transitioning from public to draft")
		})
	})

	t.Run("TimezoneBug_Reproduction", func(t *testing.T) {
		e := setupTest(t)
		defer e.close()
		ctx := context.Background()
		service := e.app.EntryService()

		// 1. 未来の予約投稿を作成 (現在から 5 時間後)
		// バグを再現するため、明示的に UTC の時刻を渡す
		// (ユーザーの DB では publish_at が UTC 文字列になっているため)
		futureJST := time.Now().In(APP_TZ).Add(5 * time.Hour).Truncate(time.Second)
		futureUTC := futureJST.UTC()
		entry, err := service.SaveEntry(ctx, SaveEntryParams{
			Title:     "Future Reserved",
			Body:      "Body",
			Format:    "Markdown",
			Status:    "reserved",
			PublishAt: sql.NullTime{Time: futureUTC, Valid: true},
		})
		require.NoError(t, err)
		assert.Equal(t, "reserved", entry.Status)

		// DB に保存された publish_at を確認
		// ドライバによる自動変換を避けるため TEXT にキャストして取得
		var rawPublishAt string
		err = e.app.MainDB().DB.QueryRow("SELECT CAST(publish_at AS TEXT) FROM entries WHERE id = ?", entry.ID).Scan(&rawPublishAt)
		require.NoError(t, err)
		t.Logf("Raw publish_at in DB: %s", rawPublishAt)
		t.Logf("Go future time: %v", futureJST)

		// 2. PublishScheduledEntries を実行
		// 本来なら 5 時間後の記事なので公開されないはず
		err = service.PublishScheduledEntries(ctx)
		require.NoError(t, err)

		// 3. 公開状態を確認
		res, err := e.app.MainDB().Q.GetEntryById(ctx, entry.ID)
		require.NoError(t, err)

		// バグが再現すれば、ここで status が "public" になってしまう
		if res.Status == "public" {
			t.Errorf("BUG REPRODUCED: Future entry (scheduled for %v) was published immediately", futureJST)
		}
	})
}
