package tfidf

import (
	"context"
	"database/sql"
	"fmt"
	"log"

	"github.com/cho45/hanrangon/backend/model/tfidfdb"
)

// SimilarityCalculator はエントリ間の類似度計算を処理
type SimilarityCalculator struct {
	db            *sql.DB
	queries       tfidfdb.Querier
	MinValidTerms int
}

func NewSimilarityCalculator(db *sql.DB, queries tfidfdb.Querier) *SimilarityCalculator {
	return &SimilarityCalculator{
		db:      db,
		queries: queries,
		// MinValidTerms は類似度計算を行うために必要な最小の有効ターム数。
		// 文字 2-gram 方式において、有効なターム（tfidf_n > 0）が 20 個未満のエントリは、
		// 意味のあるトピックを持たない短い定型文（例: 「2009年12月12日撮影」のみのエントリ）とみなす。
		// 20 個の 2-gram は実質的に約 20〜30 文字のユニークなテキスト量に相当。
		MinValidTerms: 20,
	}
}

type SimilarEntry struct {
	EntryID int64
	Score   float64
}

const (
	// MinValidTermsForSimilarity は類似度計算を行うために必要な最小の有効ターム数 (tfidf_n > 0)。
	// 文字 2-gram 方式において、有効なタームが 20 個未満のエントリは、
	// 意味のあるトピックを持たない短い定型文（例: 「2009年12月12日撮影」のみのエントリ）とみなす。
	// 20 個の 2-gram は実質的に約 20〜30 文字のユニークなテキスト量に相当。
	MinValidTermsForSimilarity = 20
)

// CalculateSimilarEntry は指定された単一エントリの類似エントリを計算
func (s *SimilarityCalculator) CalculateSimilarEntry(ctx context.Context, entryID int64) error {
	return s.CalculateSimilarEntries(ctx, []int64{entryID})
}

// CalculateSimilarEntries は複数のエントリの類似エントリを一括で計算
func (s *SimilarityCalculator) CalculateSimilarEntries(ctx context.Context, entryIDs []int64) error {
	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback()

	for _, entryID := range entryIDs {
		if err := s.calculateForEntryTx(ctx, tx, entryID); err != nil {
			return fmt.Errorf("failed to calculate for entry %d: %w", entryID, err)
		}
	}

	if err := tx.Commit(); err != nil {
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	return nil
}

// calculateForEntryTx はトランザクション内で単一エントリの類似エントリを計算
func (s *SimilarityCalculator) calculateForEntryTx(ctx context.Context, tx *sql.Tx, entryID int64) error {
	// エントリが十分な情報（tfidf_n > 0 のターム）を持っているか確認。
	// 情報不足のエントリに対して計算を行うと、無関係なエントリが「類似」としてヒットしやすくなるため。
	var validTermCount int
	err := tx.QueryRowContext(ctx, `SELECT COUNT(*) FROM (SELECT 1 FROM postings WHERE entry_id = ? AND tfidf_n > 0 LIMIT ?)`, entryID, s.MinValidTerms).Scan(&validTermCount)
	if err != nil {
		return fmt.Errorf("failed to check valid term count: %w", err)
	}

	if validTermCount < s.MinValidTerms {
		// 有意義な類似性を見つけるための情報が不足。
		// 既存の関連エントリを削除して終了。
		_, err = tx.ExecContext(ctx, `DELETE FROM related_entries WHERE entry_id = ?`, entryID)
		if err != nil {
			return fmt.Errorf("failed to clear related entries for short entry: %w", err)
		}
		log.Printf("Skipping similarity calculation for short entry %d (valid terms: %d)", entryID, validTermCount)
		return nil
	}

	// 一時テーブル similar_candidate を作成
	// 対象エントリと少なくとも 3 つのタームを共有する候補エントリを抽出
	_, err = tx.ExecContext(ctx, `DROP TABLE IF EXISTS similar_candidate`)
	if err != nil {
		return fmt.Errorf("failed to drop similar_candidate table: %w", err)
	}

	// 候補テーブルの作成条件:
	// 1. entry_id > (target - 1000) :
	//    全件比較を避けるためのヒューリスティックな制限。
	//    ブログの性質上、関連エントリは比較的近い時期に書かれることが多いため、
	//    過去 1000 件程度に絞ることで計算コストを大幅に削減しつつ、実用的な精度を維持する。
	// 2. 対象エントリの上位 50 タームのいずれかを共有:
	//    重要度の低いタームでの一致を無視し、特徴的な単語での一致を優先。
	// 3. 少なくとも 3 つのタームを共有 (cnt > 3):
	//    1つや2つの Bigram の一致は偶然（助詞の連続など）である可能性が高いため、
	//    ノイズ除去のために 3 つ以上の共有を必須とする。
	// 上位 100 件の候補に制限
	_, err = tx.ExecContext(ctx, `
		CREATE TEMPORARY TABLE similar_candidate AS
			SELECT entry_id, COUNT(*) as cnt FROM postings
			WHERE
				entry_id > ? AND
				term_id IN (
					SELECT term_id FROM postings WHERE entry_id = ?
					ORDER BY tfidf_n DESC
					LIMIT 50
				)
			GROUP BY entry_id
			HAVING cnt > 3
			ORDER BY cnt DESC
			LIMIT 100
	`, entryID-1000, entryID)
	if err != nil {
		return fmt.Errorf("failed to create similar_candidate table: %w", err)
	}

	// コサイン類似度スコアを計算
	// 正規化済みベクトルのため、内積がそのままコサイン類似度になる
	// SUM(a.tfidf_n * b.tfidf_n) = cosine similarity
	type scoreResult struct {
		EntryID int64
		Score   float64
	}

	rows, err := tx.QueryContext(ctx, `
		SELECT
			entry_id AS eid,
			SUM(a.tfidf_n * b.tfidf_n) AS score
		FROM (
			(SELECT term_id, tfidf_n FROM postings WHERE entry_id = ? ORDER BY tfidf_n DESC LIMIT 50) as a
			INNER JOIN
			(SELECT entry_id, term_id, tfidf_n FROM postings WHERE entry_id IN (SELECT entry_id FROM similar_candidate)) as b
			ON
			a.term_id = b.term_id
		)
		WHERE eid != ?
		GROUP BY entry_id
		ORDER BY score DESC
		LIMIT 10
	`, entryID, entryID)

	if err != nil {
		return fmt.Errorf("failed to calculate similarity scores: %w", err)
	}
	defer rows.Close()

	var scores []scoreResult
	for rows.Next() {
		var sr scoreResult
		if err := rows.Scan(&sr.EntryID, &sr.Score); err != nil {
			return fmt.Errorf("failed to scan score result: %w", err)
		}
		scores = append(scores, sr)
	}
	if err := rows.Err(); err != nil {
		return fmt.Errorf("error iterating scores: %w", err)
	}

	// 既存の関連エントリを削除
	_, err = tx.ExecContext(ctx, `DELETE FROM related_entries WHERE entry_id = ?`, entryID)
	if err != nil {
		return fmt.Errorf("failed to delete existing related entries: %w", err)
	}

	// 新しい関連エントリを挿入
	if len(scores) > 0 {
		for _, score := range scores {
			_, err := tx.ExecContext(ctx, `
				INSERT INTO related_entries (entry_id, related_entry_id, score)
				VALUES (?, ?, ?)
			`, entryID, score.EntryID, score.Score)
			if err != nil {
				return fmt.Errorf("failed to insert related entry: %w", err)
			}
		}
	}

	return nil
}
