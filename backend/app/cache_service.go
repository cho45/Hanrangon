package app

import (
	"context"
	"database/sql"
	"fmt"

	"github.com/cho45/hanrangon/backend/model/cachedb"
)

// CacheService はページキャッシュを管理するサービス
type CacheService struct {
	queries cachedb.Querier
}

// NewCacheService は CacheService を生成
func NewCacheService(queries cachedb.Querier) *CacheService {
	return &CacheService{
		queries: queries,
	}
}

// Set はキャッシュを保存し、依存関係を登録
func (s *CacheService) Set(ctx context.Context, key string, content []byte, sourceIDs []string) error {
	// 既存のキャッシュと依存関係を削除 (TRIGGER で cache_relation も削除される)
	if err := s.queries.DeleteCache(ctx, key); err != nil && err != sql.ErrNoRows {
		return fmt.Errorf("failed to delete existing cache: %w", err)
	}

	// 新しいキャッシュを保存
	if err := s.queries.InsertCache(ctx, cachedb.InsertCacheParams{
		CacheKey: key,
		Content:  content,
	}); err != nil {
		return fmt.Errorf("failed to insert cache: %w", err)
	}

	// 新しい依存関係を登録
	for _, sourceID := range sourceIDs {
		if err := s.queries.InsertCacheRelation(ctx, cachedb.InsertCacheRelationParams{
			CacheKey: key,
			SourceID: sourceID,
		}); err != nil {
			return fmt.Errorf("failed to insert cache relation: %w", err)
		}
	}

	return nil
}

// Get はキャッシュを取得
func (s *CacheService) Get(ctx context.Context, key string) ([]byte, error) {
	content, err := s.queries.GetCache(ctx, key)
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
	if err := s.queries.DeleteCache(ctx, key); err != nil {
		return fmt.Errorf("failed to delete cache: %w", err)
	}

	return nil
}

// InvalidateBySourceID は依存キーから一括無効化
func (s *CacheService) InvalidateBySourceID(ctx context.Context, sourceID string) error {
	// TRIGGER により cache も自動削除される
	if err := s.queries.DeleteCacheRelationsBySourceID(ctx, sourceID); err != nil {
		return fmt.Errorf("failed to delete cache relations: %w", err)
	}

	return nil
}
