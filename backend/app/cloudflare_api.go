package app

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"
)

type OperationStat struct {
	ActionType string `json:"action_type"`
	Requests   int64  `json:"requests"`
}

type R2UsageStats struct {
	StorageUsageBytes int64           `json:"storage_usage_bytes"`
	ObjectCount       int64           `json:"object_count"`
	Operations        []OperationStat `json:"operations"`
}

type cloudflareGraphQLResponse struct {
	Data struct {
		Viewer struct {
			Accounts []struct {
				R2StorageAdaptiveGroups []struct {
					Max struct {
						PayloadSize int64 `json:"payloadSize"`
						ObjectCount int64 `json:"objectCount"`
					} `json:"max"`
				} `json:"r2StorageAdaptiveGroups"`
				R2OperationsAdaptiveGroups []struct {
					Sum struct {
						Requests int64 `json:"requests"`
					} `json:"sum"`
					Dimensions struct {
						ActionType string `json:"actionType"`
					} `json:"dimensions"`
				} `json:"r2OperationsAdaptiveGroups"`
			} `json:"accounts"`
		} `json:"viewer"`
	} `json:"data"`
	Errors []struct {
		Message string `json:"message"`
	} `json:"errors"`
}

var cfAPIEndpoint = "https://api.cloudflare.com/client/v4/graphql"

func (app *AppImpl) GetR2Usage(ctx context.Context) (*R2UsageStats, error) {
	if app.config.CFAPIToken == "" || app.config.CFAccountID == "" || app.config.R2BucketName == "" {
		return nil, fmt.Errorf("cloudflare API configuration incomplete")
	}

	// 当月の統計を取得 (UTC基準)
	now := time.Now().UTC()
	startTime := time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, time.UTC)
	formattedStart := startTime.Format(time.RFC3339)

	query := `
	query GetR2Usage($accountTag: String!, $bucketName: String!, $datetimeStart: DateTime!) {
	  viewer {
		accounts(filter: {accountTag: $accountTag}) {
		  r2StorageAdaptiveGroups(
			filter: { bucketName: $bucketName, datetime_gt: $datetimeStart }
			limit: 1,
			orderBy: [datetime_DESC]
		  ) {
			dimensions {
			  datetime
			}
			max {
			  payloadSize
			  objectCount
			}
		  }
		  r2OperationsAdaptiveGroups(
			filter: { bucketName: $bucketName, datetime_gt: $datetimeStart }
			limit: 100
		  ) {
			sum {
			  requests
			}
			dimensions {
			  actionType
			}
		  }
		}
	  }
	}`

	variables := map[string]interface{}{
		"accountTag":    app.config.CFAccountID,
		"bucketName":    app.config.R2BucketName,
		"datetimeStart": formattedStart,
	}

	requestBody, err := json.Marshal(map[string]interface{}{
		"query":     query,
		"variables": variables,
	})
	if err != nil {
		return nil, err
	}

	req, err := http.NewRequestWithContext(ctx, "POST", cfAPIEndpoint, bytes.NewBuffer(requestBody))
	if err != nil {
		return nil, err
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+app.config.CFAPIToken)

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("cloudflare API error: status %d, body: %s", resp.StatusCode, string(body))
	}

	var gqlResp cloudflareGraphQLResponse
	if err := json.Unmarshal(body, &gqlResp); err != nil {
		return nil, err
	}

	if len(gqlResp.Errors) > 0 {
		return nil, fmt.Errorf("cloudflare GraphQL error: %s", gqlResp.Errors[0].Message)
	}

	if len(gqlResp.Data.Viewer.Accounts) == 0 {
		return nil, fmt.Errorf("no data found for account %s", app.config.CFAccountID)
	}

	acc := gqlResp.Data.Viewer.Accounts[0]
	stats := &R2UsageStats{
		Operations: []OperationStat{},
	}

	if len(acc.R2StorageAdaptiveGroups) > 0 {
		stats.StorageUsageBytes = acc.R2StorageAdaptiveGroups[0].Max.PayloadSize
		stats.ObjectCount = acc.R2StorageAdaptiveGroups[0].Max.ObjectCount
	}

	for _, op := range acc.R2OperationsAdaptiveGroups {
		stats.Operations = append(stats.Operations, OperationStat{
			ActionType: op.Dimensions.ActionType,
			Requests:   op.Sum.Requests,
		})
	}

	return stats, nil
}
