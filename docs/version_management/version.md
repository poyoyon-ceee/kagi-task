# バージョン管理

## 現在のバージョン
**dev1.0.0.20260115.1**

## 更新履歴
- **2026-01-15: dev1.0.0.20260115.1**
  - 初回実装。
  - Google Apps Script (GAS) 向けの `Code.gs` および `Index.html` を作成。
  - プレミアムUI（グラスモーフィズム）を採用。
  - 認証機能、タブ切り替え、案件編集機能を実装。

## バージョン定義箇所
- `package.json`: 1.0.0
- `src/gas/Code.gs`: `const VERSION = 'dev1.0.0.20260115.1'` (コメント内)
- `src/gas/Index.html`: 表示用テキスト、セッション管理タグ等
- `docs/kagi-task-development/walkthrough.md`
