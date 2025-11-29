import { ServiceAccount } from './types';

const SHEET_NAME = 'secret-key';

/**
 * スプレッドシートからサービスアカウント一覧を取得
 */
export function fetchServiceAccounts(): ServiceAccount[] {
  const sheet = SpreadsheetApp.getActive().getSheetByName(SHEET_NAME);
  if (!sheet) {
    throw new Error(`sheet not found: ${SHEET_NAME}`);
  }

  const lastRow = sheet.getLastRow();
  const result: ServiceAccount[] = [];

  if (lastRow >= 2) {
    const rows = sheet.getRange(2, 1, lastRow - 1, 3).getValues();
    for (const row of rows) {
      const [service, account, secret] = row as [string, string, string];
      // 空行スキップ
      if (!service || !account || !secret) {
        continue;
      }
      result.push({ service, account });
    }
  }

  return result;
}

/**
 * 指定されたサービスとアカウントのシークレットを取得
 */
export function findSecret(service: string, account: string): string | null {
  const sheet = SpreadsheetApp.getActive().getSheetByName(SHEET_NAME);
  if (!sheet) {
    throw new Error(`sheet not found: ${SHEET_NAME}`);
  }

  const lastRow = sheet.getLastRow();

  if (lastRow >= 2) {
    const rows = sheet.getRange(2, 1, lastRow - 1, 3).getValues();
    for (const row of rows) {
      const [rowService, rowAccount, rowSecret] = row as [string, string, string];
      // 空行スキップ
      if (!rowService || !rowAccount || !rowSecret) {
        continue;
      }

      if (rowService === service && rowAccount === account) {
        return rowSecret;
      }
    }
  }

  return null;
}
