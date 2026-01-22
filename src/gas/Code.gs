// VERSION: dev1.0.0.20260122.3
const SHEET_ID = '1ZFpJtweMHXH6zUHM10NQxchkvb_dif2WClbYcybzsiw'; 
const SHEET_NAME = 'main';
const CONFIG_SHEET_NAME = 'config';
const FOLDER_NAME = 'KeyExchange_Images';

function doGet(e) {
  const mode = (e && e.parameter && e.parameter.mode) || 'request';
  
  if (mode === 'image') {
    const id = (e && e.parameter && e.parameter.id);
    return serveImage(id);
  }

  let templateName;
  if (mode === 'worker') {
    templateName = 'IndexWorker';
  } else {
    templateName = 'IndexRequest';
  }
  
  return HtmlService.createTemplateFromFile(templateName)
    .evaluate()
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setTitle('KeyExchange Manager')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function getData() {
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    
    // --- 1. タスクデータ ---
    const sheet = ss.getSheetByName(SHEET_NAME);
    const range = sheet.getDataRange();
    const values = range.getValues();
    const displayValues = range.getDisplayValues();
    values.shift(); displayValues.shift();

    const items = values.map((row, i) => {
      if (!row[0]) return null;
      return {
        id: String(row[0]),
        receptionNo: String(displayValues[i][1]),
        receptionDate: formatDate(row[2]),
        dueDate: formatDate(row[3]),
        district: String(displayValues[i][4]),
        address: String(displayValues[i][5]),
        roomNo: String(displayValues[i][6]),
        // 追加項目も読み込む
        isNewEntrance: String(row[7] || ''), 
        isUsedEntrance: String(row[8] || ''),
        storage: String(row[9] || ''),
        ps: String(row[10] || ''),
        // 日付・担当者
        okamotoDate: formatDate(row[11]),
        pic: String(row[12] || ''),
        completeDate: formatDate(row[13]),
        imageUrl: String(row[14] || ''),
        // 新規追加列（P列・Q列）
        requester: String(row[15] || ''),
        receiver: String(row[16] || '')
      };
    }).filter(item => item !== null);

    // --- 2. 設定データ (A:地区, B:住所, C:担当者, D1:ステータスIndex, D2:ステータス日付) ---
    const configSheet = ss.getSheetByName(CONFIG_SHEET_NAME);
    let districts = [];
    let addressesByDistrict = {};
    let staffs = [];
    let savedStatusIndex = 0;
    let savedStatusDate = '';
    let requesters = [];
    
    if (configSheet) {
      const lastRow = configSheet.getLastRow();
      if (lastRow > 0) {
        // A~E列まで読み込む (5列)
        const configData = configSheet.getRange(1, 1, lastRow, 5).getValues();
        const districtSet = new Set();
        const staffSet = new Set();
        const requesterSet = new Set();
        
        configData.forEach((row, idx) => {
          const district = String(row[0] || '').trim();
          const address = String(row[1] || '').trim();
          const staff = String(row[2] || '').trim();
          const requester = String(row[4] || '').trim(); // E列
          
          if (district) {
            districtSet.add(district);
            if (!addressesByDistrict[district]) {
              addressesByDistrict[district] = [];
            }
            if (address) {
              addressesByDistrict[district].push(address);
            }
          }
          if (staff) {
            staffSet.add(staff);
          }
          if (requester) {
            requesterSet.add(requester);
          }
          
          // D列: 1行目=ステータスIndex, 2行目=ステータス日付
          if (idx === 0 && row[3] !== undefined && row[3] !== '') {
            savedStatusIndex = parseInt(row[3]) || 0;
          }
          if (idx === 1 && row[3] !== undefined && row[3] !== '') {
            savedStatusDate = formatDate(row[3]);
          }
        });
        
        districts = Array.from(districtSet);
        staffs = Array.from(staffSet);
        requesters = Array.from(requesterSet);
      }
    }

    return { 
      items: items, 
      master: { districts: districts, addressesByDistrict: addressesByDistrict, staffs: staffs, requesters: requesters },
      status: { index: savedStatusIndex, date: savedStatusDate }
    };

  } catch (e) { 
    return { items: [], master: { districts: [], addressesByDistrict: {}, staffs: [] } }; 
  }
}

function addItem(newItem) {
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAME);
    const lastRow = sheet.getLastRow();
    
    let nextId = 1; let nextRecNo = 1;
    if (lastRow > 1) {
      const data = sheet.getRange(2, 1, lastRow - 1, 2).getValues();
      const ids = data.map(r => parseInt(r[0]) || 0);
      const recNos = data.map(r => parseInt(r[1]) || 0);
      nextId = Math.max(0, ...ids) + 1;
      nextRecNo = Math.max(0, ...recNos) + 1;
    }

    const row = [ 
      nextId, 
      nextRecNo, 
      formatDate(new Date()), 
      newItem.dueDate, 
      newItem.district, 
      "'" + newItem.address, 
      "'" + newItem.roomNo,
      // ここに追加項目をセット
      newItem.isNewEntrance, 
      newItem.isUsedEntrance, 
      newItem.storage, 
      newItem.ps,
      "", "", "",
      newItem.imageUrl || "",
      // 新規追加列（P列・Q列）
      newItem.requester || "",
      ""  // receiver は後で入力
    ];
    sheet.appendRow(row);
    return { success: true, newId: String(nextId), newRecNo: String(nextRecNo) };
  } catch (e) { return { success: false, message: e.toString() }; }
}

