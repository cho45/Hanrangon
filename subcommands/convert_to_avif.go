package subcommands

import (
	"context"
	"flag"
	"fmt"
	"log"
	"os"
	"os/exec"
	"path/filepath"
	"regexp"
	"strings"

	"github.com/cho45/hanrangon/app"
)

// ConvertToAVIFOptions はAVIF変換コマンドのオプション
type ConvertToAVIFOptions struct {
	DryRun   bool // ドライランモード（変更なし）
	Force    bool // 確認なしで実行
	Parallel int  // 並列変換数（常に1、avifencが--jobs 3を使用）
	Backup   bool // マイグレーション前にバックアップを作成
}

// ConvertToAVIF はJPG/JPEG画像をAVIFに変換し、データベースのエントリを書き換える
func ConvertToAVIF(ctx context.Context, application app.App, args []string) error {
	fs := flag.NewFlagSet("convert-to-avif", flag.ExitOnError)
	opts := &ConvertToAVIFOptions{}
	fs.BoolVar(&opts.DryRun, "dry-run", false, "Dry run mode (no actual changes)")
	fs.BoolVar(&opts.Force, "force", false, "Force execution without confirmation")
	fs.BoolVar(&opts.Backup, "backup", false, "Create database backup before conversion")
	opts.Parallel = 1 // 固定値（avifencが--jobs 3を使用するため）
	fs.Parse(args)

	config := application.Config()

	converter := &AVIFConverter{
		app:       application,
		uploadDir: config.UploadDir,
		opts:      opts,
		config:    config,
	}

	// 破壊的な操作には --force または --dry-run が必須
	if !opts.Force && !opts.DryRun {
		fmt.Println("警告: この操作はJPG/JPEG画像をAVIFに変換し、元のJPGファイルを削除します。")
		fmt.Printf("  アップロードディレクトリ: %s\n", config.UploadDir)
		fmt.Println()
		fmt.Println("実際に実行するには --force、動作確認には --dry-run を使用してください。")
		fmt.Println()
		fs.Usage()
		return nil
	}

	if opts.Backup {
		log.Printf("データベースバックアップを作成中...")
		if err := Backup(ctx, application, []string{}); err != nil {
			return fmt.Errorf("backup failed: %w", err)
		}
	}

	if opts.DryRun {
		log.Printf("ドライランモード - 実際の変更は行われません")
	}

	// エントリ単位で処理
	// 理由: 各エントリごとに「変換→DB更新→削除」を完結させることで、
	//       途中で止まっても処理済みエントリは完全に終わっている状態を維持
	if err := converter.ProcessEntries(ctx); err != nil {
		return fmt.Errorf("entry processing failed: %w", err)
	}

	// images.uriを一括更新
	// 理由: すべてのエントリ処理が完了した後に、画像DBも同期する
	if err := converter.UpdateImageURIs(ctx); err != nil {
		log.Printf("警告: 画像URI更新に失敗しました: %v", err)
	}

	// 検証
	if err := converter.Verify(ctx); err != nil {
		log.Printf("警告: 検証に失敗しました: %v", err)
	}

	log.Printf("AVIF変換完了")
	return nil
}

// AVIFConverter はAVIF変換処理を管理する
type AVIFConverter struct {
	app       app.App
	uploadDir string
	opts      *ConvertToAVIFOptions
	config    *app.Config
}

