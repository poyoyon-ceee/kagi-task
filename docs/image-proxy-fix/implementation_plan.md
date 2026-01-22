# 画像プロキシ機能の実装計画

## ゴール
Googleアカウントにログインしていない端末（会社用スマホなど）や、サードパーティCookieが無効なブラウザ環境でも、Google Drive上の写真を確実に閲覧できるようにする。

## 問題の背景
- 現在は `<img>` タグの `src` または `window.open()` で Google Drive のプレビューURLを直接開いている。
- この方法は、閲覧者のブラウザに有効な Google アカウントセッション（または認証情報のキャッシュ）が存在しない場合、Google のログイン画面にリダイレクトされてしまう。
- プライベートモードでは余計なセッション情報がないため閲覧できるが、通常モードでは干渉が起きやすい。

## 解決策：GAS経由の画像プロキシ
GAS (Google Apps Script) を画像の中継サーバーとして利用する。
1. アプリ（Index.html）は、画像を直接開くのではなく、GASのウェブアプリURLに `?mode=image&id=FILE_ID` をつけてアクセスする。
2. GAS (`Code.gs`) は、指定されたファイルIDの画像を DriveApp で取得する。
3. GAS は、取得した画像を Base64 エンコードし、単純な `<img>` タグのみを含んだ HTML を生成して返す。
4. これにより、ユーザーのブラウザは「GASが生成したHTML」を見るだけとなり、Google Drive への直接アクセス（認証）が不要になる。

## 変更内容

### [GAS] src/gas/Code.gs
#### [MODIFY] doGet
- `mode === 'image'` の分岐を追加。
- この分岐で `serveImage(id)` を呼び出し、結果を返す。

#### [NEW] serveImage
- 引数: `id` (ファイルID)
- 処理:
    - `DriveApp.getFileById(id)` でファイル取得。
    - `getBlob()` でデータ取得。
    - `Utilities.base64Encode()` でBase64化。
    - HTML テンプレートを作成し、`<img src="data:image/jpeg;base64,...">` を埋め込んで返す。

### [FRONTEND] src/gas/Index.html
#### [MODIFY] Script Injection
- `<script>` タグ内で `const SCRIPT_URL = "<?= ScriptApp.getService().getUrl() ?>";` を定義し、自身のURLを取得可能にする。

#### [MODIFY] Vue Methods (openImageProxied)
- `window.open(item.imageUrl)` している箇所を、新しいメソッド `openImageProxied(url)` への呼び出しに変更。
- `openImageProxied(url)`:
    - URLからファイルIDを抽出（正規表現）。
    - `window.open(SCRIPT_URL + '?mode=image&id=' + id)` を実行。

## 検証計画
### 手動検証
1. 改修後、デプロイを行う。
2. 会社用スマホ（またはChromeのシークレットウィンドウではない通常ウィンドウで、別アカウントログイン状態など）でアプリを開く。
3. 「写真」アイコン（または詳細画面の写真ボタン）をクリックする。
4. 新しいタブが開き、Googleログイン画面を経ずに画像が表示されることを確認する。
