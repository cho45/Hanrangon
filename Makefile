BINARY_NAME=hanrangon
GO_TAGS=sqlite_math_functions

.PHONY: all build test test-go admin-test generate generate-icons fmt clean postprocess-test setup watch run lint

all: build

lint:
	@command -v golangci-lint >/dev/null 2>&1 || { echo "golangci-lint not found. Please install it: https://golangci-lint.run/docs/welcome/install/local/"; exit 1; }
	golangci-lint run

setup:
	go install github.com/air-verse/air@latest
	go install github.com/sqlc-dev/sqlc/cmd/sqlc@latest
	go install golang.org/x/tools/cmd/goimports@latest

build-fe:
	cd admin-frontend && npm install && npm run build

build-be:
	go build -tags "$(GO_TAGS)" -o $(BINARY_NAME) main.go

build: fmt build-fe build-be

run:
	go run -tags "$(GO_TAGS)" .

pprof:
	PPROF=true HANRANGON_ENV=production air

watch:
	trap 'kill 0' EXIT; \
	(cd admin-frontend && npm run dev) & \
	HANRANGON_FE_DEV=true air

test: test-go postprocess-test admin-test

test-go:
	go test -tags "$(GO_TAGS)" ./...

generate:
	sqlc generate

generate-icons:
	cd scripts && npm install && npm run generate-icons

fmt:
	goimports -w .

ogp-base:
	convert static/images/ogp.png -resize 1200x630 static/images/ogp_base.png
	optipng -o7 static/images/ogp_base.png

postprocess-test:
	cd postprocess && npm test

admin-test:
	cd admin-frontend && npm test

clean:
	rm -f $(BINARY_NAME)
	go clean