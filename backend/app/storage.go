package app

import (
	"bytes"
	"context"
	"fmt"
	"io"
	"net/url"
	"os"
	"path/filepath"
	"strings"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
)

// StorageClient はストレージ操作の抽象化インターフェース
type StorageObject struct {
	Key  string
	Size int64
}

type StorageClient interface {
	// Upload uploads a file and returns the public URL
	// key: ファイル名のみ（例: "20240101120000-image.jpg"）
	// 実装側で適切なパス（例: "entry/{key}"）を構築する
	Upload(ctx context.Context, key string, body io.Reader, contentType string) (string, error)

	// Exists checks if the file exists in the storage
	Exists(ctx context.Context, key string) (bool, error)

	// ListObjects lists objects in the storage with the given prefix
	// Returns relative keys (without "entry/" prefix)
	ListObjects(ctx context.Context, prefix string) ([]StorageObject, error)

	// Delete deletes the file from the storage
	Delete(ctx context.Context, key string) error
}

// LocalStorage はローカルファイルシステムへの保存
type LocalStorage struct {
	uploadDir       string
	uploadURLPrefix string
}

// NewLocalStorage creates a new LocalStorage instance
func NewLocalStorage(uploadDir, uploadURLPrefix string) *LocalStorage {
	return &LocalStorage{
		uploadDir:       uploadDir,
		uploadURLPrefix: uploadURLPrefix,
	}
}

// Upload saves the file locally and returns the relative URL
func (s *LocalStorage) Upload(ctx context.Context, key string, body io.Reader, contentType string) (string, error) {
	destPath := filepath.Join(s.uploadDir, key)

	// Ensure directory exists
	if err := os.MkdirAll(filepath.Dir(destPath), 0755); err != nil {
		return "", fmt.Errorf("failed to create directory: %w", err)
	}

	dst, err := os.Create(destPath)
	if err != nil {
		return "", fmt.Errorf("failed to create file: %w", err)
	}
	defer dst.Close()

	if _, err = io.Copy(dst, body); err != nil {
		return "", fmt.Errorf("failed to save file: %w", err)
	}

	// Return relative URL
	return s.uploadURLPrefix + url.PathEscape(key), nil
}

// Exists checks if the file exists locally
func (s *LocalStorage) Exists(ctx context.Context, key string) (bool, error) {
	destPath := filepath.Join(s.uploadDir, key)
	_, err := os.Stat(destPath)
	if err == nil {
		return true, nil
	}
	if os.IsNotExist(err) {
		return false, nil
	}
	return false, err
}

// ListObjects lists files locally
func (s *LocalStorage) ListObjects(ctx context.Context, prefix string) ([]StorageObject, error) {
	searchPattern := filepath.Join(s.uploadDir, prefix+"*")
	matches, err := filepath.Glob(searchPattern)
	if err != nil {
		return nil, err
	}

	var objects []StorageObject
	for _, match := range matches {
		info, err := os.Stat(match)
		if err != nil {
			continue
		}
		if info.IsDir() {
			continue
		}
		rel, err := filepath.Rel(s.uploadDir, match)
		if err != nil {
			continue
		}
		objects = append(objects, StorageObject{
			Key:  rel,
			Size: info.Size(),
		})
	}
	return objects, nil
}

// Delete deletes the file locally
func (s *LocalStorage) Delete(ctx context.Context, key string) error {
	destPath := filepath.Join(s.uploadDir, key)
	return os.Remove(destPath)
}

// S3ClientInterface はS3クライアントの抽象化インターフェース（テスト用）
type S3ClientInterface interface {
	PutObject(ctx context.Context, params *s3.PutObjectInput, optFns ...func(*s3.Options)) (*s3.PutObjectOutput, error)
	HeadObject(ctx context.Context, params *s3.HeadObjectInput, optFns ...func(*s3.Options)) (*s3.HeadObjectOutput, error)
	ListObjectsV2(ctx context.Context, params *s3.ListObjectsV2Input, optFns ...func(*s3.Options)) (*s3.ListObjectsV2Output, error)
	DeleteObject(ctx context.Context, params *s3.DeleteObjectInput, optFns ...func(*s3.Options)) (*s3.DeleteObjectOutput, error)
}

// R2Storage はCloudflare R2への保存
type R2Storage struct {
	client    S3ClientInterface
	bucket    string
	publicURL string
}

