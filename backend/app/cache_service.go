package app

import (
	"context"
	"database/sql"
	"fmt"

	"github.com/cho45/hanrangon/backend/model"
	"github.com/cho45/hanrangon/backend/model/cachedb"
)

// CacheService はページキャッシュを管理するサービス
type CacheService struct {
	db *model.Database[cachedb.Querier]
}

// NewCacheService は CacheService を生成
func NewCacheService(db *model.Database[cachedb.Querier]) *CacheService {
	return &CacheService{
		db: db,
	}
}

// Set はキャッシュを保存し、依存関係を登録
func (s *CacheService) Set(ctx context.Context, key string, content []byte, sourceIDs []string) error {
	return s.db.WithTx(ctx, func(q cachedb.Querier) error {
		// 既存の依存関係を明示的に削除 (トリガーによる連鎖削除の混乱を防ぐ)
		if err := q.DeleteCacheRelationsByCacheKey(ctx, key); err != nil {
			return fmt.Errorf("failed to delete old relations: %w", err)
		}

		// キャッシュを保存 (既存があれば置換)
		if err := q.InsertCache(ctx, cachedb.InsertCacheParams{
			CacheKey: key,
			Content:  content,
		}); err != nil {
			return fmt.Errorf("failed to insert cache: %w", err)
		}

		// 新しい依存関係を登録
		for _, sourceID := range sourceIDs {
			if err := q.InsertCacheRelation(ctx, cachedb.InsertCacheRelationParams{
				CacheKey: key,
				SourceID: sourceID,
			}); err != nil {
				return fmt.Errorf("failed to insert cache relation: %w", err)
			}
		}
		return nil
	})
}

// Get はキャッシュを取得
func (s *CacheService) Get(ctx context.Context, key string) ([]byte, error) {
	content, err := s.db.Q.GetCache(ctx, key)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, err
		}
		return nil, fmt.Errorf("failed to get cache: %w", err)
	}

	return content, nil
}

// InvalidateByKey はキーを指定してキャッシュを無効化
func (s *CacheService) InvalidateByKey(ctx context.Context, key string) error {
	if err := s.db.Q.DeleteCache(ctx, key); err != nil {
		return fmt.Errorf("failed to delete cache: %w", err)
	}

	return nil
}

// InvalidateBySourceID は依存キーから一括無効化
func (s *CacheService) InvalidateBySourceID(ctx context.Context, sourceID string) error {
	// TRIGGER により cache も自動削除される
	if err := s.db.Q.DeleteCacheRelationsBySourceID(ctx, sourceID); err != nil {
		return fmt.Errorf("failed to delete cache relations: %w", err)
	}

	return nil
}
