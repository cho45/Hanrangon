# POC: LLM Summary Generator

このPOCは、OpenAI互換のLLM APIを使用して、ブログ記事の要約を生成するものです。

## 使い方

```bash
# ビルド
go build -o poc-llm-summary cmd/poc-llm-summary/main.go

# 実行
export OPENAI_API_KEY="your-api-key-here"
./poc-llm-summary -entry [entry-id]

# オプションの指定
./poc-llm-summary -entry [entry-id] -endpoint [api-endpoint] -model [model-name]
```

### オプション

- `-entry`: 要約するエントリのID（必須）
- `-endpoint`: APIエンドポイント（デフォルト: https://api.ai.sakura.ad.jp/v1/chat/completions）
- `-model`: 使用するモデル名（デフォルト: llm-jp-3.1-8x13b-instruct4）

### 環境変数

- `OPENAI_API_KEY`: APIキー（必須）

## 動作原理

1. 指定されたエントリIDでデータベースからエントリを取得
2. エントリの本文をOpenAI互換APIに送信して要約を生成
3. 生成された要約をコンソールに表示

## プロンプトの内容

このPOCでは、以下のプロンプトを使用して要約を生成します：

```
あなたはプロのWeb編集者です。
ユーザーが入力したブログ記事の本文をもとに、OGP（SNSシェア用）およびメタディスクリプション用の要約文を作成してください。

# 制約条件
- **文字数**: 70文字程度（60文字〜80文字以内）に厳密に収めること。
- **目的**: 読者がクリックしたくなるようなフックを含めること。
- **禁止事項**:
  - 「この記事では～」「～について解説します」といった導入句は文字数の無駄なので禁止する。いきなり本題から入る。
  - ハッシュタグ（#）は含めない。
- **文体**: 記事のトーンに合わせるが、簡潔さを最優先し、体言止めなどを活用して情報を圧縮する。

# 出力形式
要約したテキストのみを出力してください。

以下がブログ記事の本文です:
[エントリの本文]
```

## 制限事項

- このPOCは70文字程度の要約を生成することを想定していますが、実際の生成される要約の長さは使用するモデルによって異なります。
- APIキーは環境変数で渡す必要があります。