package app

import (
	"bufio"
	"context"
	"database/sql"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"github.com/cho45/hanrangon/backend/model"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

// NOTE: 編集時の状態遷移マトリクス（status, date, path の相関関係）の詳細は
// docs/specs/entry-path-logic.md に定義されています。

func createEntryInEnv(t *testing.T, e *testEnv, status string, date time.Time, path string) int64 {
	ctx := context.Background()
	var publishAt sql.NullTime
	if status == "scheduled" || status == "reserved" {
		publishAt = sql.NullTime{Time: date, Valid: true}
	}
	entry, err := e.app.Queries().CreateEntry(ctx, model.CreateEntryParams{
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

func doEditRequestInEnv(t *testing.T, e *testEnv, login *LoginInfo, id *int64, status string, pubAt time.Time, wantCode int) {
	publishAt := ""
	if !pubAt.IsZero() {
		publishAt = pubAt.Format(time.RFC3339)
	}
	payload := EditRequest{
		Title:     "Updated Title",
		Body:      "Updated Body",
		Format:    "Markdown",
		Status:    status,
		PublishAt: publishAt,
	}
	if id != nil {
		payload.ID = *id
	}

	body, _ := json.Marshal(payload)
	req := httptest.NewRequest(http.MethodPost, "/admin/api/edit", strings.NewReader(string(body)))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Cookie", login.Cookie)
	req.Header.Set("X-Requested-With", "fetch")

	rec := httptest.NewRecorder()
	e.server.ServeHTTP(rec, req)
	require.Equal(t, wantCode, rec.Code, "Edit request code mismatch: %s", rec.Body.String())
	if wantCode != http.StatusOK {
		return
	}

	var resp EditResponse
	err := json.Unmarshal(rec.Body.Bytes(), &resp)
	require.NoError(t, err)

	progReq := httptest.NewRequest(http.MethodGet, "/admin/api/edit/progress?sid="+resp.SessionID, nil)
	progReq.Header.Set("Cookie", login.Cookie)

	start := time.Now()
	for time.Since(start) < 5*time.Second {
		progRec := httptest.NewRecorder()
		e.server.ServeHTTP(progRec, progReq)
		if progRec.Code == http.StatusOK {
			scanner := bufio.NewScanner(progRec.Body)
			for scanner.Scan() {
				line := scanner.Text()
				if strings.HasPrefix(line, "data: ") {
					data := strings.TrimPrefix(line, "data: ")
					var msg map[string]interface{}
					if err := json.Unmarshal([]byte(data), &msg); err == nil {
						if msg["type"] == "done" {
							return
						}
					}
				}
			}
		}
		time.Sleep(100 * time.Millisecond)
	}
	t.Fatal("Edit progress should be done within timeout")
}

func TestHandleAdminApiEdit_StateTransitions(t *testing.T) {
	DRAFT, PUBLI, SCHED, RESER, NONE_ := "draft", "public", "scheduled", "reserved", ""
	KEEP_, GENT_, EMPT_ := "maintained", "generated", "empty"
	OK___, BAD__ := http.StatusOK, http.StatusBadRequest

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
		WantCode  int
		WantStat  string
		WantPath  string
		Name      string
	}{
		//    Transition        SavedPath  PubAt    WantCode  WantStat  WantPath
		// --- New Entry ---
		{FromTo(NONE_, DRAFT), _____, ZERO_, OK___, DRAFT, EMPT_, "New -> Draft"},
		{FromTo(NONE_, PUBLI), _____, ZERO_, OK___, PUBLI, GENT_, "New -> Public"},
		{FromTo(NONE_, PUBLI), _____, FUTUR, OK___, PUBLI, GENT_, "New -> Public (Future Ignored)"},
		{FromTo(NONE_, SCHED), _____, FUTUR, OK___, SCHED, GENT_, "New -> Scheduled"},
		{FromTo(NONE_, SCHED), _____, PAST_, BAD__, _____, _____, "New -> Scheduled (Past Error)"},
		{FromTo(NONE_, SCHED), _____, ZERO_, BAD__, _____, _____, "New -> Scheduled (Empty Error)"},
		{FromTo(NONE_, RESER), _____, FUTUR, OK___, RESER, EMPT_, "New -> Reserved"},
		{FromTo(NONE_, RESER), _____, PAST_, BAD__, _____, _____, "New -> Reserved (Past Error)"},
		{FromTo(NONE_, RESER), _____, ZERO_, BAD__, _____, _____, "New -> Reserved (Empty Error)"},

		// --- From Draft ---
		{FromTo(DRAFT, DRAFT), _____, ZERO_, OK___, DRAFT, EMPT_, "Draft -> Draft"},
		{FromTo(DRAFT, PUBLI), _____, ZERO_, OK___, PUBLI, GENT_, "Draft -> Public"},
		{FromTo(DRAFT, SCHED), _____, FUTUR, OK___, SCHED, GENT_, "Draft -> Scheduled"},
		{FromTo(DRAFT, SCHED), _____, FUTUR, OK___, SCHED, TODAY + "/1", "Draft -> Scheduled (Path is Today, not Future)"},
		{FromTo(DRAFT, RESER), _____, FUTUR, OK___, RESER, EMPT_, "Draft -> Reserved"},

		// --- From Public (URL Immutability) ---
		{FromTo(PUBLI, DRAFT), P2025, ZERO_, OK___, DRAFT, KEEP_, "Public -> Draft (Keep URL)"},
		{FromTo(PUBLI, PUBLI), P2025, ZERO_, OK___, PUBLI, KEEP_, "Public -> Public (Keep URL)"},
		{FromTo(PUBLI, SCHED), P2025, FUTUR, OK___, SCHED, KEEP_, "Public -> Scheduled (Keep URL)"},
		{FromTo(PUBLI, RESER), P2025, FUTUR, OK___, RESER, KEEP_, "Public -> Reserved (Keep URL until publish)"},

		// --- From Scheduled (URL Immutability) ---
		{FromTo(SCHED, DRAFT), P2025, ZERO_, OK___, DRAFT, KEEP_, "Scheduled -> Draft (Keep URL)"},
		{FromTo(SCHED, PUBLI), P2025, ZERO_, OK___, PUBLI, KEEP_, "Scheduled -> Public (Keep URL)"},
		{FromTo(SCHED, SCHED), P2025, FUTUR, OK___, SCHED, KEEP_, "Scheduled -> Scheduled (Keep URL)"},
		{FromTo(SCHED, RESER), P2025, FUTUR, OK___, RESER, KEEP_, "Scheduled -> Reserved (Keep URL until publish)"},

		// --- From Reserved ---
		{FromTo(RESER, DRAFT), _____, ZERO_, OK___, DRAFT, EMPT_, "Reserved -> Draft"},
		{FromTo(RESER, PUBLI), _____, ZERO_, OK___, PUBLI, GENT_, "Reserved -> Public"},
		{FromTo(RESER, SCHED), _____, FUTUR, OK___, SCHED, GENT_, "Reserved -> Scheduled"},
		{FromTo(RESER, RESER), _____, FUTUR, OK___, RESER, EMPT_, "Reserved -> Reserved"},

		// --- From Draft with Path (Previously Published) ---
		{FromTo(DRAFT, DRAFT), P2025, ZERO_, OK___, DRAFT, KEEP_, "Draft(P) -> Draft (Keep URL)"},
		{FromTo(DRAFT, PUBLI), P2025, ZERO_, OK___, PUBLI, KEEP_, "Draft(P) -> Public (Keep URL)"},
		{FromTo(DRAFT, SCHED), P2025, FUTUR, OK___, SCHED, KEEP_, "Draft(P) -> Scheduled (Keep URL)"},
		{FromTo(DRAFT, RESER), P2025, FUTUR, OK___, RESER, KEEP_, "Draft(P) -> Reserved (Keep URL until publish)"},
	}

	for _, tt := range tests {
		t.Run(tt.Name, func(t *testing.T) {
			e := setupTest(t)
			defer e.close()
			ctx := context.Background()
			login := e.login(t)

			var idPtr *int64
			if tt.ST.From != NONE_ {
				initDate := PAST_
				if tt.SavedPath != "" {
					// Ensure initial consistency for test data
					p := strings.Split(tt.SavedPath, "/")
					if len(p) >= 3 {
						d, _ := time.Parse("2006-01-02", strings.Join(p[:3], "-"))
						initDate = d
					}
				}
				id := createEntryInEnv(t, e, tt.ST.From, initDate, tt.SavedPath)
				idPtr = &id
			}

			doEditRequestInEnv(t, e, login, idPtr, tt.ST.To, tt.PubAt, tt.WantCode)

			if tt.WantCode != OK___ {
				return
			}

			var entryID int64
			if idPtr != nil {
				entryID = *idPtr
			} else {
				rows, err := e.app.Queries().ListEntriesAdmin(ctx, model.ListEntriesAdminParams{Limit: 1})
				require.NoError(t, err)
				require.NotEmpty(t, rows)
				entryID = rows[0].ID
			}

			en, err := e.app.Queries().GetEntryById(ctx, entryID)
			require.NoError(t, err)

			assert.Equal(t, tt.WantStat, en.Status, "Status mismatch")
			if strings.Contains(tt.WantPath, "/") {
				// Specific path expected
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

			// Verify Date consistency with Path
			if en.Path != "" {
				// Path format: YYYY/MM/DD/N -> Date format: YYYY-MM-DD
				pathParts := strings.Split(en.Path, "/")
				require.GreaterOrEqual(t, len(pathParts), 3, "Path format invalid: %s", en.Path)
				pathDate := strings.Join(pathParts[:3], "-")
				assert.Equal(t, pathDate, en.Date, "Date field must match Path prefix")
			}
		})
	}

	t.Run("Immutability:Chain", func(t *testing.T) {
		e := setupTest(t)
		defer e.close()
		ctx := context.Background()
		l := e.login(t)

		// 1. New -> Public (Path A generated)
		doEditRequestInEnv(t, e, l, nil, PUBLI, ZERO_, OK___)
		rows, _ := e.app.Queries().ListEntriesAdmin(ctx, model.ListEntriesAdminParams{Limit: 1})
		id := rows[0].ID
		pathA := rows[0].Path
		assert.NotEmpty(t, pathA)

		// 2. Public -> Draft (Path A maintained)
		doEditRequestInEnv(t, e, l, &id, DRAFT, ZERO_, OK___)
		en, _ := e.app.Queries().GetEntryById(ctx, id)
		assert.Equal(t, pathA, en.Path, "Path should be maintained in Draft")

		// 3. Draft -> Scheduled (Path A maintained)
		doEditRequestInEnv(t, e, l, &id, SCHED, FUTUR, OK___)
		en, _ = e.app.Queries().GetEntryById(ctx, id)
		assert.Equal(t, pathA, en.Path, "Path should be maintained in Scheduled")

		// 4. Scheduled -> Public (Path A maintained)
		doEditRequestInEnv(t, e, l, &id, PUBLI, ZERO_, OK___)
		en, _ = e.app.Queries().GetEntryById(ctx, id)
		assert.Equal(t, pathA, en.Path, "Path should be maintained in Public")
	})

	t.Run("Exception:ReservedMove", func(t *testing.T) {
		e := setupTest(t)
		defer e.close()
		ctx := context.Background()
		l := e.login(t)
		pastDate := time.Date(2020, 1, 1, 12, 0, 0, 0, time.Local)
		futureDate := time.Now().Add(24 * time.Hour)

		// 1. Existing Public Entry (Path 2020/01/01/1)
		id := createEntryInEnv(t, e, PUBLI, pastDate, "2020/01/01/1")

		// 2. Move to Reserved (Path should be KEPT during reservation)
		doEditRequestInEnv(t, e, l, &id, RESER, futureDate, OK___)
		en, _ := e.app.Queries().GetEntryById(ctx, id)
		assert.Equal(t, "2020/01/01/1", en.Path, "Path should be KEPT when moving to Reserved")

		// 3. Publish from Reserved (Should get NEW path with today's date)
		// Simulating publication by changing status to Public
		// NOTE: In HandleAdminApiEdit, moving from Reserved to Public triggers re-pathing
		doEditRequestInEnv(t, e, l, &id, PUBLI, ZERO_, OK___)
		en, _ = e.app.Queries().GetEntryById(ctx, id)
		assert.NotEmpty(t, en.Path)
		assert.Contains(t, en.Path, time.Now().Format("2006/01/02"), "Should have new path with today's date")
		assert.NotEqual(t, "2020/01/01/1", en.Path, "Path should have changed upon publication")
	})

	t.Run("Edge:Gap", func(t *testing.T) {
		e := setupTest(t)
		defer e.close()
		ctx := context.Background()
		l := e.login(t)
		d := time.Date(2025, 1, 1, 12, 0, 0, 0, time.Local)
		createEntryInEnv(t, e, PUBLI, d, "2025/01/01/1")
		createEntryInEnv(t, e, PUBLI, d, "2025/01/01/3")
		id := createEntryInEnv(t, e, RESER, d, "")
		doEditRequestInEnv(t, e, l, &id, PUBLI, d, OK___)
		en, _ := e.app.Queries().GetEntryById(ctx, id)
		assert.Equal(t, "2025/01/01/4", en.Path)
	})

	t.Run("Edge:Job", func(t *testing.T) {
		e := setupTest(t)
		defer e.close()
		ctx := context.Background()
		d := time.Now().Add(-24 * time.Hour)
		createEntryInEnv(t, e, PUBLI, d, d.Format("2006/01/02")+"/1")
		id := createEntryInEnv(t, e, RESER, d, "")
		err := e.app.PublishScheduledEntries(ctx)
		require.NoError(t, err)
		en, _ := e.app.Queries().GetEntryById(ctx, id)
		assert.Equal(t, d.Format("2006/01/02")+"/2", en.Path)
	})

	t.Run("Edge:ReservedJobOverwrite", func(t *testing.T) {
		e := setupTest(t)
		defer e.close()
		ctx := context.Background()
		l := e.login(t)

		pastDate := time.Date(2020, 1, 1, 12, 0, 0, 0, time.Local)
		// バリデーションを通すために一旦未来の日時を設定する
		publishDate := time.Now().Add(1 * time.Hour)

		// 1. 既存の公開記事 (Path: 2020/01/01/1) を作成
		id := createEntryInEnv(t, e, PUBLI, pastDate, "2020/01/01/1")

		// 2. Reserved に変更して保存
		// 仕様: 「既存パスがあれば維持」
		doEditRequestInEnv(t, e, l, &id, RESER, publishDate, OK___)
		en, _ := e.app.Queries().GetEntryById(ctx, id)
		assert.Equal(t, "2020/01/01/1", en.Path, "保存時は既存パスが維持されるべき")

		// ジョブの公開対象にするために、DB上の publish_at を過去に書き換える
		_, err := e.app.DB().ExecContext(ctx, "UPDATE entries SET publish_at = ? WHERE id = ?", time.Now().Add(-1*time.Hour), id)
		require.NoError(t, err)

		// 3. ジョブ実行による公開
		// 仕様: 「ただし無視し、公開時にその日の最新番号で採番」
		err = e.app.PublishScheduledEntries(ctx)
		require.NoError(t, err)

		// 4. パスが今日の日付で再採番されていることを確認
		en, _ = e.app.Queries().GetEntryById(ctx, id)
		assert.Equal(t, PUBLI, en.Status)
		assert.NotEqual(t, "2020/01/01/1", en.Path, "公開時は既存パスが無視（上書き）されるべき")
		assert.Contains(t, en.Path, time.Now().Format("2006/01/02"), "新しい日付のパスで採番されるべき")
	})
}
