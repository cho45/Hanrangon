package jobqueue

import (
	"fmt"
	"sync"
)

// Registry はジョブタイプを管理するレジストリ
type Registry struct {
	mu       sync.RWMutex
	handlers map[string]JobHandler
}

// NewRegistry は新しいRegistryを作成する
func NewRegistry() *Registry {
	return &Registry{
		handlers: make(map[string]JobHandler),
	}
}

// Register はジョブハンドラをレジストリに登録する
func (r *Registry) Register(handler JobHandler) {
	r.mu.Lock()
	defer r.mu.Unlock()

	name := handler.Name()
	if _, exists := r.handlers[name]; exists {
		panic(fmt.Sprintf("job handler %s is already registered", name))
	}
	r.handlers[name] = handler
}

// Get は名前からジョブハンドラを取得する
func (r *Registry) Get(name string) (JobHandler, bool) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	handler, ok := r.handlers[name]
	return handler, ok
}
