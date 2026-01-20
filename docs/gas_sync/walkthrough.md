# ウォークスルー: GAS同期設定

## 実施した内容

### 1. clasp の導入
`npm install -D @google/clasp` を実行し、GAS操作用のツールをインストールしました。

### 2. 設定ファイルの作成
ローカルとGASの架け橋となる設定ファイルを作成しました。

- `.clasp.json`:
  ```json
  {
    "scriptId": "YOUR_SCRIPT_ID_HERE",
    "rootDir": "./src/gas"
  }
  ```
  `rootDir` を `src/gas` に指定することで、プロジェクトルートの他のファイル（`node_modules` など）がGASにアップロードされるのを防いでいます。

- `.claspignore`:
  GASにアップロード不要なファイル（`.git` や `docs` など）をより確実に除外するための設定を追加しました。

### 3. npm スクリプトの追加
以下のコマンドを `package.json` に追加し、ツールを直接知らなくても実行できるようにしました。

- `npm run gas:push`: ローカル -> GAS へアップロード
- `npm run gas:pull`: GAS -> ローカル へダウンロード
- `npm run gas:watch`: ファイル変更を検知して自動 push
- `npm run gas:open`: ブラウザでGASエディタを開く
- `npm run gas:deploy`: GASの新しいバージョンをデプロイ

## 次のステップ
1.  **ログイン**: ターミナルで `npx clasp login` を実行して、Googleアカウントで認証してください。
2.  **IDの設定**: `.clasp.json` の `"YOUR_SCRIPT_ID_HERE"` を、対象のGASプロジェクトのスクリプトIDに置き換えてください。
    - スクリプトIDは、GASエディタの「プロジェクトの設定」（歯車アイコン）から確認できます。
3.  **動作確認**: `npm run gas:push` を実行し、GAS側にコードが反映されるか確認してください。
