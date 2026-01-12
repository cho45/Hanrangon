package jobqueue

import (
	"context"
	"encoding/json"
	"time"
)

// JobHandler はジョブキューで実行されるジョブのハンドラインターフェース
type JobHandler interface {
	// Name はジョブの名前を返す
	Name() string

	// Execute はジョブを実行する
	// argはJSON形式のジョブ引数
	Execute(ctx context.Context, arg json.RawMessage) error
}

// JobHandlerWithTimeout はタイムアウトを持つジョブハンドラのオプショナルインターフェース
// このインターフェースを実装しない場合は、デフォルトタイムアウト（5分）が適用される
type JobHandlerWithTimeout interface {
	JobHandler
	// Timeout はこのジョブの最大実行時間を返す
	Timeout() time.Duration
}
