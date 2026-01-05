BINARY_NAME=hanrangon
GO_TAGS=sqlite_math_functions

.PHONY: all build test generate fmt clean postprocess-test

all: build

build-fe:
	cd admin-frontend && npm install && npm run build

build: fmt build-fe
	go build -tags "$(GO_TAGS)" -o $(BINARY_NAME) main.go

run:
	go run -tags "$(GO_TAGS)" .

run-with-fe-dev:
	trap 'kill 0' EXIT; \
	(cd admin-frontend && npm run dev) & \
	HANRANGON_FE_DEV=true go run -tags "$(GO_TAGS)" .

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
