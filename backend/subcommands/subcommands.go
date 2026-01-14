package subcommands

import (
	"context"

	"github.com/cho45/hanrangon/backend/app"
)

type Definition struct {
	Name        string
	Description string
	Run         func(ctx context.Context, application app.App, args []string) error
}

var Registered []Definition

func Register(def Definition) {
	Registered = append(Registered, def)
}
