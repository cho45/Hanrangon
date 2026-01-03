# 各種ツールのバイナリを公式イメージから取得
FROM golang:1.24 AS go-dist
FROM sqlc/sqlc:latest AS sqlc-dist

# ベースに debian-slim を使用
FROM debian:bookworm-slim

# Go と sqlc を配置
COPY --from=go-dist /usr/local/go /usr/local/go
COPY --from=sqlc-dist /workspace/sqlc /usr/local/bin/sqlc
ENV PATH="/usr/local/go/bin:${PATH}"

# キャッシュディレクトリの設定
# 名前付きボリュームを /go にマウントすることを想定
ENV GOPATH=/go
ENV GOCACHE=/go/cache
ENV CGO_ENABLED=1
ENV GOOS=linux

# CGO (sqlite3) に必要なビルドツールと、依存解決用の証明書をインストール
RUN apt-get update && apt-get install -y \
    gcc \
    libc6-dev \
    libsqlite3-dev \
    pkg-config \
    ca-certificates \
    make \
    && rm -rf /var/lib/apt/lists/*

# 実行時にソースコードをマウントするディレクトリ
WORKDIR /app

# デフォルトで sqlc generate と make build を実行
CMD ["/bin/sh", "-c", "make generate build"]