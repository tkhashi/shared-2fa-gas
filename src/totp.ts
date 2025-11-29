/**
 * TOTP関連の処理
 * authenticatorライブラリを使用
 */

// authenticatorはCommonJS形式のみなのでrequireを使用
// @ts-ignore
const authenticator = require('authenticator');

/**
 * Base32エンコードされたシークレットからTOTPトークンを生成
 */
export function generateTotpToken(secretBase32: string): string {
  return authenticator.generateToken(secretBase32);
}

/**
 * TOTPの残り秒数を計算（30秒ステップ）
 */
export function getRemainingSeconds(): number {
  const step = 30;
  const epochSeconds = Math.floor(Date.now() / 1000);
  return step - (epochSeconds % step);
}
