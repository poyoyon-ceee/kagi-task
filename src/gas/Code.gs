const SHEET_ID = '1ZFpJtweMHXH6zUHM10NQxchkvb_dif2WClbYcybzsiw'; 
const SHEET_NAME = 'main';
const CONFIG_SHEET_NAME = 'config';

function doGet() {
  return HtmlService.createTemplateFromFile('Index')
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
        completeDate: formatDate(row[13])
      };
    }).filter(item => item !== null);

    // --- 2. 設定データ ---
    const configSheet = ss.getSheetByName(CONFIG_SHEET_NAME);
    let districts = [];
    let staffs = [];
    
    if (configSheet) {
      const lastRow = configSheet.getLastRow();
      if (lastRow > 0) {
        const configData = configSheet.getRange(1, 1, lastRow, 2).getValues();
        districts = configData.map(r => r[0]).filter(v => v && String(v).trim() !== "");
        staffs = configData.map(r => r[1]).filter(v => v && String(v).trim() !== "");
      }
    }

    return { items: items, master: { districts: districts, staffs: staffs } };

  } catch (e) { 
    return { items: [], master: { districts: [], staffs: [] } }; 
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
      "", "", "" 
    ];
    sheet.appendRow(row);
    return { success: true, newId: String(nextId), newRecNo: String(nextRecNo) };
  } catch (e) { return { success: false, message: e.toString() }; }
}

function updateItem(id, updateData) {
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAME);
    const ids = sheet.getRange("A:A").getValues().flat();
    const rowIndex = ids.findIndex(val => String(val) === String(id));
    
    if (rowIndex === -1) return { success: false, message: 'IDが見つかりません' };
    const rowNum = rowIndex + 1;
    
    if (updateData.okamotoDate !== undefined) sheet.getRange(rowNum, 12).setValue(updateData.okamotoDate);
    if (updateData.pic !== undefined) sheet.getRange(rowNum, 13).setValue(updateData.pic);
    if (updateData.completeDate !== undefined) sheet.getRange(rowNum, 14).setValue(updateData.completeDate);
    
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
