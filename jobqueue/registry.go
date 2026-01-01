package jobqueue

import (
	"fmt"
	"sync"
)

// Registry はジョブタイプを管理するレジストリ
type Registry struct {
	mu   sync.RWMutex
	jobs map[string]Job
}

// NewRegistry は新しいRegistryを作成する
func NewRegistry() *Registry {
	return &Registry{
		jobs: make(map[string]Job),
	}
}

// Register はジョブをレジストリに登録する
func (r *Registry) Register(job Job) {
	r.mu.Lock()
	defer r.mu.Unlock()

	name := job.Name()
	if _, exists := r.jobs[name]; exists {
		panic(fmt.Sprintf("job %s is already registered", name))
	}
	r.jobs[name] = job
}

// Get は名前からジョブを取得する
func (r *Registry) Get(name string) (Job, bool) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	job, ok := r.jobs[name]
	return job, ok
}
