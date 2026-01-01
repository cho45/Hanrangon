package jobqueue

import (
	"context"
	"encoding/json"
)

// Job はジョブキューで実行されるジョブのインターフェース
type Job interface {
	// Name はジョブの名前を返す
	Name() string

	// Execute はジョブを実行する
	// argはJSON形式のジョブ引数
	Execute(ctx context.Context, arg json.RawMessage) error
}
