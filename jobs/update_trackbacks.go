package jobs

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"net/url"
	"regexp"

	"github.com/cho45/hanrangon/app"
	"github.com/cho45/hanrangon/model"
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

	entry, err := j.app.Queries().GetEntryById(ctx, a.EntryID)
	if err != nil {
		return err
	}

	// Extract paths from formatted body
	u, err := url.Parse(j.app.Config().BaseURL)
	if err != nil {
		return err
	}
	host := regexp.QuoteMeta(u.Host)
	// Match paths like /2026/01/02/1
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

	// Update trackbacks
	// 1. Delete old ones where this entry is the source (trackback_entry_id)
	if err := j.app.Queries().DeleteTrackbacksBySourceEntryId(ctx, sql.NullInt64{Int64: a.EntryID, Valid: true}); err != nil {
		return err
	}

	// 2. Insert new ones
	for _, path := range paths {
		target, err := j.app.Queries().GetEntryByPath(ctx, path)
		if err != nil {
			// If target entry not found, just skip it
			continue
		}

		if err := j.app.Queries().CreateTrackback(ctx, model.CreateTrackbackParams{
			EntryID:          sql.NullInt64{Int64: target.ID, Valid: true},
			TrackbackEntryID: sql.NullInt64{Int64: a.EntryID, Valid: true},
		}); err != nil {
			return err
		}
	}

	return nil
}
