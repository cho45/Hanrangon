package app

import (
	"context"
	"errors"
	"io"
	"os"
	"path/filepath"
	"strings"
	"testing"

	"github.com/aws/aws-sdk-go-v2/service/s3"
)

// mockS3Client はS3ClientInterfaceのモック実装
type mockS3Client struct {
	putObjectCalls []mockPutObjectCall
	putObjectError error
}

type mockPutObjectCall struct {
	bucket        string
	key           string
	contentType   string
	cacheControl  string
	contentLength int64
	body          []byte
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
