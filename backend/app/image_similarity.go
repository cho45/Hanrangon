package app

import (
	"context"
	"encoding/binary"
	"math/bits"
	"sort"

	"github.com/cho45/hanrangon/backend/model"
)

// ScoredSimilarImage represents a similar image with its Jaccard similarity score.
type ScoredSimilarImage struct {
	model.ListSimilarImagesByImageIDsRow
	Jaccard float64 `json:"jaccard"`
}

// calculateJaccard calculates the Jaccard similarity coefficient between two 64-bit signatures.
func calculateJaccard(sig1, sig2 []byte) (float64, int) {
	if len(sig1) != 8 || len(sig2) != 8 {
		return 0, 0
	}
	s1 := binary.BigEndian.Uint64(sig1)
	s2 := binary.BigEndian.Uint64(sig2)

	intersection := bits.OnesCount64(s1 & s2)
	union := bits.OnesCount64(s1 | s2)

	if union == 0 {
		return 0, 0
	}
	return float64(intersection) / float64(union), intersection
}

// findSimilarImagesBulk finds similar images for multiple source images in a single bulk operation.
// Returns a map where the key is the source search_image_id.
func (app *AppImpl) findSimilarImagesBulk(ctx context.Context, sourceImages []model.Image) (map[int64][]ScoredSimilarImage, error) {
	if len(sourceImages) == 0 {
		return make(map[int64][]ScoredSimilarImage), nil
	}

	srcIDs := make([]int64, len(sourceImages))
	srcMap := make(map[int64]model.Image)
	for i, img := range sourceImages {
		srcIDs[i] = img.ID
		srcMap[img.ID] = img
	}

	// Bulk fetch candidates from database (SQL handles Hamming distance filtering)
	rows, err := app.imagesQueries.ListSimilarImagesByImageIDs(ctx, srcIDs)
	if err != nil {
		return nil, err
	}

	results := make(map[int64][]ScoredSimilarImage)
	for _, row := range rows {
		srcImg, ok := srcMap[row.SearchImageID]
		if !ok {
			continue
		}

		jaccard, intersection := calculateJaccard(srcImg.Sig, row.Sig)

		// Apply Jaccard threshold (Jaccard >= 0.25)
		if jaccard >= 0.25 {
			results[row.SearchImageID] = append(results[row.SearchImageID], ScoredSimilarImage{
				ListSimilarImagesByImageIDsRow: row,
				Jaccard:                        jaccard,
			})
		}
		_ = intersection // intersection can be used for tie-breaking if needed
	}

	// Sort results for each source image by Jaccard similarity descending
	for srcID := range results {
		sort.Slice(results[srcID], func(i, j int) bool {
			if results[srcID][i].Jaccard != results[srcID][j].Jaccard {
				return results[srcID][i].Jaccard > results[srcID][j].Jaccard
			}
			// Tie-breaker: prefer higher raw intersection count
			return bits.OnesCount64(binary.BigEndian.Uint64(results[srcID][i].Sig)&binary.BigEndian.Uint64(srcMap[srcID].Sig)) >
				bits.OnesCount64(binary.BigEndian.Uint64(results[srcID][j].Sig)&binary.BigEndian.Uint64(srcMap[srcID].Sig))
		})

		// Limit to 50 results per source image (admin use case)
		if len(results[srcID]) > 50 {
			results[srcID] = results[srcID][:50]
		}
	}

	return results, nil
}
