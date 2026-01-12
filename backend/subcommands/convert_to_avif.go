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

	"github.com/cho45/hanrangon/backend/app"
)

// ConvertToAVIFOptions はAVIF変換コマンドのオプション
type ConvertToAVIFOptions struct {
	DryRun   bool  // ドライランモード（変更なし）
	Force    bool  // 確認なしで実行
	Parallel int   // 並列変換数（常に1、avifencが--jobs 3を使用）
	Backup   bool  // マイグレーション前にバックアップを作成
	Limit    int   // 処理するエントリ数の上限（0=無制限、ID昇順で古いものから処理）
	EntryID  int64 // 特定のエントリIDのみを処理（0=無効）
	Verify   bool  // 検証のみ実行
}

// ConvertToAVIF はJPG/JPEG画像をAVIFに変換し、データベースのエントリを書き換える
func ConvertToAVIF(ctx context.Context, application app.App, args []string) error {
	fs := flag.NewFlagSet("convert-to-avif", flag.ExitOnError)
	opts := &ConvertToAVIFOptions{}
	fs.BoolVar(&opts.DryRun, "dry-run", false, "Dry run mode (no actual changes)")
	fs.BoolVar(&opts.Force, "force", false, "Force execution without confirmation")
	fs.BoolVar(&opts.Backup, "backup", false, "Create database backup before conversion")
	fs.IntVar(&opts.Limit, "limit", 0, "Limit number of entries to process (0=unlimited, processes oldest entries first by ID)")
	fs.Int64Var(&opts.EntryID, "entry-id", 0, "Process only the entry with this ID (0=disabled)")
	fs.BoolVar(&opts.Verify, "verify", false, "Run only verification to check for missing files or pending conversions")
	opts.Parallel = 1 // 固定値（avifencが--jobs 3を使用するため）
	fs.Parse(args)

	config := application.Config()

	converter := &AVIFConverter{
		app:       application,
		uploadDir: config.UploadDir,
		opts:      opts,
		config:    config,
	}

	// 検証のみ実行する場合
	if opts.Verify {
		return converter.Verify(ctx)
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

	// 検証
	// 理由: すべての変換が完了した後に、残っている未変換データがないか確認
	// ただし、dry-run、limit、entry-id指定時は部分的な処理なので検証をスキップ
	if !opts.DryRun && opts.Limit == 0 && opts.EntryID == 0 {
		if err := converter.Verify(ctx); err != nil {
			log.Printf("警告: 検証に失敗しました: %v", err)
		}
	} else if opts.DryRun {
		log.Printf("ドライランモードのため検証をスキップします")
	} else if opts.Limit > 0 {
		log.Printf("--limit指定のため検証をスキップします（部分的な処理のみ実行）")
	} else if opts.EntryID > 0 {
		log.Printf("--entry-id指定のため検証をスキップします（単一エントリのみ処理）")
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
	// ID昇順（古いものから）処理し、オプションでLIMITまたはEntryIDを適用
	var query string
	if c.opts.EntryID > 0 {
		// 特定のエントリIDのみを処理
		query = fmt.Sprintf(`
			SELECT id, path, body, formatted_body
			FROM entries
			WHERE id = %d
			  AND (body LIKE '%%/images/entry/%%.jpg%%'
			       OR body LIKE '%%/images/entry/%%.jpeg%%'
			       OR formatted_body LIKE '%%/images/entry/%%.jpg%%'
			       OR formatted_body LIKE '%%/images/entry/%%.jpeg%%')
		`, c.opts.EntryID)
	} else {
		// 通常の処理（全件またはLIMIT付き）
		query = `
			SELECT id, path, body, formatted_body
			FROM entries
			WHERE body LIKE '%/images/entry/%.jpg%'
			   OR body LIKE '%/images/entry/%.jpeg%'
			   OR formatted_body LIKE '%/images/entry/%.jpg%'
			   OR formatted_body LIKE '%/images/entry/%.jpeg%'
			ORDER BY id
		`
		if c.opts.Limit > 0 {
			query += fmt.Sprintf(" LIMIT %d", c.opts.Limit)
		}
	}

	rows, err := c.app.DB().QueryContext(ctx, query)
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
	}

	// avifencコマンドのパスを取得（dry-runモードでは不要だがエラーチェックのため取得）
	var avifencPath string
	if !c.opts.DryRun {
		var err error
		avifencPath, err = c.findAVIFEnc()
		if err != nil {
			return fmt.Errorf("avifenc not found: %w", err)
		}
	}

	successCount := 0
	errorCount := 0
	skippedCount := 0

	for i, e := range entries {
		log.Printf("[%d/%d] 処理中 エントリID:%d %s", i+1, len(entries), e.id, e.path)

		// このエントリで参照されているローカルの画像ファイルを抽出
		imageFiles := c.extractImageFiles(e.body, e.formattedBody)
		if len(imageFiles) == 0 {
			log.Printf("  スキップ: 変換対象の画像（/images/entry/*.jpg）が見つかりませんでした")
			skippedCount++
			continue
		}

		log.Printf("  %d個の画像ファイルを変換します", len(imageFiles))

		// ドライランモードの場合は、ここで詳細を表示してスキップ
		if c.opts.DryRun {
			for _, imgFile := range imageFiles {
				avifFilename := c.getAVIFFilename(imgFile)
				jpgPath := filepath.Join(c.uploadDir, imgFile)
				var oldSize int64
				if info, err := os.Stat(jpgPath); err == nil {
					oldSize = info.Size()
				}
				log.Printf("    [dry-run] %s (%s) → %s", imgFile, humanSize(oldSize), avifFilename)
			}
			// BaseURL + entries.path でURLを出力
			baseURL := strings.TrimSuffix(c.app.Config().BaseURL, "/")
			entryURL := fmt.Sprintf("%s/%s", baseURL, e.path)
			log.Printf("  [dry-run] DB更新対象: %s", entryURL)
			log.Printf("  [dry-run] 元ファイル削除: %d個", len(imageFiles))
			successCount++
			continue
		}

		// ステップ1: 画像をAVIFに変換
		convertSuccess := true
		for _, imgFile := range imageFiles {
			avifFilename := c.getAVIFFilename(imgFile)
			avifPath := filepath.Join(c.uploadDir, avifFilename)
			jpgPath := filepath.Join(c.uploadDir, imgFile)

			var oldSize int64
			if info, err := os.Stat(jpgPath); err == nil {
				oldSize = info.Size()
			}

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

			var newSize int64
			if info, err := os.Stat(avifPath); err == nil {
				newSize = info.Size()
			}

			reduction := 0.0
			if oldSize > 0 {
				reduction = float64(newSize) / float64(oldSize) * 100
			}

			log.Printf("    %s → %s (%s → %s, %.1f%%)", imgFile, avifFilename, humanSize(oldSize), humanSize(newSize), reduction)
		}

		if !convertSuccess {
			log.Printf("  エラー: 画像変換に失敗しました")
			errorCount++
			continue
		}

		// ステップ2: エントリのbodyとformatted_bodyを更新
		newBody := c.rewriteExtensions(e.body)
		newHTML := c.rewriteExtensions(e.formattedBody)

		_, err := c.app.DB().ExecContext(ctx, `
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

		// ステップ4: 画像URIを更新
		if err := c.UpdateImageURIsForEntry(ctx, e.id); err != nil {
			log.Printf("  画像URI更新エラー: %v", err)
			errorCount++
			continue
		}

		// BaseURL + entries.path でURLを出力（確認しやすいように）
		baseURL := strings.TrimSuffix(c.app.Config().BaseURL, "/")
		entryURL := fmt.Sprintf("%s/%s", baseURL, e.path)
		log.Printf("  完了: %s", entryURL)
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

	// bodyから抽出（HTMLコメントとCDATAセクションを除去してから処理）
	cleanBody := c.removeCommentsAndCDATA(body)
	matches := re.FindAllStringSubmatch(cleanBody, -1)
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

	// formatted_bodyから抽出（HTMLコメントとCDATAセクションを除去してから処理）
	cleanFormattedBody := c.removeCommentsAndCDATA(formattedBody)
	matches = re.FindAllStringSubmatch(cleanFormattedBody, -1)
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

// removeCommentsAndCDATA はHTMLコメントとCDATAセクションを空文字列に置換する
func (c *AVIFConverter) removeCommentsAndCDATA(html string) string {
	// HTMLコメント <!-- ... --> を削除
	commentRe := regexp.MustCompile(`<!--[\s\S]*?-->`)
	html = commentRe.ReplaceAllString(html, "")

	// CDATAセクション <![CDATA[ ... ]]> を削除
	cdataRe := regexp.MustCompile(`<!\[CDATA\[[\s\S]*?\]\]>`)
	html = cdataRe.ReplaceAllString(html, "")

	return html
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
		"--yuv", "444",
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

// rewriteExtensions は画像の拡張子を.jpg/.jpeg → .avifに書き換える
// /images/entry/ を含むURLのみが対象
func (c *AVIFConverter) rewriteExtensions(text string) string {
	// /images/entry/...jpg" → /images/entry/...avif"
	// 大文字小文字を区別しない (?i) を追加
	re1 := regexp.MustCompile(`(?i)(/images/entry/[^"'> ]*\.)jpe?g(["'> ])`)
	text = re1.ReplaceAllString(text, "${1}avif$2")

	return text
}

// UpdateImageURIsForEntry は特定の画像データベースのエントリのimages.uriを更新する
func (c *AVIFConverter) UpdateImageURIsForEntry(ctx context.Context, entryID int64) error {
	if c.opts.DryRun {
		return nil
	}

	// .jpg / .JPG → .avif
	// SQLiteのREPLACEはCase-Sensitiveなので、大文字小文字両方を個別に、または正規表現置換があればそれを使う
	// ここでは単純に.jpgと.JPG、.jpegと.JPEGを個別に置換する（より確実）
	replacements := []string{".jpg", ".JPG", ".jpeg", ".JPEG"}
	for _, ext := range replacements {
		_, err := c.app.ImagesDB().ExecContext(ctx, fmt.Sprintf(`
			UPDATE images
			SET uri = REPLACE(uri, '%s', '.avif')
			WHERE entry_id = ? AND uri LIKE '%%/images/entry/%%%s'
		`, ext, ext), entryID)
		if err != nil {
			return fmt.Errorf("failed to update %s URIs for entry %d: %w", ext, entryID, err)
		}
	}

	return nil
}

// Verify はAVIF変換を検証し、DBに参照があるのに実体がないファイルなどをレポートする
func (c *AVIFConverter) Verify(ctx context.Context) error {
	log.Printf("AVIF変換を検証中...")

	rows, err := c.app.DB().QueryContext(ctx, `
		SELECT id, path, body, formatted_body
		FROM entries
		WHERE (body LIKE '%/images/entry/%.jpg%' OR body LIKE '%/images/entry/%.jpeg%' OR
		       formatted_body LIKE '%/images/entry/%.jpg%' OR formatted_body LIKE '%/images/entry/%.jpeg%')
	`)
	if err != nil {
		return fmt.Errorf("failed to query entries: %w", err)
	}
	defer rows.Close()

	missingCount := 0
	totalEntriesWithJPG := 0
	for rows.Next() {
		var id int
		var path, body, formattedBody string
		if err := rows.Scan(&id, &path, &body, &formattedBody); err != nil {
			return err
		}

		imageFiles := c.extractImageFiles(body, formattedBody)
		if len(imageFiles) == 0 {
			continue // 実際のローカルJPGがなければスキップ
		}
		totalEntriesWithJPG++

		for _, imgFile := range imageFiles {
			jpgPath := filepath.Join(c.uploadDir, imgFile)
			if _, err := os.Stat(jpgPath); os.IsNotExist(err) {
				avifFilename := c.getAVIFFilename(imgFile)
				avifPath := filepath.Join(c.uploadDir, avifFilename)
				hasAVIF := "なし"
				if _, err := os.Stat(avifPath); err == nil {
					hasAVIF = "あり"
				}

				log.Printf("[欠落] エントリID:%d (%s) 画像: %s (AVIF:%s)", id, path, imgFile, hasAVIF)
				missingCount++
			}
		}
	}

	if totalEntriesWithJPG > 0 {
		log.Printf("警告: %d個のエントリにまだ .jpg/.jpeg 参照が残っています", totalEntriesWithJPG)
	} else {
		log.Printf("✓ すべてのエントリのDB更新が完了しています")
	}

	if missingCount > 0 {
		log.Printf("⚠ 合計 %d 個の参照されている元画像ファイルが見つかりませんでした", missingCount)
	}

	// images.uriに残っている .jpg/.jpeg をチェック
	rows, err = c.app.ImagesDB().QueryContext(ctx, `
		SELECT entry_id, uri
		FROM images
		WHERE uri LIKE '%/images/entry/%.jpg' OR uri LIKE '%/images/entry/%.jpeg'
	`)
	if err != nil {
		return fmt.Errorf("failed to query images: %w", err)
	}
	defer rows.Close()

	imageURICount := 0
	missingImageFiles := 0
	for rows.Next() {
		var entryID int
		var uri string
		if err := rows.Scan(&entryID, &uri); err != nil {
			return err
		}

		// /images/entry/ 以外の外部URLなどはスキップ
		if !strings.HasPrefix(uri, "/images/entry/") {
			continue
		}
		imageURICount++

		filename := strings.TrimPrefix(uri, "/images/entry/")
		jpgPath := filepath.Join(c.uploadDir, filename)
		if _, err := os.Stat(jpgPath); os.IsNotExist(err) {
			log.Printf("[欠落] imagesテーブル EntryID:%d URI: %s", entryID, uri)
			missingImageFiles++
		}
	}

	if imageURICount > 0 {
		log.Printf("警告: %d個の画像URI（imagesテーブル）がまだ .jpg/.jpeg を指しています", imageURICount)
	} else {
		log.Printf("✓ すべての画像URIの変換が完了しています")
	}

	if missingImageFiles > 0 {
		log.Printf("⚠ imagesテーブルで参照されている %d 個のファイルが見つかりませんでした", missingImageFiles)
	}

	return nil
}

func humanSize(b int64) string {
	const unit = 1024
	if b < unit {
		return fmt.Sprintf("%d B", b)
	}
	div, exp := int64(unit), 0
	for n := b / unit; n >= unit; n /= unit {
		div *= unit
		exp++
	}
	return fmt.Sprintf("%.1f %cB", float64(b)/float64(div), "KMGTPE"[exp])
}
