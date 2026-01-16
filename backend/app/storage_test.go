package app

import (
	"context"
	"errors"
	"io"
	"os"
	"path/filepath"
	"strings"
	"testing"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/aws/aws-sdk-go-v2/service/s3/types"
)

// mockS3Client はS3ClientInterfaceのモック実装
type mockS3Client struct {
	putObjectCalls         []mockPutObjectCall
	putObjectError         error
	headObjectCalls        []mockHeadObjectCall
	headObjectError        error
	listObjectsV2Error     error
	listObjectsV2Outputs   []*s3.ListObjectsV2Output
	listObjectsV2CallCount int
	deleteObjectCalls      []mockDeleteObjectCall
	deleteObjectError      error
}

type mockDeleteObjectCall struct {
	bucket string
	key    string
}

type mockPutObjectCall struct {
	bucket        string
	key           string
	contentType   string
	cacheControl  string
	contentLength int64
	body          []byte
}

type mockHeadObjectCall struct {
	bucket string
	key    string
}

func (m *mockS3Client) PutObject(ctx context.Context, params *s3.PutObjectInput, optFns ...func(*s3.Options)) (*s3.PutObjectOutput, error) {
	if m.putObjectError != nil {
		return nil, m.putObjectError
	}

	// パラメータを記録
	bodyBytes, _ := io.ReadAll(params.Body)
	call := mockPutObjectCall{
		bucket:        *params.Bucket,
		key:           *params.Key,
		contentType:   *params.ContentType,
		cacheControl:  *params.CacheControl,
		contentLength: *params.ContentLength,
		body:          bodyBytes,
	}
	m.putObjectCalls = append(m.putObjectCalls, call)

	return &s3.PutObjectOutput{}, nil
}

func (m *mockS3Client) HeadObject(ctx context.Context, params *s3.HeadObjectInput, optFns ...func(*s3.Options)) (*s3.HeadObjectOutput, error) {
	call := mockHeadObjectCall{
		bucket: *params.Bucket,
		key:    *params.Key,
	}
	m.headObjectCalls = append(m.headObjectCalls, call)

	if m.headObjectError != nil {
		return nil, m.headObjectError
	}

	return &s3.HeadObjectOutput{}, nil
}

func (m *mockS3Client) ListObjectsV2(ctx context.Context, params *s3.ListObjectsV2Input, optFns ...func(*s3.Options)) (*s3.ListObjectsV2Output, error) {
	if m.listObjectsV2Error != nil {
		return nil, m.listObjectsV2Error
	}
	if len(m.listObjectsV2Outputs) > 0 {
		if m.listObjectsV2CallCount < len(m.listObjectsV2Outputs) {
			out := m.listObjectsV2Outputs[m.listObjectsV2CallCount]
			m.listObjectsV2CallCount++
			return out, nil
		}
		return &s3.ListObjectsV2Output{IsTruncated: aws.Bool(false)}, nil
	}
	return &s3.ListObjectsV2Output{IsTruncated: aws.Bool(false)}, nil
}

func (m *mockS3Client) DeleteObject(ctx context.Context, params *s3.DeleteObjectInput, optFns ...func(*s3.Options)) (*s3.DeleteObjectOutput, error) {
	call := mockDeleteObjectCall{
		bucket: *params.Bucket,
		key:    *params.Key,
	}
	m.deleteObjectCalls = append(m.deleteObjectCalls, call)

	if m.deleteObjectError != nil {
		return nil, m.deleteObjectError
	}
	return &s3.DeleteObjectOutput{}, nil
}

func TestLocalStorage_Upload(t *testing.T) {
	tmpDir := t.TempDir()
	storage := NewLocalStorage(tmpDir, "/images/entry/")

	ctx := context.Background()
	content := strings.NewReader("test content")
	url, err := storage.Upload(ctx, "test.jpg", content, "image/jpeg")

	if err != nil {
		t.Fatalf("Upload failed: %v", err)
	}

	expectedURL := "/images/entry/test.jpg"
	if url != expectedURL {
		t.Errorf("expected URL %q, got %q", expectedURL, url)
	}

	// ファイルが作成されたか確認
	data, err := os.ReadFile(filepath.Join(tmpDir, "test.jpg"))
	if err != nil {
		t.Fatalf("failed to read uploaded file: %v", err)
	}

	if string(data) != "test content" {
		t.Errorf("expected content %q, got %q", "test content", string(data))
	}
}

