# UI改善タスク：静的モックアップ作成

UIの改善を効率的に行うため、Google Apps Script（GAS）に依存しない静的なHTMLモックアップを作成し、デザインのブラッシュアップを先行して実施する。

## タスクリスト

- [x] UI改善用ドキュメントフォルダの作成 (`docs/ui_improvement`)
- [x] 実装計画の作成 (`implementation_plan.md`)
- [x] 静的モックアップファイルの作成 (`index-ui.html`)
    - [x] `src/gas/Index.html` からコードを移植
    - [x] `google.script.run` などのGAS固有コードをモック化
    - [x] 静的表示用のサンプルデータを追加
- [x] カードのコンパクト化（上下幅半分以下）
    - [x] CSSの調整（パディング、フォントサイズ）
    - [x] レイアウトの見直し（1〜2行に集約）
- [x] デザインのブラッシュアップ（順次実施）
- [x] 最終的に `src/gas/Index.html` への反映

## 追加実装タスク
- [x] 依頼担当者リスト機能の実装（Code.gs / UI）
- [x] ステータス同期機能の実装（configシート連携）
- [x] 住所リストロジックの修正
- [x] v1.0.0 リリース（docs更新 / commit / merge）
