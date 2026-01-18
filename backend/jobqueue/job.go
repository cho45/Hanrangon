package jobqueue

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	workerdb "github.com/cho45/hanrangon/backend/model/workerdb"
)

// Condition は依存ジョブの実行条件
type Condition string

const (
	ConditionCompleted Condition = "completed" // 親が正常終了した場合
	ConditionFinished  Condition = "finished"  // 親が終了（成功または失敗）した場合
)

// OnFail は親が失敗した時の振る舞い
type OnFail string

const (
	OnFailFail   OnFail = "fail"   // 親が失敗したら自分も失敗にする
	OnFailIgnore OnFail = "ignore" // 親が失敗しても条件が満たされれば実行する
)

// Strategy は複数の依存関係がある場合の評価戦略
type Strategy string

const (
	StrategyAll Strategy = "all" // 全ての依存関係が満たされたら実行
	StrategyAny Strategy = "any" // いずれか1つの依存関係が満たされたら実行
)

// Dependency は単一のジョブへの依存関係
type Dependency struct {
	ID        int64     `json:"id"`
	Condition Condition `json:"condition"`
	OnFail    OnFail    `json:"on_fail"`
}

// DependsOn はジョブ全体の依存関係定義
type DependsOn struct {
	Dependencies []Dependency `json:"dependencies"`
	Strategy     Strategy     `json:"strategy"`
}

// EvaluateResult は依存関係の評価結果
type EvaluateResult string

const (
	EvaluateReady EvaluateResult = "ready" // 実行可能
	EvaluateWait  EvaluateResult = "wait"  // 待機が必要
	EvaluateFail  EvaluateResult = "fail"  // 親の失敗により実行不可
)

// Evaluate は親ジョブの状態に基づいて依存関係を評価する
func (d *DependsOn) Evaluate(parentJobs map[int64]workerdb.Job) EvaluateResult {
	if len(d.Dependencies) == 0 {
		return EvaluateReady
	}

	strategy := d.Strategy
	if strategy == "" {
		strategy = StrategyAll
	}

	readyCount := 0
	for _, dep := range d.Dependencies {
		parent, ok := parentJobs[dep.ID]

		// 親が見つからない場合は正常終了（クリーンアップ済み）とみなす
		if !ok {
			readyCount++
			continue
		}

		isFinished := parent.Status == "completed" || parent.Status == "failed"
		isCompleted := parent.Status == "completed"
		isFailed := parent.Status == "failed"

		// 失敗伝播のチェック
		if isFailed && dep.OnFail == OnFailFail {
			return EvaluateFail
		}

		satisfied := false
		switch dep.Condition {
		case ConditionCompleted:
			satisfied = isCompleted
		case ConditionFinished:
			satisfied = isFinished
		default:
			satisfied = isCompleted
		}

		if satisfied {
			readyCount++
		}
	}

	switch strategy {
	case StrategyAny:
		if readyCount > 0 {
			return EvaluateReady
		}
	case StrategyAll:
		if readyCount == len(d.Dependencies) {
			return EvaluateReady
		}
	}

	return EvaluateWait
}

// Merge は新しい依存関係を現在のものにマージする（重複排除）
func (d *DependsOn) Merge(other *DependsOn) {
	if other == nil {
		return
	}

	existing := make(map[int64]bool)
	for _, dep := range d.Dependencies {
		existing[dep.ID] = true
	}

	for _, dep := range other.Dependencies {
		if !existing[dep.ID] {
			d.Dependencies = append(d.Dependencies, dep)
			existing[dep.ID] = true
		}
	}

	if other.Strategy != "" {
		d.Strategy = other.Strategy
	} else if d.Strategy == "" {
		d.Strategy = StrategyAll
	}
}

// ParseDependsOn は JSON 文字列を DependsOn 構造体にパースする
func ParseDependsOn(s string) (*DependsOn, error) {
	if s == "" || s == "null" {
		return &DependsOn{}, nil
	}
	var d DependsOn
	if err := json.Unmarshal([]byte(s), &d); err != nil {
		return nil, fmt.Errorf("failed to parse depends_on: %w", err)
	}
	return &d, nil
}

// DetectCircularDependency は循環依存を検出する
// jobDependencies はジョブIDからそのジョブの依存先ジョブIDのマップ
func DetectCircularDependency(jobID int64, jobDependencies map[int64][]int64, visited, inPath map[int64]bool) bool {
	visited[jobID] = true
	inPath[jobID] = true

	for _, depID := range jobDependencies[jobID] {
		if !visited[depID] {
			if DetectCircularDependency(depID, jobDependencies, visited, inPath) {
				return true
			}
		} else if inPath[depID] {
			return true
		}
	}

	inPath[jobID] = false
	return false
}

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