func TestLocalStorage_Upload_WithSubdirectory(t *testing.T) {
	tmpDir := t.TempDir()
	storage := NewLocalStorage(filepath.Join(tmpDir, "subdir"), "/images/entry/")

	ctx := context.Background()
	content := strings.NewReader("test content")
	url, err := storage.Upload(ctx, "test.jpg", content, "image/jpeg")

	if err != nil {
		t.Fatalf("Upload failed: %v", err)
	}

	expectedURL := "/images/entry/test.jpg"
	if url != expectedURL {
		t.Errorf("expected URL %q, got %q", expectedURL, url)
	}

	// サブディレクトリが自動作成されたか確認
	data, err := os.ReadFile(filepath.Join(tmpDir, "subdir", "test.jpg"))
	if err != nil {
		t.Fatalf("failed to read uploaded file: %v", err)
	}

	if string(data) != "test content" {
		t.Errorf("expected content %q, got %q", "test content", string(data))
	}
}

func TestLocalStorage_Upload_WithSpecialCharacters(t *testing.T) {
	tmpDir := t.TempDir()
	storage := NewLocalStorage(tmpDir, "/images/entry/")

	ctx := context.Background()
	content := strings.NewReader("test content")
	// ファイル名にスペースと日本語を含む
	url, err := storage.Upload(ctx, "test file 日本語.jpg", content, "image/jpeg")

	if err != nil {
		t.Fatalf("Upload failed: %v", err)
	}

	// URL-escapeされていることを確認
	if !strings.Contains(url, "test%20file") {
		t.Errorf("expected URL to contain URL-escaped spaces, got %q", url)
	}
}

func TestNewR2Storage_IncompleteConfig(t *testing.T) {
	tests := []struct {
		name            string
		endpointURL     string
		accessKeyID     string
		secretAccessKey string
		bucket          string
		expectError     bool
	}{
		{
			name:            "all fields provided",
			endpointURL:     "https://example.r2.cloudflarestorage.com",
			accessKeyID:     "key",
			secretAccessKey: "secret",
			bucket:          "bucket",
			expectError:     false,
		},
		{
			name:            "missing endpointURL",
			endpointURL:     "",
			accessKeyID:     "key",
			secretAccessKey: "secret",
			bucket:          "bucket",
			expectError:     true,
		},
		{
			name:            "missing accessKeyID",
			endpointURL:     "https://example.r2.cloudflarestorage.com",
			accessKeyID:     "",
			secretAccessKey: "secret",
			bucket:          "bucket",
			expectError:     true,
		},
		{
			name:            "missing secretAccessKey",
			endpointURL:     "https://example.r2.cloudflarestorage.com",
			accessKeyID:     "key",
			secretAccessKey: "",
			bucket:          "bucket",
			expectError:     true,
		},
		{
			name:            "missing bucket",
			endpointURL:     "https://example.r2.cloudflarestorage.com",
			accessKeyID:     "key",
			secretAccessKey: "secret",
			bucket:          "",
			expectError:     true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			_, err := NewR2Storage(
				tt.endpointURL,
				tt.accessKeyID,
				tt.secretAccessKey,
				tt.bucket,
				"https://assets.example.com",
			)

			if tt.expectError && err == nil {
				t.Error("expected error, got nil")
			}
			if !tt.expectError && err != nil {
				t.Errorf("expected no error, got %v", err)
			}
		})
	}
}

func TestR2Storage_Upload(t *testing.T) {
	mock := &mockS3Client{}
	storage := &R2Storage{
		client:    mock,
		bucket:    "test-bucket",
		publicURL: "https://assets.example.com",
	}

	ctx := context.Background()
	content := strings.NewReader("test image data")
	filename := "20240101120000-test.jpg"

	publicURL, err := storage.Upload(ctx, filename, content, "image/jpeg")

	// エラーチェック
	if err != nil {
		t.Fatalf("Upload failed: %v", err)
	}

	// 戻り値のURL検証
	expectedURL := "https://assets.example.com/entry/20240101120000-test.jpg"
	if publicURL != expectedURL {
		t.Errorf("expected URL %q, got %q", expectedURL, publicURL)
	}

	// PutObjectが1回呼ばれたことを確認
	if len(mock.putObjectCalls) != 1 {
		t.Fatalf("expected 1 PutObject call, got %d", len(mock.putObjectCalls))
	}

	call := mock.putObjectCalls[0]

	// バケット名の検証
	if call.bucket != "test-bucket" {
		t.Errorf("expected bucket %q, got %q", "test-bucket", call.bucket)
	}

	// オブジェクトキーの検証（entry/ プレフィックス付き）
	expectedKey := "entry/20240101120000-test.jpg"
	if call.key != expectedKey {
		t.Errorf("expected key %q, got %q", expectedKey, call.key)
	}

	// Content-Typeの検証
	if call.contentType != "image/jpeg" {
		t.Errorf("expected content type %q, got %q", "image/jpeg", call.contentType)
	}

	// Cache-Controlの検証
	expectedCacheControl := "public, max-age=31536000, immutable"
	if call.cacheControl != expectedCacheControl {
		t.Errorf("expected cache control %q, got %q", expectedCacheControl, call.cacheControl)
	}

	// Content-Lengthの検証
	expectedLength := int64(len("test image data"))
	if call.contentLength != expectedLength {
		t.Errorf("expected content length %d, got %d", expectedLength, call.contentLength)
	}

	// ボディの検証
	if string(call.body) != "test image data" {
		t.Errorf("expected body %q, got %q", "test image data", string(call.body))
	}
}

