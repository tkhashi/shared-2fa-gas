/**
 * サービスとアカウントの組み合わせ
 */
export interface ServiceAccount {
  service: string;
  account: string;
}

/**
 * TOTPページに表示するデータ
 */
export interface TotpPageData {
  items?: ServiceAccount[];
  service?: string;
  account?: string;
  token: string;
  remaining: number;
  formAction?: string; // フォームのaction URL
}

/**
 * TOTP設定の定数
 */
export const TOTP_STEP_SECONDS = 30;
export const TOTP_DIGITS = 6;

/**
 * selector値のエンコード/デコードに使用するセパレータ
 */
export const SERVICE_ACCOUNT_SEPARATOR = '/';

/**
 * ServiceAccountをselector用の値にエンコードする
 */
export function encodeServiceAccountId(sa: ServiceAccount): string {
  return `${sa.service}${SERVICE_ACCOUNT_SEPARATOR}${sa.account}`;
}

/**
 * selector値からServiceAccountをデコードする
 */
export function decodeServiceAccountId(raw: string): ServiceAccount {
  const [service, account] = raw.split(SERVICE_ACCOUNT_SEPARATOR);
  return { service, account };
}
