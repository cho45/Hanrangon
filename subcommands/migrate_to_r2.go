package subcommands

import (
	"bytes"
	"context"
	"flag"
	"fmt"
	"log"
	"mime"
	"net/http"
	"os"
	"path/filepath"
	"regexp"
	"strings"

	"github.com/cho45/hanrangon/app"
	"golang.org/x/net/html"
	"golang.org/x/net/html/atom"
)

// MigrateToR2Options はマイグレーションコマンドのオプション
type MigrateToR2Options struct {
	DryRun   bool // ドライランモード（変更なし）
	Force    bool // 確認なしで実行
	Verify   bool // 検証のみ（マイグレーションなし）
	Parallel int  // 並列アップロード数
	Backup   bool // マイグレーション前にバックアップを作成
	Limit    int  // 処理するエントリ数の上限（0=無制限、ID昇順で古いものから処理）
}

// MigrateToR2 はローカル画像をR2に移行し、データベースのエントリを書き換える
func MigrateToR2(ctx context.Context, application app.App, args []string) error {
	fs := flag.NewFlagSet("migrate-to-r2", flag.ExitOnError)
	opts := &MigrateToR2Options{}
	fs.BoolVar(&opts.DryRun, "dry-run", false, "Dry run mode (no actual changes)")
	fs.BoolVar(&opts.Force, "force", false, "Force execution without confirmation")
	fs.BoolVar(&opts.Verify, "verify-only", false, "Verify only (no migration)")
	fs.IntVar(&opts.Parallel, "parallel", 4, "Number of parallel uploads")
	fs.BoolVar(&opts.Backup, "backup", false, "Create database backup before migration")
	fs.IntVar(&opts.Limit, "limit", 0, "Limit number of entries to process (0=unlimited, processes oldest entries first by ID)")
	fs.Parse(args)

	config := application.Config()

	// R2設定の検証
	if config.R2EndpointURL == "" || config.R2AccessKeyID == "" ||
		config.R2SecretAccessKey == "" || config.R2BucketName == "" {
		return fmt.Errorf("R2 configuration is incomplete. Please configure R2 settings in config.toml")
	}

	// R2ストレージの初期化
	r2Storage, err := app.NewR2Storage(
		config.R2EndpointURL,
		config.R2AccessKeyID,
		config.R2SecretAccessKey,
		config.R2BucketName,
		config.R2PublicURL,
	)
	if err != nil {
		return fmt.Errorf("failed to initialize R2 storage: %w", err)
	}

	migrator := &Migrator{
		app:         application,
		r2Storage:   r2Storage,
		r2PublicURL: config.R2PublicURL,
		uploadDir:   config.UploadDir,
		opts:        opts,
	}

	if opts.Verify {
		log.Printf("検証のみを実行...")
		return migrator.Verify(ctx)
	}

	// 破壊的な操作には --force または --dry-run が必須
	if !opts.Force && !opts.DryRun {
		fmt.Println("警告: この操作はすべてのローカル画像をR2に移行し、データベースエントリを更新します。")
		fmt.Printf("  アップロードディレクトリ: %s\n", config.UploadDir)
		fmt.Printf("  R2公開URL: %s\n", config.R2PublicURL)
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

	// エントリ単位でアトミックに処理
	// 各エントリごとに: 画像抽出 → R2アップロード → DB更新を完結させる
	if err := migrator.ProcessEntries(ctx); err != nil {
		return fmt.Errorf("entry processing failed: %w", err)
	}

	// images.uriを一括更新
	// 理由: エントリ本文の書き換えが完了した後に、画像DBも同期する
	//       REPLACEによる一括更新なので高速
	if err := migrator.UpdateImageURIs(ctx); err != nil {
		return fmt.Errorf("image URI update failed: %w", err)
	}

	// 検証
	// 理由: すべての移行が完了した後に、残っている未移行データがないか確認
	if err := migrator.Verify(ctx); err != nil {
		log.Printf("警告: 検証に失敗しました: %v", err)
	}

	log.Printf("マイグレーション完了")
	return nil
}

// Migrator はマイグレーション処理を管理する
type Migrator struct {
	app         app.App
	r2Storage   app.StorageClient
	r2PublicURL string
	uploadDir   string
	opts        *MigrateToR2Options
}

// ProcessEntries はエントリ単位で画像移行を処理する
// 各エントリごとに: 画像抽出 → R2アップロード → DB更新を完結させる
func (m *Migrator) ProcessEntries(ctx context.Context) error {
	// /images/entry/を含むエントリをクエリ
	// ID昇順（古いものから）処理し、オプションでLIMITを適用
	query := `
		SELECT id, path, body, formatted_body
		FROM entries
		WHERE body LIKE '%/images/entry/%' OR formatted_body LIKE '%/images/entry/%'
		ORDER BY id
	`
	if m.opts.Limit > 0 {
		query += fmt.Sprintf(" LIMIT %d", m.opts.Limit)
	}

	rows, err := m.app.DB().QueryContext(ctx, query)
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

	if m.opts.DryRun {
		log.Printf("ドライラン: %d個のエントリを処理します（実際には変更しません）", len(entries))
		return nil
	}

	successCount := 0
	errorCount := 0
	skippedCount := 0

	for i, e := range entries {
		log.Printf("[%d/%d] 処理中 エントリID:%d %s", i+1, len(entries), e.id, e.path)

		// 既に移行済みかチェック
		if !strings.Contains(e.body, "/images/entry/") && !strings.Contains(e.formattedBody, "/images/entry/") {
			log.Printf("  スキップ: 既に移行済み")
			skippedCount++
			continue
		}

		// このエントリで参照されている画像ファイルを抽出
		imageFiles := m.extractImageFiles(e.body, e.formattedBody)
		if len(imageFiles) == 0 {
			log.Printf("  スキップ: 画像ファイルが見つかりませんでした")
			skippedCount++
			continue
		}

		log.Printf("  %d個の画像ファイルをアップロードします", len(imageFiles))

		// ステップ1: 画像をR2にアップロード
		uploadSuccess := true
		for _, imgFile := range imageFiles {
			// R2に既に存在するかチェック
			exists, err := m.existsOnR2(ctx, imgFile)
			if err != nil {
				log.Printf("    %s: 存在確認エラー: %v", imgFile, err)
			} else if exists {
				log.Printf("    %s: 既に存在します", imgFile)
				continue
			}

			// R2にアップロード
			if err := m.uploadFile(ctx, imgFile); err != nil {
				log.Printf("    %s: アップロードエラー: %v", imgFile, err)
				uploadSuccess = false
				break
			}
			log.Printf("    %s → R2", imgFile)
		}

		if !uploadSuccess {
			log.Printf("  エラー: 画像アップロードに失敗しました")
			errorCount++
			continue
		}

		// ステップ2: エントリのbodyとformatted_bodyを更新
		newBody := e.body
		if strings.Contains(e.body, "/images/entry/") {
			newBody = RewriteBodyImageURLs(e.body, m.r2PublicURL)
		}

		newHTML := e.formattedBody
		if strings.Contains(e.formattedBody, "/images/entry/") {
			var err error
			newHTML, err = RewriteImageURLs(e.formattedBody, m.r2PublicURL)
			if err != nil {
				log.Printf("  HTMLパースエラー: %v", err)
				errorCount++
				continue
			}
		}

		_, err = m.app.DB().ExecContext(ctx, `
			UPDATE entries
			SET body = ?, formatted_body = ?
			WHERE id = ?
		`, newBody, newHTML, e.id)
		if err != nil {
			log.Printf("  データベース更新エラー: %v", err)
			errorCount++
			continue
		}

		// BaseURL + entries.path でURLを出力（確認しやすいように）
		baseURL := m.app.Config().BaseURL
		entryURL := fmt.Sprintf("%s%s", strings.TrimSuffix(baseURL, "/"), e.path)
		log.Printf("  完了: %s", entryURL)
		successCount++
	}

	log.Printf("エントリ処理完了: %d成功, %d失敗, %dスキップ", successCount, errorCount, skippedCount)

	if errorCount > 0 {
		return fmt.Errorf("%d entry processing errors occurred", errorCount)
	}

	return nil
}

// extractImageFiles はbodyとformatted_bodyから/images/entry/配下の画像ファイル名を抽出する
func (m *Migrator) extractImageFiles(body, formattedBody string) []string {
	fileSet := make(map[string]bool)

	// 正規表現: src= または href= に続く /images/entry/... のファイルパス
	// HTMLパーサーを使うのが理想だが、bodyには生のHatena記法も含まれるため正規表現で抽出
	// 3つのパターンをサポート:
	// 1. ダブルクォート: src="/images/entry/xxx" (引用符まで、スペース可)
	// 2. シングルクォート: src='/images/entry/xxx' (引用符まで、スペース可)
	// 3. クォートなし: src=/images/entry/xxx (スペース・>まで、スペース不可)
	// Hatena記法: [f:id:user:timestamp:image /images/entry/xxx ] も考慮
	re := regexp.MustCompile(`(?:(?:src|href)=(?:"(/images/entry/[^"]*)"|'(/images/entry/[^']*)'|(/images/entry/[^>\s]+))|(?:\s)(/images/entry/[^\s\]]+))`)

	// bodyから抽出（HTMLコメントとCDATAセクションを除去してから処理）
	cleanBody := m.removeCommentsAndCDATA(body)
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
	cleanFormattedBody := m.removeCommentsAndCDATA(formattedBody)
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
func (m *Migrator) removeCommentsAndCDATA(html string) string {
	// HTMLコメント <!-- ... --> を削除
	commentRe := regexp.MustCompile(`<!--[\s\S]*?-->`)
	html = commentRe.ReplaceAllString(html, "")

	// CDATAセクション <![CDATA[ ... ]]> を削除
	cdataRe := regexp.MustCompile(`<!\[CDATA\[[\s\S]*?\]\]>`)
	html = cdataRe.ReplaceAllString(html, "")

	return html
}

// RewriteImageURLs はHTML内の画像URLを書き換える（formatted_body用）
func RewriteImageURLs(htmlContent, newBaseURL string) (string, error) {
	// HTMLフラグメントをパース
	nodes, err := html.ParseFragment(strings.NewReader(htmlContent), &html.Node{
		Type:     html.ElementNode,
		Data:     "body",
		DataAtom: atom.Body,
	})
	if err != nil {
		return "", fmt.Errorf("failed to parse HTML fragment: %w", err)
	}

	// newBaseURLの末尾スラッシュを削除
	newBaseURL = strings.TrimSuffix(newBaseURL, "/")

	// 書き換え関数
	var rewriteNode func(*html.Node)
	rewriteNode = func(n *html.Node) {
		if n.Type == html.ElementNode {
			for i := range n.Attr {
				attr := &n.Attr[i]
				// img srcとa hrefを書き換え
				if (n.Data == "img" && attr.Key == "src") ||
					(n.Data == "a" && attr.Key == "href") {
					if strings.HasPrefix(attr.Val, "/images/entry/") {
						filename := strings.TrimPrefix(attr.Val, "/images/entry/")
						attr.Val = fmt.Sprintf("%s/entry/%s", newBaseURL, filename)
					}
				}
			}
		}
		// 子要素を再帰的に処理
		for c := n.FirstChild; c != nil; c = c.NextSibling {
			rewriteNode(c)
		}
	}

	// HTMLに戻す
	var buf bytes.Buffer
	for _, node := range nodes {
		rewriteNode(node)
		if err := html.Render(&buf, node); err != nil {
			return "", fmt.Errorf("failed to render HTML: %w", err)
		}
	}

	return buf.String(), nil
}

// RewriteBodyImageURLs はbodyフィールドの画像URLを正規表現で書き換える
// Hatena記法などのフォーマット済みテキスト内のHTML断片を対象とする
func RewriteBodyImageURLs(body, newBaseURL string) string {
	newBaseURL = strings.TrimSuffix(newBaseURL, "/")

	// <img src="/images/entry/..." の書き換え
	// 引用符あり・なし両方に対応
	body = strings.ReplaceAll(body, `src="/images/entry/`, `src="`+newBaseURL+`/entry/`)
	body = strings.ReplaceAll(body, `src='/images/entry/`, `src='`+newBaseURL+`/entry/`)
	body = strings.ReplaceAll(body, `src=/images/entry/`, `src=`+newBaseURL+`/entry/`)

	// <a href="/images/entry/..." の書き換え
	body = strings.ReplaceAll(body, `href="/images/entry/`, `href="`+newBaseURL+`/entry/`)
	body = strings.ReplaceAll(body, `href='/images/entry/`, `href='`+newBaseURL+`/entry/`)
	body = strings.ReplaceAll(body, `href=/images/entry/`, `href=`+newBaseURL+`/entry/`)

	return body
}

// existsOnR2 はファイルがR2に存在するかチェックする
func (m *Migrator) existsOnR2(ctx context.Context, filename string) (bool, error) {
	url := fmt.Sprintf("%s/entry/%s", strings.TrimSuffix(m.r2PublicURL, "/"), filename)
	req, err := http.NewRequestWithContext(ctx, "HEAD", url, nil)
	if err != nil {
		return false, err
	}

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return false, err
	}
	defer resp.Body.Close()

	return resp.StatusCode == http.StatusOK, nil
}

// uploadFile は単一ファイルをR2にアップロードする
func (m *Migrator) uploadFile(ctx context.Context, filename string) error {
	localPath := filepath.Join(m.uploadDir, filename)
	file, err := os.Open(localPath)
	if err != nil {
		return fmt.Errorf("failed to open file: %w", err)
	}
	defer file.Close()

	// Content-Typeを検出
	contentType := mime.TypeByExtension(filepath.Ext(filename))
	if contentType == "" {
		contentType = "application/octet-stream"
	}

	// R2にアップロード
	_, err = m.r2Storage.Upload(ctx, filename, file, contentType)
	if err != nil {
		return fmt.Errorf("failed to upload: %w", err)
	}

	return nil
}

// UpdateImageURIs はimagesデータベースのimages.uriを更新する
func (m *Migrator) UpdateImageURIs(ctx context.Context) error {
	log.Printf("画像URIを更新中...")

	if m.opts.DryRun {
		log.Printf("ドライラン: 画像URIを更新します（実際には更新しません）")
		return nil
	}

	result, err := m.app.ImagesDB().ExecContext(ctx, `
		UPDATE images
		SET uri = REPLACE(uri, ?, ?)
		WHERE uri LIKE ?
	`, "/images/entry/", m.r2PublicURL+"/entry/", "/images/entry/%")

	if err != nil {
		return fmt.Errorf("failed to update image URIs: %w", err)
	}

	rowsAffected, _ := result.RowsAffected()
	log.Printf("%d個の画像URIを更新しました", rowsAffected)
	return nil
}

// Verify はマイグレーションを検証する
func (m *Migrator) Verify(ctx context.Context) error {
	log.Printf("マイグレーションを検証中...")

	// エントリに残っている /images/entry/ をチェック
	var count int
	err := m.app.DB().QueryRowContext(ctx, `
		SELECT COUNT(*)
		FROM entries
		WHERE formatted_body LIKE '%/images/entry/%'
	`).Scan(&count)
	if err != nil {
		return fmt.Errorf("failed to query entries: %w", err)
	}

	if count > 0 {
		log.Printf("警告: %d個のエントリにまだ /images/entry/ が含まれています", count)
		// リストアップ
		rows, err := m.app.DB().QueryContext(ctx, `
			SELECT id, path
			FROM entries
			WHERE formatted_body LIKE '%/images/entry/%'
			LIMIT 10
		`)
		if err != nil {
			return fmt.Errorf("failed to query entries: %w", err)
		}
		defer rows.Close()

		log.Printf("サンプルエントリ:")
		for rows.Next() {
			var id int64
			var path string
			if err := rows.Scan(&id, &path); err != nil {
				return fmt.Errorf("failed to scan entry: %w", err)
			}
			log.Printf("  ID:%d %s", id, path)
		}
	} else {
		log.Printf("✓ すべてのエントリが移行されました")
	}

	// images.uriに残っている /images/entry/ をチェック
	err = m.app.ImagesDB().QueryRowContext(ctx, `
		SELECT COUNT(*)
		FROM images
		WHERE uri LIKE '/images/entry/%'
	`).Scan(&count)
	if err != nil {
		return fmt.Errorf("failed to query images: %w", err)
	}

	if count > 0 {
		log.Printf("警告: %d個の画像がまだ /images/entry/ URIを持っています", count)
	} else {
		log.Printf("✓ すべての画像URIが移行されました")
	}

	return nil
}