func TestR2Storage_Upload_WithSpecialCharacters(t *testing.T) {
	mock := &mockS3Client{}
	storage := &R2Storage{
		client:    mock,
		bucket:    "test-bucket",
		publicURL: "https://assets.example.com",
	}

	ctx := context.Background()
	content := strings.NewReader("test")
	// ファイル名にスペースと日本語を含む
	filename := "test file 日本語.jpg"

	publicURL, err := storage.Upload(ctx, filename, content, "image/jpeg")

	if err != nil {
		t.Fatalf("Upload failed: %v", err)
	}

	// URLがURL-escapeされていることを確認
	if !strings.Contains(publicURL, "test%20file") {
		t.Errorf("expected URL to contain URL-escaped filename, got %q", publicURL)
	}

	// R2のオブジェクトキーは元のファイル名（エスケープなし）
	call := mock.putObjectCalls[0]
	expectedKey := "entry/test file 日本語.jpg"
	if call.key != expectedKey {
		t.Errorf("expected key %q, got %q", expectedKey, call.key)
	}
}

func TestR2Storage_Upload_Error(t *testing.T) {
	mock := &mockS3Client{
		putObjectError: errors.New("S3 API error"),
	}
	storage := &R2Storage{
		client:    mock,
		bucket:    "test-bucket",
		publicURL: "https://assets.example.com",
	}

	ctx := context.Background()
	content := strings.NewReader("test")

	_, err := storage.Upload(ctx, "test.jpg", content, "image/jpeg")

	if err == nil {
		t.Fatal("expected error, got nil")
	}

	if !strings.Contains(err.Error(), "failed to upload to R2") {
		t.Errorf("expected error message to contain 'failed to upload to R2', got %q", err.Error())
	}
}

func TestR2Storage_Upload_VariousContentTypes(t *testing.T) {
	tests := []struct {
		name        string
		filename    string
		contentType string
	}{
		{
			name:        "JPEG image",
			filename:    "test.jpg",
			contentType: "image/jpeg",
		},
		{
			name:        "PNG image",
			filename:    "test.png",
			contentType: "image/png",
		},
		{
			name:        "WebP image",
			filename:    "test.webp",
			contentType: "image/webp",
		},
		{
			name:        "AVIF image",
			filename:    "test.avif",
			contentType: "image/avif",
		},
		{
			name:        "GIF image",
			filename:    "test.gif",
			contentType: "image/gif",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mock := &mockS3Client{}
			storage := &R2Storage{
				client:    mock,
				bucket:    "test-bucket",
				publicURL: "https://assets.example.com",
			}

			ctx := context.Background()
			content := strings.NewReader("test image data")

			_, err := storage.Upload(ctx, tt.filename, content, tt.contentType)

			if err != nil {
				t.Fatalf("Upload failed: %v", err)
			}

			// Content-Typeが正しく設定されているか確認
			if len(mock.putObjectCalls) != 1 {
				t.Fatalf("expected 1 PutObject call, got %d", len(mock.putObjectCalls))
			}

			call := mock.putObjectCalls[0]
			if call.contentType != tt.contentType {
				t.Errorf("expected content type %q, got %q", tt.contentType, call.contentType)
			}
		})
	}
}

