package jobqueue

import (
	"context"
	"encoding/json"
)

// JobHandler はジョブキューで実行されるジョブのハンドラインターフェース
type JobHandler interface {
	// Name はジョブの名前を返す
	Name() string

	// Execute はジョブを実行する
	// argはJSON形式のジョブ引数
	Execute(ctx context.Context, arg json.RawMessage) error
}
