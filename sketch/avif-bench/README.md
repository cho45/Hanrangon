# AVIF Decoder Benchmark in Go

Go で AVIF をデコードするための 2 つの主要なライブラリの比較レポート。

## 比較対象
1. **[gen2brain/avif](https://github.com/gen2brain/avif)**
   - 実装: `libavif` を WASM にコンパイルし、`wazero` で実行。
   - メリット: CGo 不要。Pure Go としてビルド可能。
   - デメリット: WASM 実行のためオーバーヘッドが大きい。

2. **[vegidio/avif-go](https://github.com/vegidio/avif-go)**
   - 実装: CGo を使用し、プリビルドされた `libavif` を静的リンク。
   - メリット: 非常に高速。ネイティブパフォーマンス。
   - デメリット: CGo が必要（ただし主要プラットフォームのバイナリは同梱されている）。

## ベンチマーク結果 (Apple M1)
`go test -bench .` による実行結果。

```text
BenchmarkGen2brain-8           3         475802931 ns/op (~475ms)
BenchmarkVegidio-8            22          47112913 ns/op (~47ms)
```

## 使い方 (Side-effect import)
どちらもインポートするだけで `image.Decode` で AVIF が扱えるようになります。

```go
import (
    "image"
    _ "github.com/vegidio/avif-go" // 高速なこちらを推奨
)

func main() {
    img, format, err := image.Decode(file)
    // format == "avif"
}
```

## 結論
パフォーマンスに 10 倍の開きがあるため、CGo が許容できる環境であれば **`vegidio/avif-go`** を強く推奨します。
ビルド環境の制約でどうしても CGo を避けたい場合のみ `gen2brain/avif` を検討してください。