// ProcessEntries はエントリ単位で画像変換を処理する
// 各エントリごとに: 画像抽出 → AVIF変換 → DB更新 → JPG削除を完結させる
func (c *AVIFConverter) ProcessEntries(ctx context.Context) error {
	// .jpg または .jpeg を含むエントリをクエリ
	rows, err := c.app.DB().QueryContext(ctx, `
		SELECT id, path, body, formatted_body
		FROM entries
		WHERE body LIKE '%/images/entry/%.jpg%'
		   OR body LIKE '%/images/entry/%.jpeg%'
		   OR formatted_body LIKE '%/images/entry/%.jpg%'
		   OR formatted_body LIKE '%/images/entry/%.jpeg%'
		ORDER BY id
	`)
	if err != nil {
		return fmt.Errorf("failed to query entries: %w", err)
	}
	defer rows.Close()

	type entry struct {
		id            int64
		path          string
		body          string
		formattedBody string
	}

	var entries []entry
	for rows.Next() {
		var e entry
		if err := rows.Scan(&e.id, &e.path, &e.body, &e.formattedBody); err != nil {
			return fmt.Errorf("failed to scan entry: %w", err)
		}
		entries = append(entries, e)
	}

	if err := rows.Err(); err != nil {
		return fmt.Errorf("failed to iterate entries: %w", err)
	}

	log.Printf("%d個の処理対象エントリを発見しました", len(entries))

	if c.opts.DryRun {
		log.Printf("ドライラン: %d個のエントリを処理します（実際には変更しません）", len(entries))
		return nil
	}

	// avifencコマンドのパスを取得
	avifencPath, err := c.findAVIFEnc()
	if err != nil {
		return fmt.Errorf("avifenc not found: %w", err)
	}

	successCount := 0
	errorCount := 0
	skippedCount := 0

	for i, e := range entries {
		log.Printf("[%d/%d] 処理中 エントリID:%d %s", i+1, len(entries), e.id, e.path)

		// 既に変換済みかチェック
		hasJPG := strings.Contains(e.body, "/images/entry/") && (strings.Contains(e.body, ".jpg") || strings.Contains(e.body, ".jpeg"))
		hasJPGFormatted := strings.Contains(e.formattedBody, "/images/entry/") && (strings.Contains(e.formattedBody, ".jpg") || strings.Contains(e.formattedBody, ".jpeg"))

		if !hasJPG && !hasJPGFormatted {
			log.Printf("  スキップ: 既に変換済み")
			skippedCount++
			continue
		}

		// このエントリで参照されている画像ファイルを抽出
		imageFiles := c.extractImageFiles(e.body, e.formattedBody)
		if len(imageFiles) == 0 {
			log.Printf("  スキップ: 画像ファイルが見つかりませんでした")
			skippedCount++
			continue
		}

		log.Printf("  %d個の画像ファイルを変換します", len(imageFiles))

		// ステップ1: 画像をAVIFに変換
		convertSuccess := true
		for _, imgFile := range imageFiles {
			avifFilename := c.getAVIFFilename(imgFile)
			avifPath := filepath.Join(c.uploadDir, avifFilename)

			// 既にAVIFが存在する場合はスキップ
			if _, err := os.Stat(avifPath); err == nil {
				log.Printf("    %s: 既に存在します", imgFile)
				continue
			}

			// AVIF変換
			if err := c.convertToAVIF(ctx, avifencPath, imgFile); err != nil {
				log.Printf("    %s: 変換エラー: %v", imgFile, err)
				convertSuccess = false
				break
			}
			log.Printf("    %s → %s", imgFile, avifFilename)
		}

		if !convertSuccess {
			log.Printf("  エラー: 画像変換に失敗しました")
			errorCount++
			continue
		}

		// ステップ2: エントリのbodyとformatted_bodyを更新
		newBody := c.rewriteExtensions(e.body)
		newHTML := c.rewriteExtensions(e.formattedBody)

		_, err = c.app.DB().ExecContext(ctx, `
			UPDATE entries
			SET body = ?, formatted_body = ?
			WHERE id = ?
		`, newBody, newHTML, e.id)
		if err != nil {
			log.Printf("  データベース更新エラー: %v", err)
			errorCount++
			continue
		}

		// ステップ3: 元のJPGファイルを削除
		for _, imgFile := range imageFiles {
			jpgPath := filepath.Join(c.uploadDir, imgFile)
			if err := os.Remove(jpgPath); err != nil {
				log.Printf("    %s: 削除エラー: %v", imgFile, err)
				// 削除失敗はエラーとして扱わない（既に変換とDB更新は完了しているため）
			} else {
				log.Printf("    削除: %s", imgFile)
			}
		}

		log.Printf("  完了")
		successCount++
	}

	log.Printf("エントリ処理完了: %d成功, %d失敗, %dスキップ", successCount, errorCount, skippedCount)

	if errorCount > 0 {
		return fmt.Errorf("%d entry processing errors occurred", errorCount)
	}

	return nil
}

