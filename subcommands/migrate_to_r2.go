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
	"strings"
	"sync"

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

	// Step 1: ファイルをR2にアップロード
	// 理由: 先にファイルをアップロードしておくことで、データベース更新後すぐに画像が表示可能になる
	//       また、アップロード中に失敗した場合でもデータベースは変更されていないため安全
	if err := migrator.UploadFiles(ctx); err != nil {
		return fmt.Errorf("file upload failed: %w", err)
	}

	// Step 2: エントリのformatted_bodyを書き換え
	// 理由: Step1でファイルがアップロード済みなので、書き換え直後から新URLで画像が表示される
	//       先にimages.uriを更新するとStep3との整合性が崩れる可能性がある
	if err := migrator.RewriteEntries(ctx); err != nil {
		return fmt.Errorf("entry rewrite failed: %w", err)
	}

	// Step 3: images.uriを一括更新
	// 理由: エントリ本文の書き換えが完了した後に、画像DBも同期する
	//       REPLACEによる一括更新なので高速
	if err := migrator.UpdateImageURIs(ctx); err != nil {
		return fmt.Errorf("image URI update failed: %w", err)
	}

	// Step 4: 検証
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

// UploadFiles はローカルファイルをR2にアップロードする
func (m *Migrator) UploadFiles(ctx context.Context) error {
	// ローカルファイル一覧を取得
	files, err := m.listLocalFiles()
	if err != nil {
		return fmt.Errorf("failed to list local files: %w", err)
	}

	if len(files) == 0 {
		log.Printf("アップロードするローカルファイルがありません")
		return nil
	}

	log.Printf("%d個のローカルファイルを発見しました", len(files))

	if m.opts.DryRun {
		log.Printf("ドライラン: %d個のファイルをアップロードします（実際にはアップロードしません）", len(files))
		return nil
	}

	// 並列アップロード
	var wg sync.WaitGroup
	semaphore := make(chan struct{}, m.opts.Parallel)
	errorsCh := make(chan error, len(files))
	successCount := 0
	skipCount := 0
	var mu sync.Mutex

	for i, filename := range files {
		wg.Add(1)
		go func(idx int, fname string) {
			defer wg.Done()
			semaphore <- struct{}{}
			defer func() { <-semaphore }()

			log.Printf("[%d/%d] アップロード中 %s...", idx+1, len(files), fname)

			// R2に既に存在するかチェック
			exists, err := m.existsOnR2(ctx, fname)
			if err != nil {
				log.Printf("  警告: 存在確認に失敗: %v", err)
			} else if exists {
				log.Printf("  スキップ: 既に存在します")
				mu.Lock()
				skipCount++
				mu.Unlock()
				return
			}

			// ファイルをアップロード
			if err := m.uploadFile(ctx, fname); err != nil {
				log.Printf("  エラー: %v", err)
				errorsCh <- err
			} else {
				log.Printf("  完了")
				mu.Lock()
				successCount++
				mu.Unlock()
			}
		}(i, filename)
	}

	wg.Wait()
	close(errorsCh)

	errorCount := len(errorsCh)
	log.Printf("アップロード完了: %d成功, %dスキップ, %d失敗", successCount, skipCount, errorCount)

	if errorCount > 0 {
		return fmt.Errorf("%d upload errors occurred", errorCount)
	}

	return nil
}

// listLocalFiles はアップロードディレクトリ内のすべてのファイルをリストする
func (m *Migrator) listLocalFiles() ([]string, error) {
	var files []string
	err := filepath.Walk(m.uploadDir, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}
		if !info.IsDir() {
			relPath, err := filepath.Rel(m.uploadDir, path)
			if err != nil {
				return err
			}
			files = append(files, relPath)
		}
		return nil
	})
	if err != nil {
		return nil, err
	}
	return files, nil
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

// RewriteEntries はエントリのbodyとformatted_bodyを書き換える
func (m *Migrator) RewriteEntries(ctx context.Context) error {
	// /images/entry/を含むエントリをクエリ（bodyまたはformatted_bodyに含まれる）
	rows, err := m.app.DB().QueryContext(ctx, `
		SELECT id, path, body, formatted_body
		FROM entries
		WHERE body LIKE '%/images/entry/%' OR formatted_body LIKE '%/images/entry/%'
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

	if m.opts.DryRun {
		log.Printf("ドライラン: %d個のエントリを書き換えます（実際には書き換えません）", len(entries))
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

		// bodyを書き換え（正規表現ベース）
		newBody := e.body
		if strings.Contains(e.body, "/images/entry/") {
			newBody = RewriteBodyImageURLs(e.body, m.r2PublicURL)
		}

		// formatted_bodyを書き換え（HTMLパーサーベース）
		newHTML := e.formattedBody
		if strings.Contains(e.formattedBody, "/images/entry/") {
			var err error
			newHTML, err = RewriteImageURLs(e.formattedBody, m.r2PublicURL)
			if err != nil {
				log.Printf("  エラー: %v", err)
				errorCount++
				continue
			}
		}

		// データベースを更新（bodyとformatted_bodyの両方）
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

		successCount++
	}

	log.Printf("書き換え完了: %d成功, %d失敗, %dスキップ", successCount, errorCount, skippedCount)

	if errorCount > 0 {
		return fmt.Errorf("%d rewrite errors occurred", errorCount)
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
