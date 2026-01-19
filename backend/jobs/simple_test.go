package jobs

import (
	"context"
	"encoding/json"
	"testing"

	"github.com/cho45/hanrangon/backend/jobqueue"
)

// TestSimpleJob_Name はジョブ名が正しく返されることを検証する
func TestSimpleJob_Name(t *testing.T) {
	job := NewSimpleJob()

	// Execute: ジョブ名を取得
	got := job.Name()
	want := "SimpleJob"

	// Verify: 正しいジョブ名が返される
	if got != want {
		t.Errorf("Name() = %q, want %q", got, want)
	}
}

// TestSimpleJob_ImplementsJobHandler はJobHandlerインターフェースを実装していることを検証する
func TestSimpleJob_ImplementsJobHandler(t *testing.T) {
	//nolint:staticcheck // 明示的にインターフェースの実装を検証するため型を明示
	var _ jobqueue.JobHandler = NewSimpleJob()
}

// TestSimpleJob_Execute はジョブの実行が正しく行われることを検証する
func TestSimpleJob_Execute(t *testing.T) {
	tests := []struct {
		name        string
		arg         SimpleJobArg
		wantErr     bool
		description string
	}{
		{
			name: "normal message",
			arg: SimpleJobArg{
				Message: "Hello, World!",
			},
			wantErr:     false,
			description: "通常のメッセージが正常に処理される",
		},
		{
			name: "empty message",
			arg: SimpleJobArg{
				Message: "",
			},
			wantErr:     false,
			description: "空のメッセージも正常に処理される",
		},
		{
			name: "long message",
			arg: SimpleJobArg{
				Message: string(make([]byte, 10000)),
			},
			wantErr:     false,
			description: "長いメッセージ（10000バイト）も正常に処理される",
		},
		{
			name: "message with special characters",
			arg: SimpleJobArg{
				Message: "Special chars: \n\t\r\"'<>&",
			},
			wantErr:     false,
			description: "特殊文字を含むメッセージも正常に処理される",
		},
		{
			name: "message with unicode",
			arg: SimpleJobArg{
				Message: "日本語メッセージ 🎉",
			},
			wantErr:     false,
			description: "Unicode文字を含むメッセージも正常に処理される",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// Given: SimpleJobのインスタンスを作成
			job := NewSimpleJob()
			ctx := context.Background()

			// Given: 引数をJSON化
			argJSON, err := json.Marshal(tt.arg)
			if err != nil {
				t.Fatalf("failed to marshal arg: %v", err)
			}

			// When: ジョブを実行
			err = job.Execute(ctx, argJSON)

			// Then: エラー有無を検証
			if (err != nil) != tt.wantErr {
				t.Errorf("Execute() error = %v, wantErr %v (%s)", err, tt.wantErr, tt.description)
			}
		})
	}
}

// TestSimpleJob_Execute_InvalidJSON は不正なJSONでエラーが返されることを検証する
func TestSimpleJob_Execute_InvalidJSON(t *testing.T) {
	tests := []struct {
		name        string
		rawJSON     json.RawMessage
		wantErr     bool
		description string
	}{
		{
			name:        "invalid JSON syntax",
			rawJSON:     json.RawMessage(`{invalid json}`),
			wantErr:     true,
			description: "不正なJSON構文",
		},
		{
			name:        "empty JSON",
			rawJSON:     json.RawMessage(``),
			wantErr:     true,
			description: "空のJSON",
		},
		{
			name:        "null JSON",
			rawJSON:     json.RawMessage(`null`),
			wantErr:     false, // nullは構造体のゼロ値として扱われるため、エラーにならない
			description: "null値のJSON",
		},
		{
			name:        "array instead of object",
			rawJSON:     json.RawMessage(`["not", "an", "object"]`),
			wantErr:     true,
			description: "配列形式のJSON（オブジェクトではない）",
		},
		{
			name:        "wrong type for message field",
			rawJSON:     json.RawMessage(`{"message": 123}`),
			wantErr:     true,
			description: "messageフィールドの型が不正（数値）",
		},
		{
			name:        "wrong type for message field (object)",
			rawJSON:     json.RawMessage(`{"message": {"nested": "object"}}`),
			wantErr:     true,
			description: "messageフィールドの型が不正（オブジェクト）",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// Given: SimpleJobのインスタンスを作成
			job := NewSimpleJob()
			ctx := context.Background()

			// When: 不正なJSONでジョブを実行
			err := job.Execute(ctx, tt.rawJSON)

			// Then: エラー有無を検証
			if (err != nil) != tt.wantErr {
				t.Errorf("Execute() with %s: error = %v, wantErr %v", tt.description, err, tt.wantErr)
			}
		})
	}
}

