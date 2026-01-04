# Nogag から Hanrangon へのマイグレーション手順

Perl 版 Nogag から Go 版 Hanrangon へ移行するための詳細な作業手順です。
作業ディレクトリ: `/srv/www/lowreal.net/Hanrangon`
ユーザー: `cho45`

## 1. 環境構築

### 1.1 ディレクトリ作成と権限設定
```bash	
mkdir -p var/db
mkdir -p static/images/entry
# 権限の確認 (cho45 が書き込み可能であること)
chmod -R 755 var/db static/images/entry
```

### 1.2 設定ファイルの作成
```bash
cp config.toml.sample config.toml
# vi config.toml で username, password, DBパス等を確認

# session_secret の生成
head /dev/random| sha256sum
```


config.toml
```
data_db_path = "var/db/data.db"
images_db_path = "var/db/images.db"
tfidf_db_path = "var/db/tfidf.db"
worker_db_path = "var/db/worker.db"
static_dir = "static"
upload_dir = "/data/public/images"

# Network
listen = ":5000"
base_url = "https://lowreal.net"

# Authentication
username = "admin"
password = "changeme"
session_secret = "your-random-secret-here"

```

### 1.3 Node.js 依存関係のインストール
```bash
cd postprocess
npm install
cd ..
```

### 1.4 バイナリのビルド
```bash
make
```

## 2. データベースの初期化・移行

### 2.1 メインデータのタイムゾーン修正 (Data DB)
旧環境からコピーした `data.db` に対して実施します。
```bash
cp ../Nogag/db/data.db var/db/
sqlite3 var/db/data.db < db/migration/000-timezone-fix.sql
```

### 2.2 新規データベースの作成 (Worker, Images, TF-IDF)
```bash
# Worker DB (ジョブキュー)
rm -f var/db/worker.db
sqlite3 var/db/worker.db < db/schema/worker.sql

# Images DB
rm -f var/db/images.db
sqlite3 var/db/images.db < db/schema/images.sql

# TF-IDF DB
rm -f var/db/tfidf.db
sqlite3 var/db/tfidf.db < db/schema/tfidf.sql
```


## 4. インデックスの再構築

```
hanrangon recalc-tfidf --force
```

## 5. サービスの起動

### 5.1 systemd ユニットの設置
```bash
sudo cp deploy/hanrangon.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable hanrangon
sudo systemctl start hanrangon
```

### 5.2 ログの監視
ジョブが順次実行される様子を監視します。
```bash
sudo journalctl -u hanrangon -f
```
