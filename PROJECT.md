# kagi-task - プロジェクト概要

> **AI向け**: このファイルを最初に読んでください。プロジェクトの全体像を把握するためのエントリーポイントです。

## プロジェクト情報

| 項目 | 内容 |
|------|------|
| プロジェクト名 | kagi-task |
| 説明 | 鍵交換管理 |
| 最終更新 | 2026-01-15 |
| バージョン | 0.1.0 |

## 技術スタック

| カテゴリ | 技術 |
|---------|-----|
| フロントエンド | HTML/CSS/JavaScript |
| CSSフレームワーク | Vanilla CSS |
| 配布形式 | Webアプリ（ブラウザ起動） |
| 接続形態 | オンライン（外部リソース利用可） |

## 技術制約

- オンライン: 外部リソース利用可


## 再利用モジュール

| モジュール | 場所 | 役割 |
|-----------|------|------|
| EventBus | `src/core/event-bus.js` | コンポーネント間イベント通信 |
| StateManager | `src/core/state-manager.js` | アプリケーション状態管理 |
| HTMLSanitizer | `src/utils/sanitizer.js` | XSS対策・入力サニタイズ |
| DataMigration | `src/utils/migration.js` | データマイグレーション・バージョン管理 |
| ConfigManager | `src/utils/config.js` | 設定管理・永続化 |
| DiffRenderer | `src/utils/diff.js` | 差分描画・変更箇所ハイライト |


## クイックスタート

```bash
npm install
# index.html をブラウザで開く
```

## 詳細仕様

👉 詳細は [SPECIFICATION.md](./SPECIFICATION.md) を参照

## 📚 ドキュメント読み順

1. **このファイル（PROJECT.md）** ← 今ここ
2. `SPECIFICATION.md` - 詳細仕様
3. `INDEX.md` - クイックスタート
4. `docs/` 配下 - 詳細ドキュメント

---

*このファイルはAIがプロジェクトを理解するためのメインエントリーポイントです。*
