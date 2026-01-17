package app

import (
	"context"
	"sort"

	"github.com/cho45/hanrangon/backend/model/imagesdb"
)

type ScoredSimilarImage struct {
	imagesdb.ListSimilarImagesFromCacheBulkRow
}

func (app *AppImpl) findSimilarImagesBulk(ctx context.Context, sourceImages []imagesdb.Image) (map[int64][]ScoredSimilarImage, error) {
	if len(sourceImages) == 0 {
		return make(map[int64][]ScoredSimilarImage), nil
	}

	srcIDs := make([]int64, len(sourceImages))
	srcMap := make(map[int64]imagesdb.Image)
	for i, img := range sourceImages {
		srcIDs[i] = img.ID
		srcMap[img.ID] = img
	}

	rows, err := app.ImagesDB().Q.ListSimilarImagesFromCacheBulk(ctx, srcIDs)
	if err != nil {
		return nil, err
	}

	results := make(map[int64][]ScoredSimilarImage)
	for _, row := range rows {
		if _, ok := srcMap[row.SearchImageID]; !ok {
			continue
		}

		results[row.SearchImageID] = append(results[row.SearchImageID], ScoredSimilarImage{
			ListSimilarImagesFromCacheBulkRow: row,
		})
	}

	for srcID := range results {
		sort.Slice(results[srcID], func(i, j int) bool {
			return results[srcID][i].Score > results[srcID][j].Score
		})

		if len(results[srcID]) > 50 {
			results[srcID] = results[srcID][:50]
		}
	}

	return results, nil
}
