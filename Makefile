BINARY_NAME=hanrangon
GO_TAGS=sqlite_math_functions

.PHONY: all build test generate fmt clean postprocess-test setup watch run

all: build

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

watch:
	trap 'kill 0' EXIT; \
	(cd admin-frontend && npm run dev) & \
	air || go run github.com/air-verse/air@latest

test:
	go test -tags "$(GO_TAGS)" ./...

generate:
	sqlc generate

fmt:
	goimports -w .

postprocess-test:
	cd postprocess && npm test

clean:
	rm -f $(BINARY_NAME)
	go clean
