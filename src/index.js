// --- process polyfill for GAS ---
if (typeof process === 'undefined') {
  var process = {
    env: {},
    argv: [],
    version: '',
    cwd: function () {
      return '';
    }
  };
}
// --- end process polyfill ---


const { authenticator } = require('authenticator');

const SHEET_NAME = 'secret-key'; // A:service, B:account, C:secret(Base32)

/**
 * 初期表示用
 */
function doGet(e) {
  const template = HtmlService.createTemplateFromFile('index');
  const data = createInitialData();
  template.data = JSON.stringify(data);
  return template
    .evaluate()
    .setTitle('Shared 2FA')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * あなたが引用したZennの記事の doPost 相当
 */
function doPost(e) {
  const params = e.parameter || {};
  const serviceParam = params.service;
  const accountParam = params.account;

  const data = {
    service: serviceParam,
    account: accountParam,
    token: '',
    remaining: getRemainingSeconds(),
  };

  const sheet = SpreadsheetApp.getActive().getSheetByName(SHEET_NAME);
  if (!sheet) {
    throw new Error('sheet not found: ' + SHEET_NAME);
  }

  const lastRow = sheet.getLastRow();
  if (lastRow >= 2) {
    const sheetData = sheet.getRange(2, 1, lastRow - 1, 3).getValues(); // A2:Cn

    for (const row of sheetData) {
      const service = row[0];
      const account = row[1];
      const secret = row[2];
      if (service === serviceParam && account === accountParam) {
        // ★ TOTP生成はライブラリに丸投げ
        data.token = authenticator.generateToken(secret);
        data.remaining = getRemainingSeconds();
        break;
      }
    }
  }

  const template = HtmlService.createTemplateFromFile('index');
  template.data = JSON.stringify(data);
  return template
    .evaluate()
    .setTitle('Shared 2FA')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * 初期表示用のサービス一覧
 */
function createInitialData() {
  const sheet = SpreadsheetApp.getActive().getSheetByName(SHEET_NAME);
  if (!sheet) {
    throw new Error('sheet not found: ' + SHEET_NAME);
  }

  const lastRow = sheet.getLastRow();
  const items = [];

  if (lastRow >= 2) {
    const sheetData = sheet.getRange(2, 1, lastRow - 1, 3).getValues();
    for (const row of sheetData) {
      const service = row[0];
      const account = row[1];
      items.push({ service, account });
    }
  }

  return {
    items,
    token: '',
    remaining: getRemainingSeconds(),
  };
}

/**
 * 残り秒数（30秒ステップ）
 */
function getRemainingSeconds() {
  const step = 30;
  const epochSeconds = Math.floor(Date.now() / 1000);
  return step - (epochSeconds % step);
}

// --- export to GAS global ---
// V8 ランタイムなら globalThis が使えるので、これで確実にグローバルに出す
if (typeof globalThis !== 'undefined') {
  globalThis.doGet = doGet;
  globalThis.doPost = doPost;
} else {
  // 念のため fallback（普通はいらないが保険）
  this.doGet = doGet;
  this.doPost = doPost;
}