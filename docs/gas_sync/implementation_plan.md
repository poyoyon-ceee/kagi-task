# GAS同期設定 実装計画

## 概要
このプロジェクトを Google Apps Script (GAS) とローカル環境で同期できるように、`clasp` (Command Line Apps Script Projects) を導入・設定します。

## 変更内容
1.  **claspのインストール**: `@google/clasp` を `devDependencies` に追加。
2.  **設定ファイルの作成**:
    *   `.clasp.json`: GASプロジェクトとの紐付け（`rootDir` を `src/gas` に設定）。
    *   `.claspignore`: 同期対象外ファイルを指定。
3.  **npmスクリプトの追加**: `package.json` に push/pull/open/deploy などのコマンドを追加。

## 同期手順
1.  `npm install` を実行。
2.  `clasp login` でGoogleアカウントにログイン。
3.  `.clasp.json` の `scriptId` を実際のプロジェクトIDに書き換える。
4.  `npm run gas:push` でローカルのコードをGASにアップロード。

## リスク・注意点
*   GAS側で直接編集した内容がある場合、`npm run gas:pull` を実行しないとローカルに反映されず、`push` 時に上書きされる可能性があります。
*   `appsscript.json` も同期対象に含まれるため、スコープの変更などに注意が必要です。
