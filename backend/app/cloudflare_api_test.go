package app

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestGetR2Usage(t *testing.T) {
	// Cloudflare GraphQL API のモックレスポンス
	mockResponse := map[string]interface{}{
		"data": map[string]interface{}{
			"viewer": map[string]interface{}{
				"accounts": []map[string]interface{}{
					{
						"r2StorageAdaptiveGroups": []map[string]interface{}{
							{
								"dimensions": map[string]interface{}{
									"datetime": "2026-01-13T00:00:00Z",
								},
								"max": map[string]interface{}{
									"payloadSize": int64(1024 * 1024 * 100),
									"objectCount": int64(500),
								},
							},
						},
						"r2OperationsAdaptiveGroups": []map[string]interface{}{
							{
								"sum": map[string]interface{}{
									"requests": int64(1000),
								},
								"dimensions": map[string]interface{}{
									"actionType": "PutObject",
								},
							},
							{
								"sum": map[string]interface{}{
									"requests": int64(5000),
								},
								"dimensions": map[string]interface{}{
									"actionType": "GetObject",
								},
							},
						},
					},
				},
			},
		},
	}

	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		assert.Equal(t, "POST", r.Method)
		assert.Equal(t, "Bearer test-token", r.Header.Get("Authorization"))

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(mockResponse)
	}))
	defer server.Close()

	// テスト用の AppImpl を作成
	config := &Config{
		CFAPIToken:   "test-token",
		CFAccountID:  "test-account",
		R2BucketName: "test-bucket",
	}
	app := &AppImpl{
		config: config,
	}

	// URL をテストサーバーのものに差し替える
	originalEndpoint := cfAPIEndpoint
	cfAPIEndpoint = server.URL
	defer func() { cfAPIEndpoint = originalEndpoint }()

	// 実際のテスト実行
	ctx := context.Background()
	stats, err := app.GetR2Usage(ctx)
	assert.NoError(t, err)
	assert.Equal(t, int64(1024*1024*100), stats.StorageUsageBytes)
	assert.Equal(t, int64(500), stats.ObjectCount)
	assert.Equal(t, 2, len(stats.Operations))

	foundPut := false
	foundGet := false
	for _, op := range stats.Operations {
		if op.ActionType == "PutObject" {
			assert.Equal(t, int64(1000), op.Requests)
			foundPut = true
		}
		if op.ActionType == "GetObject" {
			assert.Equal(t, int64(5000), op.Requests)
			foundGet = true
		}
	}
	assert.True(t, foundPut)
	assert.True(t, foundGet)
}