// TestSimpleJob_Execute_MissingFields は必須フィールドが欠けている場合の挙動を検証する
func TestSimpleJob_Execute_MissingFields(t *testing.T) {
	tests := []struct {
		name        string
		rawJSON     json.RawMessage
		wantErr     bool
		description string
	}{
		{
			name:        "empty object",
			rawJSON:     json.RawMessage(`{}`),
			wantErr:     false, // messageフィールドは省略可能（デフォルト値は空文字列）
			description: "空のオブジェクト（全フィールド省略）",
		},
		{
			name:        "unknown fields are ignored",
			rawJSON:     json.RawMessage(`{"message": "test", "unknown": "field"}`),
			wantErr:     false,
			description: "未知のフィールドは無視される",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// Given: SimpleJobのインスタンスを作成
			job := NewSimpleJob()
			ctx := context.Background()

			// When: フィールドが欠けたJSONでジョブを実行
			err := job.Execute(ctx, tt.rawJSON)

			// Then: エラー有無を検証
			if (err != nil) != tt.wantErr {
				t.Errorf("Execute() with %s: error = %v, wantErr %v", tt.description, err, tt.wantErr)
			}
		})
	}
}

// TestSimpleJob_Execute_ContextCancellation はコンテキストキャンセル時の挙動を検証する
func TestSimpleJob_Execute_ContextCancellation(t *testing.T) {
	// Given: SimpleJobのインスタンスを作成
	job := NewSimpleJob()

	// Given: キャンセル済みコンテキストを作成
	ctx, cancel := context.WithCancel(context.Background())
	cancel() // すぐにキャンセル

	// Given: 正常な引数を準備
	arg := SimpleJobArg{Message: "test"}
	argJSON, err := json.Marshal(arg)
	if err != nil {
		t.Fatalf("failed to marshal arg: %v", err)
	}

	// When: キャンセル済みコンテキストでジョブを実行
	err = job.Execute(ctx, argJSON)

	// Then: 現在の実装ではコンテキストをチェックしていないためエラーは返らない
	// 注: これは実装の現状を文書化するテスト。将来的にコンテキスト対応する場合は
	// このテストを更新し、context.Canceled エラーが返されることを期待する
	if err != nil {
		t.Logf("Execute() with cancelled context returned error: %v (this is acceptable)", err)
	}
}

// TestNewSimpleJob は NewSimpleJob が非nilのJobHandlerを返すことを検証する
func TestNewSimpleJob(t *testing.T) {
	// When: NewSimpleJobを呼び出す
	job := NewSimpleJob()

	// Then: 非nilのJobHandlerが返される
	if job == nil {
		t.Error("NewSimpleJob() returned nil")
	}

	// Then: 正しい型が返される
	if _, ok := job.(*SimpleJob); !ok {
		t.Errorf("NewSimpleJob() returned wrong type: %T", job)
	}
}

// TestSimpleJobArg_JSONMarshaling はSimpleJobArgのJSON変換が正しく行われることを検証する
func TestSimpleJobArg_JSONMarshaling(t *testing.T) {
	tests := []struct {
		name     string
		arg      SimpleJobArg
		wantJSON string
	}{
		{
			name:     "normal message",
			arg:      SimpleJobArg{Message: "hello"},
			wantJSON: `{"message":"hello"}`,
		},
		{
			name:     "empty message",
			arg:      SimpleJobArg{Message: ""},
			wantJSON: `{"message":""}`,
		},
		{
			name:     "message with quotes",
			arg:      SimpleJobArg{Message: `quote "test"`},
			wantJSON: `{"message":"quote \"test\""}`,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// When: SimpleJobArgをJSON化
			gotJSON, err := json.Marshal(tt.arg)
			if err != nil {
				t.Fatalf("Marshal() error = %v", err)
			}

			// Then: 期待されるJSONと一致する
			if string(gotJSON) != tt.wantJSON {
				t.Errorf("Marshal() = %s, want %s", gotJSON, tt.wantJSON)
			}

			// Then: UnmarshalでSimpleJobArgに戻せる
			var gotArg SimpleJobArg
			if err := json.Unmarshal(gotJSON, &gotArg); err != nil {
				t.Fatalf("Unmarshal() error = %v", err)
			}

			// Then: 元の値と一致する
			if gotArg.Message != tt.arg.Message {
				t.Errorf("Unmarshal() Message = %q, want %q", gotArg.Message, tt.arg.Message)
			}
		})
	}
}
