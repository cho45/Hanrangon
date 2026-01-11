# JPEG画像のAVIF変換手順

## 概要

ブログエントリ内のJPEG画像をAVIF形式に変換し、データベースのエントリとメタデータを更新する手順。

**注意**: 現在はJPEG/JPEG形式のみが対象です。PNG画像は対象外です。

## 前提条件

1. `avifenc`コマンドがインストールされていること
   ```bash
   # macOS (Homebrew)
   brew install libavif

   # または確認
   which avifenc
   ```

2. データベースのバックアップが取得されていること

## 実行前の確認

### 1. 対象エントリ数の確認

```sql
SELECT COUNT(*)
FROM entries
WHERE body LIKE '%/images/entry/%.jpg%'
   OR body LIKE '%/images/entry/%.jpeg%'
   OR formatted_body LIKE '%/images/entry/%.jpg%'
   OR formatted_body LIKE '%/images/entry/%.jpeg%';
```

### 2. dry-runで動作確認

```bash
# 最初の1件のみdry-run
./hanrangon convert-to-avif --dry-run --limit 1

# 特定のエントリIDでdry-run（問題が報告されたエントリなど）
./hanrangon convert-to-avif --dry-run --entry-id 12345
```

**確認ポイント**:
- 変換対象のJPEG画像ファイルが正しく抽出されているか
- DB更新対象のエントリURLが正しいか
- 削除される元JPEGファイル数が適切か

## 実行手順

### ステップ1: データベースバックアップ

```bash
./hanrangon backup
```

または手動でバックアップ:
```bash
cp var/db/data.db var/db/data.db.backup-$(date +%Y%m%d-%H%M%S)
cp var/db/images.db var/db/images.db.backup-$(date +%Y%m%d-%H%M%S)
```

### ステップ2: 少数のエントリで試行（推奨）

```bash
# 最初の10件で試行
./hanrangon convert-to-avif --force --limit 10
```

**確認事項**:
- AVIF画像が正しく生成されているか
- 元のJPEG画像が削除されているか
- エントリの表示が正しいか（ブラウザで目視確認）
- エラーログがないか

### ステップ3: 全件実行

```bash
# 全件変換
./hanrangon convert-to-avif --force
```

**処理内容**:
1. 対象エントリの抽出（JPEG/PNG画像を含むエントリ）
2. 各エントリごとに:
   - 画像ファイルをAVIFに変換
   - データベースのエントリ更新（body, formatted_body）
   - 元のJPEG/PNG画像を削除
3. images.uriの一括更新
4. 検証（未変換データの有無確認）

### ステップ4: 検証

```bash
# 未変換のエントリがないか確認
./hanrangon convert-to-avif --verify-only
```

または手動で確認:
```sql
-- JPEG画像が残っているエントリ
SELECT id, path
FROM entries
WHERE formatted_body LIKE '%/images/entry/%.jpg%'
   OR formatted_body LIKE '%/images/entry/%.jpeg%'
LIMIT 10;

-- 画像URIに残っているJPEG
SELECT COUNT(*)
FROM images
WHERE uri LIKE '%/images/entry/%.jpg'
   OR uri LIKE '%/images/entry/%.jpeg';
```

## エラー対処

### avifenc not found

```bash
# avifencのパスを確認
which avifenc

# config.tomlで指定
[app]
avifenc_path = "/path/to/avifenc"
```

### 特定のエントリで変換エラー

```bash
# 該当エントリのみスキップして再実行
# エラーログからエントリIDを確認
./hanrangon convert-to-avif --entry-id 12345 --force
```

### 画像変換エラー

- 元画像が破損している可能性
- 手動で確認:
  ```bash
  # 画像の検証
  file /path/to/image.jpg
  identify /path/to/image.jpg  # ImageMagick
  ```

## ロールバック手順

### データベースのロールバック

```bash
# バックアップから復元
cp var/db/data.db.backup-YYYYMMDD-HHMMSS var/db/data.db
cp var/db/images.db.backup-YYYYMMDD-HHMMSS var/db/images.db

# アプリケーションの再起動
sudo systemctl restart hanrangon
```

### 画像ファイルの復元

AVIF変換では元のJPEG画像が削除されるため、ロールバック前に別途バックアップを取得しておくことを推奨:

```bash
# 事前バックアップ（推奨）
rsync -av var/upload/ var/upload.backup-$(date +%Y%m%d-%H%M%S)/
```

## チェックリスト

- [ ] データベースバックアップ取得
- [ ] 画像ファイルバックアップ取得（オプション）
- [ ] avifencコマンド確認
- [ ] dry-runで動作確認
- [ ] 少数エントリで試行
- [ ] 全件実行
- [ ] 検証実行
- [ ] ブラウザで表示確認
- [ ] エラーログ確認

## 参考情報

### コマンドオプション

```bash
./hanrangon convert-to-avif --help
```

| オプション | 説明 |
|-----------|------|
| `--dry-run` | 実際の変更を行わず、処理内容のみ表示 |
| `--force` | 確認なしで実行 |
| `--limit N` | 処理するエントリ数の上限（ID昇順） |
| `--entry-id N` | 特定のエントリIDのみ処理 |
| `--backup` | 実行前に自動バックアップ |

### AVIF変換設定

`convertToAVIF`関数で使用されるavifencパラメータ:
- `--jobs 3`: 並列処理数
- `--speed 8`: エンコード速度（8=高速）
- `--yuv 420`: 色空間
- `-q 80`: 品質（80/100）
- `-a tune=ssim`: SSIM最適化
- `--nclx 1/1/1`: 色空間指定

### ファイルサイズ削減効果

一般的にAVIF変換により:
- JPEG比: 30-50%のファイルサイズ削減

ブラウザ対応:
- Chrome/Edge: 85+
- Firefox: 93+
- Safari: 16+