// extractImageFiles はbodyとformatted_bodyから/images/entry/配下のJPG/JPEGファイル名を抽出する
func (c *AVIFConverter) extractImageFiles(body, formattedBody string) []string {
	fileSet := make(map[string]bool)

	// 正規表現: src= または href= に続く /images/entry/...jpg または .jpeg (case-insensitive)
	// 3つのパターンをサポート:
	// 1. ダブルクォート: src="/images/entry/xxx.jpg" (引用符まで、スペース可)
	// 2. シングルクォート: src='/images/entry/xxx.jpg' (引用符まで、スペース可)
	// 3. クォートなし: src=/images/entry/xxx.jpg (スペース・>まで、スペース不可)
	// Hatena記法: [f:id:user:timestamp:image /images/entry/xxx.jpg ] も考慮
	re := regexp.MustCompile(`(?i)(?:(?:src|href)=(?:"(/images/entry/[^"]*\.jpe?g)"|'(/images/entry/[^']*\.jpe?g)'|(/images/entry/[^>\s]*\.jpe?g))|(?:\s)(/images/entry/[^\s\]]*\.jpe?g))`)

	// bodyから抽出
	matches := re.FindAllStringSubmatch(body, -1)
	for _, match := range matches {
		// match[1]: double quoted, match[2]: single quoted, match[3]: unquoted (HTML), match[4]: space-delimited (Hatena)
		// いずれか1つだけがマッチする
		for i := 1; i < len(match); i++ {
			if match[i] != "" {
				// /images/entry/ プレフィックスを削除してファイル名を抽出
				filename := strings.TrimPrefix(match[i], "/images/entry/")
				fileSet[filename] = true
				break
			}
		}
	}

	// formatted_bodyから抽出
	matches = re.FindAllStringSubmatch(formattedBody, -1)
	for _, match := range matches {
		for i := 1; i < len(match); i++ {
			if match[i] != "" {
				filename := strings.TrimPrefix(match[i], "/images/entry/")
				fileSet[filename] = true
				break
			}
		}
	}

	// マップからスライスに変換
	files := make([]string, 0, len(fileSet))
	for file := range fileSet {
		files = append(files, file)
	}

	return files
}

// ConvertFiles はJPG/JPEGファイルをAVIFに変換する（未使用、後方互換性のため残す）
func (c *AVIFConverter) ConvertFiles(ctx context.Context) error {
	// JPG/JPEGファイル一覧を取得
	files, err := c.listJPGFiles()
	if err != nil {
		return fmt.Errorf("failed to list JPG files: %w", err)
	}

	if len(files) == 0 {
		log.Printf("変換するJPG/JPEGファイルがありません")
		return nil
	}

	log.Printf("%d個のJPG/JPEGファイルを発見しました", len(files))

	if c.opts.DryRun {
		log.Printf("ドライラン: %d個のファイルをAVIFに変換します（実際には変換しません）", len(files))
		return nil
	}

	// avifencコマンドのパスを取得
	avifencPath, err := c.findAVIFEnc()
	if err != nil {
		return fmt.Errorf("avifenc not found: %w", err)
	}

	successCount := 0
	skipCount := 0
	errorCount := 0

	for i, filename := range files {
		log.Printf("[%d/%d] 変換中 %s...", i+1, len(files), filename)

		// 既にAVIFファイルが存在するかチェック
		avifFilename := c.getAVIFFilename(filename)
		avifPath := filepath.Join(c.uploadDir, avifFilename)
		if _, err := os.Stat(avifPath); err == nil {
			log.Printf("  スキップ: 既に存在します")
			skipCount++
			continue
		}

		// AVIF変換（元ファイルは削除しない）
		if err := c.convertToAVIF(ctx, avifencPath, filename); err != nil {
			log.Printf("  エラー: %v", err)
			errorCount++
			continue
		}

		log.Printf("  完了")
		successCount++
	}

	log.Printf("変換完了: %d成功, %dスキップ, %d失敗", successCount, skipCount, errorCount)

	if errorCount > 0 {
		return fmt.Errorf("%d conversion errors occurred", errorCount)
	}

	return nil
}

// listJPGFiles はアップロードディレクトリ内のJPG/JPEGファイルをリストする
func (c *AVIFConverter) listJPGFiles() ([]string, error) {
	var files []string
	err := filepath.Walk(c.uploadDir, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}
		if !info.IsDir() {
			ext := strings.ToLower(filepath.Ext(path))
			if ext == ".jpg" || ext == ".jpeg" {
				relPath, err := filepath.Rel(c.uploadDir, path)
				if err != nil {
					return err
				}
				files = append(files, relPath)
			}
		}
		return nil
	})
	if err != nil {
		return nil, err
	}
	return files, nil
}

// findAVIFEnc はavifencコマンドのパスを取得する
func (c *AVIFConverter) findAVIFEnc() (string, error) {
	// config.tomlのavifenc_pathを優先
	if c.config.AvifencPath != "" {
		if _, err := os.Stat(c.config.AvifencPath); err == nil {
			return c.config.AvifencPath, nil
		}
	}

	// PATHからavifencを検索
	path, err := exec.LookPath("avifenc")
	if err != nil {
		return "", fmt.Errorf("avifenc not found in PATH and not configured in config.toml")
	}
	return path, nil
}

// getAVIFFilename はJPGファイル名から対応するAVIFファイル名を生成する
func (c *AVIFConverter) getAVIFFilename(jpgFilename string) string {
	ext := filepath.Ext(jpgFilename)
	return strings.TrimSuffix(jpgFilename, ext) + ".avif"
}

