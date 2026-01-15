package jobs

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"net/url"
	"regexp"

	"github.com/cho45/hanrangon/backend/app"
	"github.com/cho45/hanrangon/backend/model/maindb"
)

type UpdateTrackbacksJob struct {
	app app.App
}

func NewUpdateTrackbacksJob(a app.App) *UpdateTrackbacksJob {
	return &UpdateTrackbacksJob{
		app: a,
	}
}

func (j *UpdateTrackbacksJob) Name() string {
	return "UpdateTrackbacks"
}

type UpdateTrackbacksArg struct {
	EntryID int64 `json:"entry_id"`
}

func (j *UpdateTrackbacksJob) Execute(ctx context.Context, arg json.RawMessage) error {
	var a UpdateTrackbacksArg
	if err := json.Unmarshal(arg, &a); err != nil {
		return fmt.Errorf("failed to unmarshal arg: %w", err)
	}

	entry, err := j.app.MainDB().Q.GetEntryById(ctx, a.EntryID)
	if err != nil {
		return err
	}

	// 本文から自サイト内のリンク（パス）を抽出。
	// これにより、記事間での言及を「トラックバック」として自動登録する。
	u, err := url.Parse(j.app.Config().BaseURL)
	if err != nil {
		return err
	}
	host := regexp.QuoteMeta(u.Host)
	// YYYY/MM/DD/N 形式のパスにマッチさせる
	re := regexp.MustCompile(fmt.Sprintf(`https?://%s/(\d{4}/\d{2}/\d{2}/\d+)`, host))
	matches := re.FindAllStringSubmatch(entry.FormattedBody, -1)

	paths := make([]string, 0, len(matches))
	seen := make(map[string]bool)
	for _, m := range matches {
		path := m[1]
		if !seen[path] {
			paths = append(paths, path)
			seen[path] = true
		}
	}

	// トラックバック情報の更新
	tx, err := j.app.MainDB().BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()
	qtx := maindb.New(tx)

	// 1. このエントリを送信元とする古いトラックバックを削除
	if err := qtx.DeleteTrackbacksBySourceEntryId(ctx, sql.NullInt64{Int64: a.EntryID, Valid: true}); err != nil {
		return err
	}

	// 2. 新しいトラックバックを登録
	for _, path := range paths {
		target, err := qtx.GetEntryByPath(ctx, path)
		if err != nil {
			// ターゲットエントリが見つからない場合はスキップ
			continue
		}

		if err := qtx.CreateTrackback(ctx, maindb.CreateTrackbackParams{
			EntryID:          sql.NullInt64{Int64: target.ID, Valid: true},
			TrackbackEntryID: sql.NullInt64{Int64: a.EntryID, Valid: true},
		}); err != nil {
			return err
		}
	}

	return tx.Commit()
}