func TestR2Storage_Upload_Efficiency(t *testing.T) {
	t.Run("with *os.File", func(t *testing.T) {
		mock := &mockS3Client{}
		storage := &R2Storage{
			client:    mock,
			bucket:    "test-bucket",
			publicURL: "https://assets.example.com",
		}

		// 一時ファイルを作成
		tmpFile, err := os.CreateTemp("", "storage-test-*")
		if err != nil {
			t.Fatal(err)
		}
		defer os.Remove(tmpFile.Name())
		content := "file content"
		tmpFile.WriteString(content)
		tmpFile.Seek(0, 0) // 先頭に戻す
		defer tmpFile.Close()

		ctx := context.Background()
		_, err = storage.Upload(ctx, "file.jpg", tmpFile, "image/jpeg")
		if err != nil {
			t.Fatalf("Upload failed: %v", err)
		}

		call := mock.putObjectCalls[0]
		if call.contentLength != int64(len(content)) {
			t.Errorf("expected length %d, got %d", len(content), call.contentLength)
		}
		if string(call.body) != content {
			t.Errorf("expected body %q, got %q", content, string(call.body))
		}
	})

	t.Run("with io.ReadSeeker (strings.Reader)", func(t *testing.T) {
		mock := &mockS3Client{}
		storage := &R2Storage{
			client:    mock,
			bucket:    "test-bucket",
			publicURL: "https://assets.example.com",
		}

		content := "seeker content"
		reader := strings.NewReader(content)

		ctx := context.Background()
		_, err := storage.Upload(ctx, "seeker.jpg", reader, "image/jpeg")
		if err != nil {
			t.Fatalf("Upload failed: %v", err)
		}

		call := mock.putObjectCalls[0]
		if call.contentLength != int64(len(content)) {
			t.Errorf("expected length %d, got %d", len(content), call.contentLength)
		}
		if string(call.body) != content {
			t.Errorf("expected body %q, got %q", content, string(call.body))
		}
	})
}

func TestLocalStorage_Exists(t *testing.T) {
	tmpDir := t.TempDir()
	storage := NewLocalStorage(tmpDir, "/images/entry/")
	ctx := context.Background()

	filename := "exists.jpg"
	localPath := filepath.Join(tmpDir, filename)

	// 最初は存在しない
	exists, err := storage.Exists(ctx, filename)
	if err != nil {
		t.Fatalf("Exists failed: %v", err)
	}
	if exists {
		t.Error("expected exists to be false")
	}

	// ファイルを作成
	if err := os.WriteFile(localPath, []byte("test"), 0644); err != nil {
		t.Fatalf("failed to create file: %v", err)
	}

	// 存在するはず
	exists, err = storage.Exists(ctx, filename)
	if err != nil {
		t.Fatalf("Exists failed: %v", err)
	}
	if !exists {
		t.Error("expected exists to be true")
	}
}

func TestR2Storage_Exists(t *testing.T) {
	t.Run("exists", func(t *testing.T) {
		mock := &mockS3Client{}
		storage := &R2Storage{
			client:    mock,
			bucket:    "test-bucket",
			publicURL: "https://assets.example.com",
		}
		ctx := context.Background()
		filename := "exists.jpg"

		exists, err := storage.Exists(ctx, filename)
		if err != nil {
			t.Fatalf("Exists failed: %v", err)
		}
		if !exists {
			t.Error("expected exists to be true")
		}

		if len(mock.headObjectCalls) != 1 {
			t.Fatalf("expected 1 HeadObject call, got %d", len(mock.headObjectCalls))
		}
		if mock.headObjectCalls[0].key != "entry/exists.jpg" {
			t.Errorf("expected key %q, got %q", "entry/exists.jpg", mock.headObjectCalls[0].key)
		}
	})

	t.Run("not found (404)", func(t *testing.T) {
		mock := &mockS3Client{
			headObjectError: errors.New("api error: 404 Not Found"),
		}
		storage := &R2Storage{
			client:    mock,
			bucket:    "test-bucket",
			publicURL: "https://assets.example.com",
		}
		ctx := context.Background()

		exists, err := storage.Exists(ctx, "notfound.jpg")
		if err != nil {
			t.Fatalf("Exists failed: %v", err)
		}
		if exists {
			t.Error("expected exists to be false")
		}
	})

	t.Run("other error", func(t *testing.T) {
		mock := &mockS3Client{
			headObjectError: errors.New("api error: 500 Internal Server Error"),
		}
		storage := &R2Storage{
			client:    mock,
			bucket:    "test-bucket",
			publicURL: "https://assets.example.com",
		}
		ctx := context.Background()

		_, err := storage.Exists(ctx, "error.jpg")
		if err == nil {
			t.Fatal("expected error, got nil")
		}
	})
}

