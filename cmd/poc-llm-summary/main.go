package main

import (
	"bytes"
	"context"
	"database/sql"
	"encoding/json"
	"flag"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"strconv"
	"strings"

	"github.com/cho45/hanrangon/backend/app"
	"github.com/cho45/hanrangon/backend/model"
	_ "github.com/mattn/go-sqlite3"
)

// OpenAI APIのリクエスト構造体
type ChatCompletionRequest struct {
	Model    string `json:"model"`
	Messages []struct {
		Role    string `json:"role"`
		Content string `json:"content"`
	} `json:"messages"`
	MaxTokens int `json:"max_tokens"`
}

// OpenAI APIのレスポンス構造体
type ChatCompletionResponse struct {
	Choices []struct {
		Message struct {
			Content string `json:"content"`
		} `json:"message"`
	} `json:"choices"`
}

func main() {
	// コマンドライン引数の解析
	entryID := flag.String("entry", "", "Entry ID to summarize")
	apiEndpoint := flag.String("endpoint", "https://api.ai.sakura.ad.jp/v1/chat/completions", "API endpoint")
	modelName := flag.String("model", "llm-jp-3.1-8x13b-instruct4", "Model name")
	flag.Parse()

	if *entryID == "" {
		log.Fatal("Entry ID is required")
	}

	// エントリIDを整数に変換
	id, err := strconv.ParseInt(*entryID, 10, 64)
	if err != nil {
		log.Fatalf("Invalid entry ID: %v", err)
	}

	// 設定の読み込み
	config := app.LoadConfig()

	// データベース接続
	db, err := openDB("sqlite3", config.DataDBPath)
	if err != nil {
		log.Fatalf("Failed to open database: %v", err)
	}
	defer db.Close()

	queries := model.New(db)
	entry, err := queries.GetEntryById(context.Background(), id)
	if err != nil {
		log.Fatalf("Failed to get entry: %v", err)
	}

	// OpenAI互換APIの設定
	apiKey := os.Getenv("OPENAI_API_KEY")
	if apiKey == "" {
		log.Fatal("OPENAI_API_KEY environment variable is required")
	}

	// 改善されたプロンプトの作成
	prompt := fmt.Sprintf(`あなたはプロの編集者です。
ユーザーが入力した日記の本文をもとに、要約文を作成してください

# 制約条件
- **文字数**: 70文字程度（60文字〜80文字以内）に厳密に収めること
- **内容**: 記事の核心を突き、重要なポイントを1つだけ含めること
- **禁止事項**:
  - ハッシュタグ禁止
  - 絵文字は禁止
  - 不要な装飾表現は禁止
  - 誇張表現は禁止
  - 広告的表現は禁止
- **文体**:
  - 体言止め
- **言語**: 日本語で作成

# 出力形式
プログラム処理のためこの形式に厳密に従うこと
<summary>要約プレーンテキスト</summary>

# 以下本文:
%s`, entry.Body)

	// OpenAI互換APIにリクエストを送信
	request := ChatCompletionRequest{
		Model: *modelName,
		Messages: []struct {
			Role    string `json:"role"`
			Content string `json:"content"`
		}{
			{
				Role:    "user",
				Content: prompt,
			},
		},
		MaxTokens: 100,
	}

	jsonData, err := json.Marshal(request)
	if err != nil {
		log.Fatalf("Failed to marshal request: %v", err)
	}

	req, err := http.NewRequest("POST", *apiEndpoint, bytes.NewBuffer(jsonData))
	if err != nil {
		log.Fatalf("Failed to create request: %v", err)
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", apiKey))

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		log.Fatalf("Failed to send request: %v", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		log.Fatalf("Failed to read response: %v", err)
	}

	if resp.StatusCode != http.StatusOK {
		log.Fatalf("API request failed with status %d: %s", resp.StatusCode, string(body))
	}

	var response ChatCompletionResponse
	err = json.Unmarshal(body, &response)
	if err != nil {
		log.Fatalf("Failed to unmarshal response: %v", err)
	}

	if len(response.Choices) == 0 {
		log.Fatal("No choices in response")
	}

	// 生成されたサマリーを表示
	summary := response.Choices[0].Message.Content
	fmt.Printf("Generated summary (%d chars): %s\n", len(summary), summary)
}

func openDB(driver, path string) (*sql.DB, error) {
	dsn := path
	if !strings.Contains(path, "?") {
		dsn += "?_loc=Asia/Tokyo"
	} else {
		dsn += "&_loc=Asia/Tokyo"
	}
	db, err := sql.Open(driver, dsn)
	if err != nil {
		return nil, fmt.Errorf("failed to open db (%s): %w", dsn, err)
	}

	if err := db.Ping(); err != nil {
		return nil, fmt.Errorf("failed to ping db (%s): %w", path, err)
	}

	return db, nil
}
