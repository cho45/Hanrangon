# Admin Frontend

Hanrangon 管理画面用のモダンな Svelte フロントエンド。
Vite + Svelte 5 + TypeScript で構築されています。

## 開発方法

```bash
# 依存関係のインストール
npm install

# 開発用サーバの起動 (HMR有効)
npm run dev

# プロダクションビルド
# static/admin/ に成果物が出力されます
npm run build
```

## 技術構成

- **Svelte 5**: UI フレームワーク (Runes を使用)
- **Vite**: ビルドツール
- **TypeScript**: 静的型付け
- **strftime**: 日付フォーマット
