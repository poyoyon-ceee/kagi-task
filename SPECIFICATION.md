
# 鍵交換進捗管理システム 開発仕様書

## 1. プロジェクト概要

* **システム名:** KeyExchange Manager (鍵交換管理アプリ)
* **目的:** 鍵交換業務の進捗（新規・進行中・完了）をスマホからリアルタイムで共有・更新する。
* **ターゲットユーザー:** 現場スタッフ（岡本様、作業員等）。
* **運用環境:** 社用スマートフォン（Googleアカウントログイン不要、ブラウザ利用）。

## 2. システムアーキテクチャ

Google Apps Script (GAS) をバックエンド、Google Spreadsheet をデータベースとして利用するサーバーレスWebアプリケーション。

* **プラットフォーム:** Google Apps Script (Web App形式)
* **データベース:** Google Spreadsheet
* **フロントエンド:**
* **HTML/CSS:** Bootstrap 5 (レスポンシブデザイン、タブUI)
* **JavaScript:** Vue.js 3 (CDN版 - 状態管理、動的描画)


* **認証:** アプリ内簡易パスワード認証（フロントエンド制御）

## 3. データベース設計 (Google Spreadsheet)

シート名: `main`

| 列 | 項目名 | 変数名(Key) | データ型 | 備考・ロジック |
| --- | --- | --- | --- | --- |
| A | ID | `id` | UUID | 行を一意に特定するID |
| B | 受付番号 | `receptionNo` | String |  |
| C | 受付日 | `receptionDate` | Date | `<input type="date">` |
| D | 完了予定日 | `dueDate` | Date |  |
| E | 地区 | `district` | String |  |
| F | 対象住所 | `address` | String |  |
| G | 号室 | `roomNo` | String |  |
| H | 玄関新品 | `isNewEntrance` | Boolean |  |
| I | 玄関中古 | `isUsedEntrance` | Boolean |  |
| J | 物置 | `storage` | String |  |
| K | PS | `ps` | String |  |
| L | **岡本受取日** | `okamotoDate` | Date | **入力で「進行中」へ遷移** |
| M | 完了受付者 | `pic` | String |  |
| N | **完了報告日** | `completeDate` | Date | **入力で「完了」へ遷移** |

### ステータス判定ロジック（フロントエンド/バックエンド共通）

スプレッドシートに関数を入れずとも、アプリ側で以下のロジックにてデータを振り分けます。

1. **完了:** `completeDate` が入力済み
2. **進行中:** `okamotoDate` が入力済み かつ `completeDate` が未入力
3. **新規:** 上記以外

## 4. 機能要件

### 4.1. 認証機能

* 初回アクセス時にパスワード入力モーダルを表示。
* 正しいパスワード（例: `key1234`）入力でメイン画面へ遷移。
* セッション維持: ブラウザを閉じるまで（簡易実装）。

### 4.2. メイン画面構成

* **ヘッダー:** アプリ名表示。
* **タブナビゲーション:** 「新規」「進行中」「完了」の3タブ切り替え。
* **リスト表示:** 各タブに対応した案件をカード形式で一覧表示。
* カードには「住所」「号室」「期限」などの重要情報を表示。
* ステータスに応じた色分け（例: 期限間近は赤字など）。



### 4.3. 詳細・編集モーダル

* リストのカードをタップすると詳細画面（モーダル）が開く。
* **編集機能:**
* 「岡本受取日」の入力 → 保存 → 自動的に「進行中」タブへ移動。
* 「完了報告日」の入力 → 保存 → 自動的に「完了」タブへ移動。



## 5. 実装ステップとコードテンプレート

### Step 1: スプレッドシートの準備

1. 新規スプレッドシートを作成し、シート名を `main` に変更。
2. 1行目に上記のカラム名を入力。
3. 拡張機能 > Apps Script を開く。

### Step 2: バックエンド (Code.gs)

以下のコードを `Code.gs` に貼り付けます。これにより、HTMLを表示し、スプレッドシートのデータを読み書きします。

