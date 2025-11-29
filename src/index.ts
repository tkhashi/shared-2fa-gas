/**
 * GAS エントリポイント
 * doGet / doPost を実装
 */

// --- process polyfill for GAS ---
// @ts-ignore
if (typeof process === 'undefined') {
  // @ts-ignore
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

import { TotpPageData, decodeServiceAccountId } from './types';
import { fetchServiceAccounts, findSecret } from './sheet';
import { generateTotpToken, getRemainingSeconds } from './totp';

/**
 * 初期表示用
 */
function doGet(e: GoogleAppsScript.Events.DoGet): GoogleAppsScript.HTML.HtmlOutput {
  const template = HtmlService.createTemplateFromFile('index');
  const data: TotpPageData = {
    items: fetchServiceAccounts(),
    token: '',
    remaining: getRemainingSeconds(),
    formAction: ScriptApp.getService().getUrl(),
  };
  template.data = JSON.stringify(data);
  return template
    .evaluate()
    .setTitle('Shared 2FA')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * フォーム送信時の処理
 */
function doPost(e: GoogleAppsScript.Events.DoPost): GoogleAppsScript.HTML.HtmlOutput {
  const params = e.parameter || {};
  const entry = params.entry || '';

  Logger.log('doPost params: ' + JSON.stringify(params));

  // entryから service と account を取り出す
  const { service, account } = decodeServiceAccountId(entry);

  Logger.log('service=' + service + ', account=' + account);

  const data: TotpPageData = {
    items: fetchServiceAccounts(),
    service,
    account,
    token: '',
    remaining: getRemainingSeconds(),
    formAction: ScriptApp.getService().getUrl(),
  };

  // シークレットを取得してトークン生成
  const secret = findSecret(service, account);
  if (secret) {
    data.token = generateTotpToken(secret);
    Logger.log('generated token=' + data.token);
  } else {
    Logger.log('secret not found for service=' + service + ', account=' + account);
  }

  const template = HtmlService.createTemplateFromFile('index');
  template.data = JSON.stringify(data);
  return template
    .evaluate()
    .setTitle('Shared 2FA')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// --- export to GAS global ---
// V8 ランタイムなら globalThis が使えるので、これで確実にグローバルに出す
if (typeof globalThis !== 'undefined') {
  // @ts-ignore
  globalThis.doGet = doGet;
  // @ts-ignore
  globalThis.doPost = doPost;
} else {
  // 念のため fallback（普通はいらないが保険）
  // @ts-ignore
  this.doGet = doGet;
  // @ts-ignore
  this.doPost = doPost;
}
