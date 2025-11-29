/**
 * クライアント側のTypeScript
 * HTMLから読み込まれ、ブラウザで実行される
 */

import { 
  TotpPageData, 
  ServiceAccount, 
  encodeServiceAccountId,
  TOTP_STEP_SECONDS,
} from './types';

// google.script.runの型定義
declare const google: {
  script: {
    run: any;
  };
};

/** サーバーから渡されたデータ */
let DATA: TotpPageData;

/** 残り秒数（クライアント側で管理） */
let remainingSec: number | null = null;

/** カウントダウンタイマーID */
let timerId: number | null = null;

/**
 * ページ読み込み時の初期化処理
 * HTMLから呼び出される
 */
export function initializeApp(dataJson: string): void {
  DATA = JSON.parse(dataJson);
  populateServiceAccountSelector();
  displayToken();
  initializeRemainingSeconds();
  startCountdown();
}

/**
 * サービスアカウント選択肢を構築
 */
function populateServiceAccountSelector(): void {
  const select = document.getElementById('selector') as HTMLSelectElement | null;
  if (!select) return;

  // 既存のオプション（「選択してください」以外）を削除
  while (select.options.length > 1) {
    select.remove(1);
  }

  // サービス一覧から選択肢を生成
  if (DATA.items && Array.isArray(DATA.items)) {
    DATA.items.forEach((item: ServiceAccount) => {
      const opt = document.createElement('option');
      opt.value = encodeServiceAccountId(item);
      opt.textContent = formatServiceAccountLabel(item);
      select.appendChild(opt);
    });
  }
}

/**
 * ServiceAccountの表示用ラベルをフォーマット
 */
function formatServiceAccountLabel(sa: ServiceAccount): string {
  return `${sa.service} / ${sa.account}`;
}

/**
 * トークンを画面に表示
 */
function displayToken(): void {
  const tokenElement = document.getElementById('token');
  if (tokenElement) {
    tokenElement.textContent = DATA.token || '';
  }
}

/**
 * 残り秒数の初期値を設定
 */
function initializeRemainingSeconds(): void {
  if (typeof DATA.remaining === 'number' && !isNaN(DATA.remaining)) {
    remainingSec = DATA.remaining;
  } else {
    remainingSec = TOTP_STEP_SECONDS;
  }
}

/**
 * カウントダウンを開始
 */
function startCountdown(): void {
  const remainingElement = document.getElementById('remaining');
  if (!remainingElement) return;

  // 既存のタイマーをクリア
  if (timerId !== null) {
    clearInterval(timerId);
  }

  // 初期値を表示
  updateRemainingDisplay(remainingElement);

  // 1秒ごとに更新
  timerId = window.setInterval(() => {
    if (remainingSec === null) return;
    
    remainingSec--;
    if (remainingSec < 0) {
      // 0を過ぎたら次のスロット開始とみなしてリセット
      remainingSec = TOTP_STEP_SECONDS;
    }
    updateRemainingDisplay(remainingElement);
  }, 1000);
}

/**
 * 残り秒数の表示を更新
 */
function updateRemainingDisplay(element: HTMLElement): void {
  element.textContent = String(remainingSec);
}

// グローバルに公開（HTMLから呼び出せるように）
if (typeof window !== 'undefined') {
  (window as any).initializeApp = initializeApp;
}
