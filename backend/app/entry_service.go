package app

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"strconv"
	"strings"
	"time"

	"github.com/cho45/hanrangon/backend/formatter"
	"github.com/cho45/hanrangon/backend/model/maindb"
	"github.com/cho45/hanrangon/backend/view"
)

// EntryService はエントリに関するドメインロジックを担当する
type EntryService struct {
	app App
}

type SaveEntryParams struct {
	ID        int64
	Title     string
	Body      string
	Format    string
	Status    string
	PublishAt sql.NullTime
	Reporter  ProgressReporter
}

func NewEntryService(app App) *EntryService {
	return &EntryService{app: app}
}

func (s *EntryService) SaveEntry(ctx context.Context, params SaveEntryParams) (*maindb.Entry, error) {
	now := time.Now()
	status := params.Status

	// 0. バリデーション
	if status == string(maindb.StatusScheduled) || status == string(maindb.StatusReserved) {
		if !params.PublishAt.Valid || !params.PublishAt.Time.After(now) {
			msg := "Scheduled status requires a future publish_at"
			if status == string(maindb.StatusReserved) {
				msg = "Reserved status requires a future publish_at"
			}
			return nil, fmt.Errorf("%s", msg)
		}
	}

	// 1. Format
	if params.Reporter != nil {
		params.Reporter.Report("フォーマット処理中...")
	}
	formattedBody, err := formatter.Format(params.Body, params.Format)
	if err != nil {
		return nil, fmt.Errorf("format error: %w", err)
	}
	if params.Reporter != nil {
		params.Reporter.Report("フォーマット完了")
	}

	// 2. Postprocess
	if params.Reporter != nil {
		params.Reporter.Report("postprocess開始")
	}
	processedBody, err := s.app.Postprocess(ctx, formattedBody, params.Reporter)
	if err != nil {
		log.Printf("Postprocess failed: %v", err)
		if params.Reporter != nil {
			params.Reporter.Report(fmt.Sprintf("postprocessエラー: %v（続行）", err))
		}
		// エラーでも続行（現在の挙動を維持）
		processedBody = formattedBody
	} else {
		if params.Reporter != nil {
			params.Reporter.Report("postprocess完了")
		}
	}

	// 3. DB保存
	if params.Reporter != nil {
		params.Reporter.Report("データベース保存中...")
	}

	tx, err := s.app.MainDB().BeginImmediate(ctx)
	if err != nil {
		return nil, fmt.Errorf("transaction start error: %w", err)
	}
	defer tx.Rollback()

	qtx := tx.Q

	summary, imageURL := view.ExtractSummaryAndFirstImage(processedBody, 70)

	// 保存用パラメータの決定
	var date string
	var path string
	var createdAt time.Time
	if params.ID != 0 {
		existing, err := qtx.GetEntryById(ctx, params.ID)
		if err != nil {
			return nil, fmt.Errorf("failed to get existing entry: %w", err)
		}
		date = existing.Date
		path = existing.Path
		createdAt = existing.CreatedAt

		// 下書き(draft)から公開(public/scheduled/reserved)に移行する場合、作成日時を更新する
		if existing.Status == string(maindb.StatusDraft) && status != string(maindb.StatusDraft) {
			createdAt = now
		}

		// パスが未確定の状態で public/scheduled になる場合は、date を「今」にする
		if path == "" && (status == "public" || status == "scheduled") {
			date = now.Format("2006-01-02")
		}

		// reserved への変更時は、既存の date/path を維持する（公開時に CalculateNextPath されるため）
		if status == string(maindb.StatusReserved) {
			// 何もしない（既存の date, path を維持）
		} else if existing.Status == string(maindb.StatusReserved) {
			// reserved から public/scheduled になった場合は新規採番対象
			path = ""
			if status == string(maindb.StatusScheduled) || !params.PublishAt.Valid {
				date = now.Format("2006-01-02")
			} else {
				date = params.PublishAt.Time.Format("2006-01-02")
			}
		}
	} else {
		createdAt = now
		path = ""
		if status == string(maindb.StatusReserved) && params.PublishAt.Valid {
			date = params.PublishAt.Time.Format("2006-01-02")
		} else if status == string(maindb.StatusPublic) && params.PublishAt.Valid {
			date = params.PublishAt.Time.Format("2006-01-02")
		} else {
			date = now.Format("2006-01-02")
		}
	}

	// 公開時、または公開予定パス確定時の自動生成
	if path == "" && (status == "public" || status == "scheduled") {
		path, err = s.CalculateNextPath(ctx, qtx, date)
		if err != nil {
			return nil, fmt.Errorf("path generation error: %w", err)
		}
	}

	var row maindb.Entry
	if params.ID != 0 {
		row, err = qtx.UpdateEntry(ctx, maindb.UpdateEntryParams{
			ID:            params.ID,
			Title:         params.Title,
			Body:          params.Body,
			FormattedBody: processedBody,
			Summary:       summary,
			ImageUrl:      imageURL,
			Path:          path,
			Format:        params.Format,
			Date:          date,
			CreatedAt:     createdAt,
			ModifiedAt:    now,
			PublishAt:     params.PublishAt,
			Status:        status,
		})
	} else {
		row, err = qtx.CreateEntry(ctx, maindb.CreateEntryParams{
			Title:         params.Title,
			Body:          params.Body,
			FormattedBody: processedBody,
			Summary:       summary,
			ImageUrl:      imageURL,
			Path:          path,
			Format:        params.Format,
			Date:          date,
			CreatedAt:     createdAt,
			ModifiedAt:    now,
			PublishAt:     params.PublishAt,
			Status:        status,
		})
	}

	if err != nil {
		return nil, fmt.Errorf("save error: %w", err)
	}

	if err := tx.Commit(); err != nil {
		return nil, fmt.Errorf("commit error: %w", err)
	}

	// 保存後の共通処理
	if params.ID != 0 {
		if err := s.app.InvalidateOGPCache(row.ID); err != nil {
			log.Printf("Failed to invalidate OGP cache: %v", err)
		}
	}

	if row.Status == "public" {
		if err := s.app.EnqueuePublishedEntryJobs(ctx, row.ID); err != nil {
			log.Printf("Failed to enqueue jobs: %v", err)
			if params.Reporter != nil {
				params.Reporter.Report(fmt.Sprintf("警告: 一部の非同期ジョブの投入に失敗しました: %v", err))
			}
		}
	}

	if params.Reporter != nil {
		params.Reporter.Report("保存完了")
	}

	return &row, nil
}