// convertToAVIF は単一ファイルをAVIFに変換する
func (c *AVIFConverter) convertToAVIF(ctx context.Context, avifencPath, filename string) error {
	inputPath := filepath.Join(c.uploadDir, filename)
	avifFilename := c.getAVIFFilename(filename)
	outputPath := filepath.Join(c.uploadDir, avifFilename)

	// avifenc実行
	// avifenc --jobs 3 --speed 8 --yuv 420 -q 80 -a tune=ssim --nclx 1/1/1 input.jpg output.avif
	cmd := exec.CommandContext(ctx, avifencPath,
		"--jobs", "3",
		"--speed", "8",
		"--yuv", "420",
		"-q", "80",
		"-a", "tune=ssim",
		"--nclx", "1/1/1",
		inputPath,
		outputPath,
	)

	output, err := cmd.CombinedOutput()
	if err != nil {
		return fmt.Errorf("avifenc failed: %w (output: %s)", err, string(output))
	}

	return nil
}

// RewriteEntries はエントリのbodyとformatted_bodyを書き換える
func (c *AVIFConverter) RewriteEntries(ctx context.Context) error {
	// .jpg または .jpeg を含むエントリをクエリ
	rows, err := c.app.DB().QueryContext(ctx, `
		SELECT id, path, body, formatted_body
		FROM entries
		WHERE body LIKE '%/images/entry/%.jpg%'
		   OR body LIKE '%/images/entry/%.jpeg%'
		   OR formatted_body LIKE '%/images/entry/%.jpg%'
		   OR formatted_body LIKE '%/images/entry/%.jpeg%'
		ORDER BY id
	`)
	if err != nil {
		return fmt.Errorf("failed to query entries: %w", err)
	}
	defer rows.Close()

	type entry struct {
		id            int64
		path          string
		body          string
		formattedBody string
	}

	var entries []entry
	for rows.Next() {
		var e entry
		if err := rows.Scan(&e.id, &e.path, &e.body, &e.formattedBody); err != nil {
			return fmt.Errorf("failed to scan entry: %w", err)
		}
		entries = append(entries, e)
	}

	if err := rows.Err(); err != nil {
		return fmt.Errorf("failed to iterate entries: %w", err)
	}

	log.Printf("%d個の書き換え対象エントリを発見しました", len(entries))

	if c.opts.DryRun {
		log.Printf("ドライラン: %d個のエントリを書き換えます（実際には書き換えません）", len(entries))
		return nil
	}

	successCount := 0
	errorCount := 0
	skippedCount := 0

	for i, e := range entries {
		log.Printf("[%d/%d] 処理中 エントリID:%d %s", i+1, len(entries), e.id, e.path)

		// 既に変換済みかチェック
		hasJPG := strings.Contains(e.body, "/images/entry/") && (strings.Contains(e.body, ".jpg") || strings.Contains(e.body, ".jpeg"))
		hasJPGFormatted := strings.Contains(e.formattedBody, "/images/entry/") && (strings.Contains(e.formattedBody, ".jpg") || strings.Contains(e.formattedBody, ".jpeg"))

		if !hasJPG && !hasJPGFormatted {
			log.Printf("  スキップ: 既に変換済み")
			skippedCount++
			continue
		}

		// bodyを書き換え（拡張子のみ変更）
		newBody := c.rewriteExtensions(e.body)

		// formatted_bodyを書き換え（拡張子のみ変更）
		newHTML := c.rewriteExtensions(e.formattedBody)

		// データベースを更新（bodyとformatted_bodyの両方）
		_, err = c.app.DB().ExecContext(ctx, `
			UPDATE entries
			SET body = ?, formatted_body = ?
			WHERE id = ?
		`, newBody, newHTML, e.id)
		if err != nil {
			log.Printf("  データベース更新エラー: %v", err)
			errorCount++
			continue
		}

		successCount++
	}

	log.Printf("書き換え完了: %d成功, %d失敗, %dスキップ", successCount, errorCount, skippedCount)

	if errorCount > 0 {
		return fmt.Errorf("%d rewrite errors occurred", errorCount)
	}

	return nil
}

// rewriteExtensions は画像の拡張子を.jpg/.jpeg → .avifに書き換える
// /images/entry/ を含むURLのみが対象
func (c *AVIFConverter) rewriteExtensions(text string) string {
	// /images/entry/...jpg" → /images/entry/...avif"
	re1 := regexp.MustCompile(`(/images/entry/[^"'> ]*\.)jpe?g(["'> ])`)
	text = re1.ReplaceAllString(text, "${1}avif$2")

	return text
}

