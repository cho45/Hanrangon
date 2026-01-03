# Admin Frontend

Hanrangon 管理画面用のモダンな Web Components フロントエンド。
Vite + Lit + TypeScript で構築されています。

## 開発方法

```bash
# 依存関係のインストール
npm install

# 開発用サーバの起動 (HMR有効)
# 注: Go 側のテンプレートが localhost:5173 を参照している必要があります
npm run dev

# プロダクションビルド
# static/admin/ に成果物が出力されます
npm run build
```

## 技術構成

- **Lit**: Web Components フレームワーク
- **Vite**: ビルドツール
- **TypeScript**: 静的型付け
- **strftime**: 日付フォーマット
