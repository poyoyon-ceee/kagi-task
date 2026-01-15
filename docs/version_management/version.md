# バージョン管理

## 現在のバージョン
**dev1.0.0.20260115.3**

## 更新履歴
- **2026-01-15: dev1.0.0.20260115.3**
  - スプレッドシート ID (1ZFpJtwe...) を `Code.gs` に設定。
  - 実運用に向けたバックエンド接続設定の完了。
- **2026-01-15: dev1.0.0.20260115.2**
  - Webアプリ環境での2重起動防止（シングルインスタンス）ロジックを実装。
  - BroadcastChannel を用いたタブ間通信による警告表示。
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

## 2重起動回避 (Single Instance) 管理
- **実装方法**: `BroadcastChannel` (ID: `kagi_task_single_instance`)
- **対象ファイル**:
  - `index.html`: `mounted()` ライフサイクルおよびスクリプト冒頭で、他タブの存在を確認しログまたはアラートを出力。

