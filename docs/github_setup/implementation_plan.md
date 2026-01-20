# 実装計画: GitHub連携とブランチ運用設定

GitHubに新規リポジトリを作成し、プロジェクトをプッシュします。また、`develop`ブランチを常設し、適切なマージフローを確立します。

## 1. 概要
- リポジトリ名: `kagi-task`
- 運用ルール: `main`（保護）、`develop`（開発用）
- 開発バージョンタグ: `dev1.0.0.20260115.1`

## 2. 手順

### フェーズ1: ローカルGit設定
1. `git init` で初期化
2. `.gitignore` の確認（必要に応じて作成/編集）
3. 全ファイルを `main` ブランチにコミット
4. `develop` ブランチを作成し切り替え (`git switch -c develop`)

### フェーズ2: ドキュメント作成
1. `docs/github_setup/` 下にタスクリスト、実装計画、ウォークスルーを作成
2. `develop` ブランチにてコミット

### フェーズ3: GitHub連携 (GitHub CLIを使用)
1. `gh repo create kagi-task --public --source=. --remote=origin` (利用可能な場合)
2. `gh` が利用不可の場合は、ユーザーにリポジトリ作成を依頼しURLを登録

### フェーズ4: マージとプッシュ
1. `main` ブランチへ `develop` をマージ
2. `main` および `develop` を GitHub へプッシュ

## 3. 2重起動回避について
- 本プロジェクトはWeb/TypeScriptプロジェクト（Vite）のようですが、将来的にデスクトップアプリ（Tauri等）化する場合は、ルールに従い2重起動回避を実装します。現時点ではGit運用の確立に集中します。
