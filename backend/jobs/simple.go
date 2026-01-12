package jobs

import (
	"context"
	"encoding/json"
	"log"

	"github.com/cho45/hanrangon/backend/jobqueue"
)

// SimpleJob はテスト用のシンプルなジョブ
type SimpleJob struct{}

// SimpleJobArg はSimpleJobの引数
type SimpleJobArg struct {
	Message string `json:"message"`
}

// NewSimpleJob は新しいSimpleJobを作成する
func NewSimpleJob() jobqueue.JobHandler {
	return &SimpleJob{}
}

// Name はジョブ名を返す
func (j *SimpleJob) Name() string {
	return "SimpleJob"
}

// Execute はジョブを実行する
func (j *SimpleJob) Execute(ctx context.Context, arg json.RawMessage) error {
	var params SimpleJobArg
	if err := json.Unmarshal(arg, &params); err != nil {
		return err
	}

	log.Printf("SimpleJob executed: %s", params.Message)
	return nil
}
