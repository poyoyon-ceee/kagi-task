/**
 * 鍵交換進捗管理システム - バックエンド (Google Apps Script)
 * Version: dev1.0.0.20260115.3
 */

const SHEET_ID = '1ZFpJtweMHXH6zUHM10NQxchkvb_dif2WClbYcybzsiw'; 
const SHEET_NAME = 'main';

/**
 * Webアプリケーションとして表示
 */
function doGet() {
  return HtmlService.createTemplateFromFile('Index')
    .evaluate()
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setTitle('KeyExchange Manager')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * データの取得
 * @returns {Array<Object>}
 */
function getData() {
  try {
    const ss = SHEET_ID ? SpreadsheetApp.openById(SHEET_ID) : SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) throw new Error(`シート "${SHEET_NAME}" が見つかりません。`);

    const data = sheet.getDataRange().getValues();
    const headers = data.shift(); // ヘッダーを分離

    return data.map((row, index) => {
      return {
        rowNum: index + 2, // 1-indexed, headers skipped
        id: row[0] || '',
        receptionNo: row[1] || '',
        receptionDate: formatDate(row[2]),
        dueDate: formatDate(row[3]),
        district: row[4] || '',
        address: row[5] || '',
        roomNo: row[6] || '',
        isNewEntrance: !!row[7],
        isUsedEntrance: !!row[8],
        storage: row[9] || '',
        ps: row[10] || '',
        okamotoDate: formatDate(row[11]),
        pic: row[12] || '',
        completeDate: formatDate(row[13])
      };
    });
  } catch (e) {
    console.error(e);
    return [];
  }
}

/**
 * 特定行の更新
 * @param {string} id 一意のID
 * @param {Object} updateData 更新内容
 */
function updateItem(id, updateData) {
  try {
    const ss = SHEET_ID ? SpreadsheetApp.openById(SHEET_ID) : SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_NAME);
    const data = sheet.getDataRange().getValues();
    
    const rowIndex = data.findIndex(row => row[0] == id);
    if (rowIndex === -1) return { success: false, message: 'IDが見つかりません' };
    
    const rowNum = rowIndex + 1;
    
    // 更新可能な項目のみ処理
    if (updateData.okamotoDate !== undefined) {
      sheet.getRange(rowNum, 12).setValue(updateData.okamotoDate);
    }
    if (updateData.pic !== undefined) {
      sheet.getRange(rowNum, 13).setValue(updateData.pic);
    }
    if (updateData.completeDate !== undefined) {
      sheet.getRange(rowNum, 14).setValue(updateData.completeDate);
    }
    
    return { success: true };
  } catch (e) {
    return { success: false, message: e.toString() };
  }
}

/**
 * 日付の整形 (JST)
 */
function formatDate(date) {
  if (!date || date === "" || isNaN(new Date(date).getTime())) return "";
  return Utilities.formatDate(new Date(date), "JST", "yyyy-MM-dd");
}