// CalculateNextPath は指定日の既存パスの中から最大の N を探し、N+1 のパスを生成する
func (s *EntryService) CalculateNextPath(ctx context.Context, qtx maindb.Querier, date string) (string, error) {
	paths, err := qtx.ListPathsByDate(ctx, date)
	if err != nil {
		return "", err
	}

	prefix := strings.ReplaceAll(date, "-", "/") + "/"
	maxN := 0

	for _, p := range paths {
		if strings.HasPrefix(p, prefix) {
			nStr := strings.TrimPrefix(p, prefix)
			if n, err := strconv.Atoi(nStr); err == nil {
				if n > maxN {
					maxN = n
				}
			}
		}
	}

	return fmt.Sprintf("%s/%d", strings.ReplaceAll(date, "-", "/"), maxN+1), nil
}

// PublishScheduledEntries は公開予定日時が過ぎたエントリを公開状態にする
func (s *EntryService) PublishScheduledEntries(ctx context.Context) error {
	now := time.Now()
	entries, err := s.app.MainDB().Q.FindScheduledEntriesToPublish(ctx, sql.NullTime{Time: now, Valid: true})
	if err != nil {
		return fmt.Errorf("failed to find scheduled entries: %w", err)
	}

	if len(entries) == 0 {
		return nil
	}

	for _, e := range entries {
		err := func() error {
			// SQLite において、読み取りから書き込みまでの間に他者が割り込まないよう
			// トランザクション開始時に即座に書き込みロックを取得する
			tx, err := s.app.MainDB().BeginImmediate(ctx)
			if err != nil {
				return err
			}
			defer tx.Rollback()

			qtx := tx.Q

			// パスが確定していない「予約投稿 (Reserve)」かどうかを判定する。
			// 詳細は docs/specs/entry-path-logic.md を参照。
			if e.IsReserved() {
				// 予約投稿 (Reserve):
				// 保存時に既存パスがあれば維持されるが、それは無視される。
				// 公開タイミングで、公開予定日の記事数に基づき YYYY/MM/DD/N 形式でパスを強制的に採番・確定させる。
				date := e.PublishAt.Time.Format("2006-01-02")
				// パスを生成 (最大値+1)
				path, err := s.CalculateNextPath(ctx, qtx, date)
				if err != nil {
					return fmt.Errorf("failed to calculate next path for date %s: %w", date, err)
				}
				err = qtx.PublishEntry(ctx, maindb.PublishEntryParams{
					ID:         e.ID,
					Path:       path,
					Date:       date,
					CreatedAt:  now,
					ModifiedAt: now,
				})
				if err != nil {
					return fmt.Errorf("failed to update entry path %d: %w", e.ID, err)
				}
				log.Printf("Published reserved entry %d with path %s", e.ID, path)
			} else {
				// 公開を遅延 (PublishLater):
				// 保存時に既にパスが確定している状態 (IsScheduledLater)。
				// 既存のパスと日付をそのまま渡して公開状態にする。
				err = qtx.PublishEntry(ctx, maindb.PublishEntryParams{
					ID:         e.ID,
					Path:       e.Path,
					Date:       e.Date,
					CreatedAt:  now,
					ModifiedAt: now,
				})
				if err != nil {
					return fmt.Errorf("failed to publish entry %d: %w", e.ID, err)
				}
				log.Printf("Published scheduled entry %d", e.ID)
			}

			return tx.Commit()
		}()

		if err != nil {
			log.Printf("Error publishing entry %d: %v", e.ID, err)
			continue
		}

		if err := s.app.EnqueuePublishedEntryJobs(ctx, e.ID); err != nil {
			log.Printf("Failed to enqueue jobs for entry %d: %v", e.ID, err)
		}
	}

	return nil
}