```javascript
// Code.gs

// シートIDとシート名を設定
const SHEET_ID = 'ここにスプレッドシートIDを入れる';
const SHEET_NAME = 'main';

function doGet() {
  return HtmlService.createTemplateFromFile('Index')
    .evaluate()
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setTitle('鍵交換管理アプリ')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// データの取得 API
function getData() {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
  const data = sheet.getDataRange().getValues();
  const headers = data.shift(); // ヘッダー除去
  
  // オブジェクト配列に変換して返す
  return data.map(row => {
    return {
      id: row[0],
      receptionNo: row[1],
      receptionDate: formatDate(row[2]),
      dueDate: formatDate(row[3]),
      district: row[4],
      address: row[5],
      roomNo: row[6],
      // ... 他の項目も同様にマッピング
      okamotoDate: formatDate(row[11]),
      completeDate: formatDate(row[13])
    };
  });
}

// データ更新 API
function updateItem(id, updateData) {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
  const data = sheet.getDataRange().getValues();
  
  // IDで該当行を検索 (1列目がIDと仮定)
  const rowIndex = data.findIndex(row => row[0] == id);
  
  if (rowIndex > -1) {
    // 実際の行番号は index + 1
    const rowNum = rowIndex + 1;
    
    // 例: 岡本受取日(L列=12列目)の更新
    if (updateData.okamotoDate !== undefined) {
      sheet.getRange(rowNum, 12).setValue(updateData.okamotoDate);
    }
    // 例: 完了報告日(N列=14列目)の更新
    if (updateData.completeDate !== undefined) {
      sheet.getRange(rowNum, 14).setValue(updateData.completeDate);
    }
    
    return { success: true };
  }
  return { success: false, message: 'ID not found' };
}

// 日付フォーマット用ヘルパー
function formatDate(date) {
  if (!date || date === "") return "";
  return Utilities.formatDate(new Date(date), "JST", "yyyy-MM-dd");
}

```

### Step 3: フロントエンド (Index.html)

スクリプトエディタで `Index.html` を作成し、以下を記述します。Vue.jsとBootstrapを利用したモダンな構成です。

```html
<!DOCTYPE html>
<html>
<head>
  <base target="_top">
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
  <style>
    body { background-color: #f8f9fa; padding-bottom: 50px; }
    .card { margin-bottom: 10px; border: none; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .status-badge { font-size: 0.8em; }
  </style>
</head>
<body>
  <div id="app" class="container mt-3">
    
    <div v-if="!isAuthenticated" class="text-center mt-5">
      <h3>鍵交換管理ログイン</h3>
      <input type="password" v-model="inputPass" class="form-control mb-3" placeholder="パスワード">
      <button @click="login" class="btn btn-primary w-100">ログイン</button>
    </div>

    <div v-else>
      <h5 class="mb-3">進捗管理</h5>
      
      <ul class="nav nav-pills mb-3 nav-fill">
        <li class="nav-item">
          <a class="nav-link" :class="{active: currentTab === 'new'}" @click="currentTab = 'new'" href="#">新規</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" :class="{active: currentTab === 'progress'}" @click="currentTab = 'progress'" href="#">進行中</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" :class="{active: currentTab === 'done'}" @click="currentTab = 'done'" href="#">完了</a>
        </li>
      </ul>

      <div v-for="item in filteredItems" :key="item.id" class="card" @click="openModal(item)">
        <div class="card-body">
          <h6 class="card-title">{{ item.district }} {{ item.address }} {{ item.roomNo }}</h6>
          <p class="card-text text-muted small">
            期限: {{ item.dueDate }}<br>
            担当: {{ item.pic || '未定' }}
          </p>
        </div>
      </div>
    </div>
    
    </div>

  <script src="https://cdn.jsdelivr.net/npm/vue@3.2.0/dist/vue.global.prod.js"></script>
  <script>
    const { createApp } = Vue;

    createApp({
      data() {
        return {
          isAuthenticated: false,
          inputPass: '',
          passCode: 'key1234', // 簡易パスワード設定
          currentTab: 'new',
          items: [], // GASから取得したデータが入る
          selectedItem: null
        }
      },
      computed: {
        filteredItems() {
          return this.items.filter(item => {
            // ステータス判定ロジック
            let status = 'new';
            if (item.completeDate) status = 'done';
            else if (item.okamotoDate) status = 'progress';
            
            return status === this.currentTab;
          });
        }
      },
      mounted() {
        // アプリ起動時にデータを取得
        // google.script.run.withSuccessHandler(this.setData).getData();
        // ※実際はログイン後にロードなど調整
      },
      methods: {
        login() {
          if(this.inputPass === this.passCode) {
            this.isAuthenticated = true;
            this.loadData();
          } else {
            alert('パスワードが違います');
          }
        },
        loadData() {
          google.script.run.withSuccessHandler(data => {
            this.items = data;
          }).getData();
        },
        openModal(item) {
          // モーダルを開く処理
          this.selectedItem = item;
          // Bootstrap Modalの表示処理...
        }
      }
    }).mount('#app');
  </script>
</body>
</html>

```

## 6. デプロイ手順（最重要）

社内スマホからアクセス可能にするための設定です。

1. GAS画面右上の「デプロイ」 > 「新しいデプロイ」を選択。
2. 「種類の選択」の歯車アイコン > 「ウェブアプリ」を選択。
3. **説明:** 「v1」など入力。
4. **次のユーザーとして実行:** **「自分 (Me)」** を選択。
5. **アクセスできるユーザー:** **「全員 (Anyone)」** を選択。
* *※Google Workspace利用の場合、「全員（Googleアカウントを持つ全員）」ではなく、完全な「全員」が表示されているか要確認。表示されない場合は管理コンソールでの設定が必要です。*


6. 「デプロイ」をクリックし、発行されたURLをスマホに送る。