function uploadImage(base64Data, fileName) {
  try {
    const folders = DriveApp.getFoldersByName(FOLDER_NAME);
    let folder;
    if (folders.hasNext()) {
      folder = folders.next();
    } else {
      folder = DriveApp.createFolder(FOLDER_NAME);
    }
    
    // Base64のヘッダー除去（data:image/jpeg;base64, など）
    const data = base64Data.split(',')[1] || base64Data;
    const decoded = Utilities.base64Decode(data);
    const blob = Utilities.newBlob(decoded, MimeType.JPEG, fileName || "image.jpg");
    const file = folder.createFile(blob);
    
    // 閲覧権限を「リンクを知っている全員」にする
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    
    // 直接表示可能なURLを生成（Googleアカウント不要）
    const fileId = file.getId();
    const directUrl = `https://drive.google.com/uc?export=view&id=${fileId}`;
    return { success: true, url: directUrl };
  } catch (e) {
    return { success: false, message: e.toString() };
  }
}

function updateItem(id, updateData) {
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAME);
    const ids = sheet.getRange("A:A").getValues().flat();
    const rowIndex = ids.findIndex(val => String(val) === String(id));
    
    if (rowIndex === -1) return { success: false, message: 'IDが見つかりません' };
    const rowNum = rowIndex + 1;
    
    // 基本情報の更新（D列〜K列, P列）
    if (updateData.dueDate !== undefined) sheet.getRange(rowNum, 4).setValue(updateData.dueDate);
    if (updateData.district !== undefined) sheet.getRange(rowNum, 5).setValue(updateData.district);
    if (updateData.address !== undefined) sheet.getRange(rowNum, 6).setValue("'" + updateData.address);
    if (updateData.roomNo !== undefined) sheet.getRange(rowNum, 7).setValue("'" + updateData.roomNo);
    if (updateData.isNewEntrance !== undefined) sheet.getRange(rowNum, 8).setValue(updateData.isNewEntrance);
    if (updateData.isUsedEntrance !== undefined) sheet.getRange(rowNum, 9).setValue(updateData.isUsedEntrance);
    if (updateData.storage !== undefined) sheet.getRange(rowNum, 10).setValue(updateData.storage);
    if (updateData.ps !== undefined) sheet.getRange(rowNum, 11).setValue(updateData.ps);
    if (updateData.requester !== undefined) sheet.getRange(rowNum, 16).setValue(updateData.requester);
    
    // 進捗情報の更新（L列, M列, N列, O列, Q列）
    if (updateData.okamotoDate !== undefined) sheet.getRange(rowNum, 12).setValue(updateData.okamotoDate);
    if (updateData.receiver !== undefined) sheet.getRange(rowNum, 17).setValue(updateData.receiver);
    if (updateData.pic !== undefined) sheet.getRange(rowNum, 13).setValue(updateData.pic);
    if (updateData.completeDate !== undefined) sheet.getRange(rowNum, 14).setValue(updateData.completeDate);
    if (updateData.imageUrl !== undefined) sheet.getRange(rowNum, 15).setValue(updateData.imageUrl);
    
    return { success: true };
  } catch (e) { return { success: false, message: e.toString() }; }
}

function formatDate(date) {
  if (!date || date === "") return "";
  const d = new Date(date);
  if (isNaN(d.getTime())) return String(date);
  const y = d.getFullYear();
  const m = ("0" + (d.getMonth() + 1)).slice(-2);
  const day = ("0" + d.getDate()).slice(-2);
  return `${y}-${m}-${day}`;
}

function updateStatus(statusIndex) {
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const configSheet = ss.getSheetByName(CONFIG_SHEET_NAME);
    if (!configSheet) return { success: false, message: 'configシートが見つかりません' };
    
    const today = formatDate(new Date());
    configSheet.getRange('D1').setValue(statusIndex);
    configSheet.getRange('D2').setValue(today);
    
    return { success: true };
  } catch (e) { return { success: false, message: e.toString() }; }
}

function serveImage(id) {
  try {
    if (!id) return HtmlService.createHtmlOutput('No ID provided');
    const file = DriveApp.getFileById(id);
    const blob = file.getBlob();
    const b64 = Utilities.base64Encode(blob.getBytes());
    const mime = blob.getContentType();
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Image Preview</title>
        <style>
          body { margin: 0; background: #000; display: flex; justify-content: center; align-items: center; height: 100vh; overflow: hidden; }
          img { max-width: 100%; max-height: 100%; object-fit: contain; }
        </style>
      </head>
      <body>
        <img src="data:${mime};base64,${b64}">
      </body>
      </html>
    `;
    return HtmlService.createHtmlOutput(html)
      .setTitle('Image Preview')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1');
  } catch (e) {
    return HtmlService.createHtmlOutput('<p style="color:red; background:white; padding:20px;">Error loading image: ' + e.toString() + '</p>');
  }
}