// UpdateImageURIs はimagesデータベースのimages.uriを更新する
func (c *AVIFConverter) UpdateImageURIs(ctx context.Context) error {
	log.Printf("画像URIを更新中...")

	if c.opts.DryRun {
		log.Printf("ドライラン: 画像URIを更新します（実際には更新しません）")
		return nil
	}

	// .jpg → .avif
	result, err := c.app.ImagesDB().ExecContext(ctx, `
		UPDATE images
		SET uri = REPLACE(uri, '.jpg', '.avif')
		WHERE uri LIKE '%/images/entry/%.jpg'
	`)
	if err != nil {
		return fmt.Errorf("failed to update .jpg URIs: %w", err)
	}
	rowsAffected, _ := result.RowsAffected()
	log.Printf("%d個の.jpg画像URIを更新しました", rowsAffected)

	// .jpeg → .avif
	result, err = c.app.ImagesDB().ExecContext(ctx, `
		UPDATE images
		SET uri = REPLACE(uri, '.jpeg', '.avif')
		WHERE uri LIKE '%/images/entry/%.jpeg'
	`)
	if err != nil {
		return fmt.Errorf("failed to update .jpeg URIs: %w", err)
	}
	rowsAffected, _ = result.RowsAffected()
	log.Printf("%d個の.jpeg画像URIを更新しました", rowsAffected)

	return nil
}

// DeleteOriginalFiles は変換済みの元のJPG/JPEGファイルを削除する
func (c *AVIFConverter) DeleteOriginalFiles(ctx context.Context) error {
	// JPG/JPEGファイル一覧を取得
	files, err := c.listJPGFiles()
	if err != nil {
		return fmt.Errorf("failed to list JPG files: %w", err)
	}

	if len(files) == 0 {
		log.Printf("削除するJPG/JPEGファイルがありません")
		return nil
	}

	log.Printf("%d個のJPG/JPEGファイルを削除します", len(files))

	if c.opts.DryRun {
		log.Printf("ドライラン: %d個のファイルを削除します（実際には削除しません）", len(files))
		return nil
	}

	successCount := 0
	errorCount := 0
	skippedCount := 0

	for i, filename := range files {
		log.Printf("[%d/%d] 削除中 %s...", i+1, len(files), filename)

		// 対応するAVIFファイルが存在するかチェック
		avifFilename := c.getAVIFFilename(filename)
		avifPath := filepath.Join(c.uploadDir, avifFilename)
		if _, err := os.Stat(avifPath); err != nil {
			log.Printf("  スキップ: 対応するAVIFファイルが存在しません")
			skippedCount++
			continue
		}

		// JPGファイルを削除
		jpgPath := filepath.Join(c.uploadDir, filename)
		if err := os.Remove(jpgPath); err != nil {
			log.Printf("  エラー: %v", err)
			errorCount++
			continue
		}

		log.Printf("  完了")
		successCount++
	}

	log.Printf("削除完了: %d成功, %d失敗, %dスキップ", successCount, errorCount, skippedCount)

	if errorCount > 0 {
		return fmt.Errorf("%d deletion errors occurred", errorCount)
	}

	return nil
}

// Verify はAVIF変換を検証する
func (c *AVIFConverter) Verify(ctx context.Context) error {
	log.Printf("AVIF変換を検証中...")

	// エントリに残っている .jpg/.jpeg をチェック
	var count int
	err := c.app.DB().QueryRowContext(ctx, `
		SELECT COUNT(*)
		FROM entries
		WHERE (formatted_body LIKE '%/images/entry/%.jpg%' OR formatted_body LIKE '%/images/entry/%.jpeg%')
	`).Scan(&count)
	if err != nil {
		return fmt.Errorf("failed to query entries: %w", err)
	}

	if count > 0 {
		log.Printf("警告: %d個のエントリにまだ .jpg/.jpeg が含まれています", count)
	} else {
		log.Printf("✓ すべてのエントリが変換されました")
	}

	// images.uriに残っている .jpg/.jpeg をチェック
	err = c.app.ImagesDB().QueryRowContext(ctx, `
		SELECT COUNT(*)
		FROM images
		WHERE uri LIKE '%/images/entry/%.jpg' OR uri LIKE '%/images/entry/%.jpeg'
	`).Scan(&count)
	if err != nil {
		return fmt.Errorf("failed to query images: %w", err)
	}

	if count > 0 {
		log.Printf("警告: %d個の画像がまだ .jpg/.jpeg URIを持っています", count)
	} else {
		log.Printf("✓ すべての画像URIが変換されました")
	}

	return nil
}
