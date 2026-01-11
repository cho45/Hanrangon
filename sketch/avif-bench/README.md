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
`static/fixtures/sample.avif` (1.9MP, 411KB) を使用。

| ライブラリ | 実行時間/枚 | 1秒あたりの処理数 | 方式 |
| :--- | :--- | :--- | :--- |
| **vegidio/avif-go** | **約 47 ms** | **約 21 枚** | **CGo (高速)** |
| **gen2brain/avif** | **約 475 ms** | **約 2 枚** | **WASM (低速)** |

### 実際の計測データ
```text
BenchmarkVegidio-8            22          47112913 ns/op
BenchmarkGen2brain-8           3         475802931 ns/op
```
※ `ns/op` は1操作あたりのナノ秒。数値が小さいほど高速。

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