// NewR2Storage creates a new R2Storage instance
func NewR2Storage(endpointURL, accessKeyID, secretAccessKey, bucket, publicURL string) (*R2Storage, error) {
	if endpointURL == "" || accessKeyID == "" || secretAccessKey == "" || bucket == "" {
		return nil, fmt.Errorf("R2 configuration incomplete")
	}

	cfg := aws.Config{
		Region:      "auto",
		Credentials: credentials.NewStaticCredentialsProvider(accessKeyID, secretAccessKey, ""),
	}

	client := s3.NewFromConfig(cfg, func(o *s3.Options) {
		o.BaseEndpoint = aws.String(endpointURL)
	})

	return &R2Storage{
		client:    client,
		bucket:    bucket,
		publicURL: publicURL,
	}, nil
}

// Upload uploads the file to R2 and returns the public URL
func (s *R2Storage) Upload(ctx context.Context, key string, body io.Reader, contentType string) (string, error) {
	var contentLength int64
	var bodyReader io.Reader

	// 型アサーションでファイル（os.File）かどうかを確認
	if f, ok := body.(*os.File); ok {
		stat, err := f.Stat()
		if err != nil {
			return "", fmt.Errorf("failed to stat file: %w", err)
		}
		contentLength = stat.Size()
		bodyReader = f
	} else if rs, ok := body.(io.ReadSeeker); ok {
		// Seek可能であれば末尾に移動してサイズを確認
		size, err := rs.Seek(0, io.SeekEnd)
		if err != nil {
			return "", fmt.Errorf("failed to seek: %w", err)
		}
		_, err = rs.Seek(0, io.SeekStart)
		if err != nil {
			return "", fmt.Errorf("failed to seek start: %w", err)
		}
		contentLength = size
		bodyReader = rs
	} else {
		// どうしてもサイズが分からないReaderの場合のみ、メモリに読み込む（フォールバック）
		data, err := io.ReadAll(body)
		if err != nil {
			return "", fmt.Errorf("failed to read body: %w", err)
		}
		contentLength = int64(len(data))
		bodyReader = bytes.NewReader(data)
	}

	// R2のオブジェクトキー: entry/{key}
	objectKey := "entry/" + key

	_, err := s.client.PutObject(ctx, &s3.PutObjectInput{
		Bucket:        aws.String(s.bucket),
		Key:           aws.String(objectKey),
		Body:          bodyReader,
		ContentType:   aws.String(contentType),
		ContentLength: aws.Int64(contentLength),
		CacheControl:  aws.String("public, max-age=31536000, immutable"), // 1年間キャッシュ（最大限キャッシュさせるため）
	})
	if err != nil {
		return "", fmt.Errorf("failed to upload to R2: %w", err)
	}

	// 公開URLを生成
	publicURL := fmt.Sprintf("%s/entry/%s", strings.TrimSuffix(s.publicURL, "/"), url.PathEscape(key))
	return publicURL, nil
}

// Exists checks if the file exists in R2
func (s *R2Storage) Exists(ctx context.Context, key string) (bool, error) {
	// R2のオブジェクトキー: entry/{key}
	objectKey := "entry/" + key

	_, err := s.client.HeadObject(ctx, &s3.HeadObjectInput{
		Bucket: aws.String(s.bucket),
		Key:    aws.String(objectKey),
	})
	if err != nil {
		// エラーが404相当ならfalse、それ以外はエラーを返す
		if strings.Contains(err.Error(), "NotFound") || strings.Contains(err.Error(), "404") {
			return false, nil
		}
		return false, fmt.Errorf("failed to check existence in R2: %w", err)
	}

	return true, nil
}

// ListObjects lists objects in R2
func (s *R2Storage) ListObjects(ctx context.Context, prefix string) ([]StorageObject, error) {
	objectPrefix := "entry/" + prefix
	var objects []StorageObject

	paginator := s3.NewListObjectsV2Paginator(s.client, &s3.ListObjectsV2Input{
		Bucket: aws.String(s.bucket),
		Prefix: aws.String(objectPrefix),
	})

	for paginator.HasMorePages() {
		page, err := paginator.NextPage(ctx)
		if err != nil {
			return nil, fmt.Errorf("failed to list objects in R2: %w", err)
		}

		for _, obj := range page.Contents {
			key := aws.ToString(obj.Key)
			relKey := strings.TrimPrefix(key, "entry/")
			objects = append(objects, StorageObject{
				Key:  relKey,
				Size: aws.ToInt64(obj.Size),
			})
		}
	}

	return objects, nil
}

// Delete deletes the object from R2
func (s *R2Storage) Delete(ctx context.Context, key string) error {
	objectKey := "entry/" + key

	_, err := s.client.DeleteObject(ctx, &s3.DeleteObjectInput{
		Bucket: aws.String(s.bucket),
		Key:    aws.String(objectKey),
	})
	if err != nil {
		return fmt.Errorf("failed to delete object from R2: %w", err)
	}

	return nil
}