func TestLocalStorage_ListObjects(t *testing.T) {
	tmpDir := t.TempDir()
	storage := NewLocalStorage(tmpDir, "/images/entry/")
	ctx := context.Background()

	// 準備: ファイルをいくつか作成
	files := []string{"a.jpg", "b.jpg", "other.png"}
	for _, f := range files {
		os.WriteFile(filepath.Join(tmpDir, f), []byte("test"), 0644)
	}
	// サブディレクトリ作成 (無視されるべき)
	os.Mkdir(filepath.Join(tmpDir, "subdir"), 0755)

	t.Run("list all", func(t *testing.T) {
		objs, err := storage.ListObjects(ctx, "")
		if err != nil {
			t.Fatal(err)
		}
		if len(objs) != 3 {
			t.Errorf("expected 3 objects, got %d", len(objs))
		}
	})

	t.Run("list with prefix", func(t *testing.T) {
		objs, err := storage.ListObjects(ctx, "a")
		if err != nil {
			t.Fatal(err)
		}
		if len(objs) != 1 || objs[0].Key != "a.jpg" {
			t.Errorf("expected a.jpg, got %v", objs)
		}
	})
}

func TestLocalStorage_Delete(t *testing.T) {
	tmpDir := t.TempDir()
	storage := NewLocalStorage(tmpDir, "/images/entry/")
	ctx := context.Background()

	filename := "delete-me.jpg"
	localPath := filepath.Join(tmpDir, filename)
	os.WriteFile(localPath, []byte("test"), 0644)

	err := storage.Delete(ctx, filename)
	if err != nil {
		t.Fatalf("Delete failed: %v", err)
	}

	if _, err := os.Stat(localPath); !os.IsNotExist(err) {
		t.Error("file still exists after Delete")
	}
}

func TestR2Storage_ListObjects(t *testing.T) {
	mock := &mockS3Client{
		listObjectsV2Outputs: []*s3.ListObjectsV2Output{
			{
				Contents: []types.Object{
					{Key: aws.String("entry/image1.jpg"), Size: aws.Int64(100)},
					{Key: aws.String("entry/image2.jpg"), Size: aws.Int64(200)},
				},
				IsTruncated: aws.Bool(false),
			},
		},
	}
	storage := &R2Storage{
		client:    mock,
		bucket:    "test-bucket",
		publicURL: "https://assets.example.com",
	}
	ctx := context.Background()

	objs, err := storage.ListObjects(ctx, "")
	if err != nil {
		t.Fatal(err)
	}

	if len(objs) != 2 {
		t.Errorf("expected 2 objects, got %d", len(objs))
	}
	if objs[0].Key != "image1.jpg" || objs[0].Size != 100 {
		t.Errorf("unexpected object 0: %+v", objs[0])
	}
	if objs[1].Key != "image2.jpg" || objs[1].Size != 200 {
		t.Errorf("unexpected object 1: %+v", objs[1])
	}
}

func TestR2Storage_ListObjects_Pagination(t *testing.T) {
	mock := &mockS3Client{
		listObjectsV2Outputs: []*s3.ListObjectsV2Output{
			{
				Contents: []types.Object{
					{Key: aws.String("entry/page1-1.jpg"), Size: aws.Int64(10)},
				},
				IsTruncated:           aws.Bool(true),
				NextContinuationToken: aws.String("token1"),
			},
			{
				Contents: []types.Object{
					{Key: aws.String("entry/page2-1.jpg"), Size: aws.Int64(20)},
				},
				IsTruncated: aws.Bool(false),
			},
		},
	}
	storage := &R2Storage{
		client:    mock,
		bucket:    "test-bucket",
		publicURL: "https://assets.example.com",
	}
	ctx := context.Background()

	objs, err := storage.ListObjects(ctx, "")
	if err != nil {
		t.Fatal(err)
	}

	// 2ページ分、合計2つのオブジェクトが取得されているはず
	if len(objs) != 2 {
		t.Errorf("expected 2 objects, got %d", len(objs))
	}
	if objs[0].Key != "page1-1.jpg" || objs[1].Key != "page2-1.jpg" {
		t.Errorf("unexpected objects: %v", objs)
	}
	if mock.listObjectsV2CallCount != 2 {
		t.Errorf("expected 2 API calls, got %d", mock.listObjectsV2CallCount)
	}
}

func TestR2Storage_Delete(t *testing.T) {
	mock := &mockS3Client{}
	storage := &R2Storage{
		client:    mock,
		bucket:    "test-bucket",
		publicURL: "https://assets.example.com",
	}
	ctx := context.Background()

	err := storage.Delete(ctx, "delete-me.jpg")
	if err != nil {
		t.Fatal(err)
	}

	if len(mock.deleteObjectCalls) != 1 {
		t.Fatalf("expected 1 DeleteObject call, got %d", len(mock.deleteObjectCalls))
	}
	if mock.deleteObjectCalls[0].key != "entry/delete-me.jpg" {
		t.Errorf("expected key %q, got %q", "entry/delete-me.jpg", mock.deleteObjectCalls[0].key)
	}
}
