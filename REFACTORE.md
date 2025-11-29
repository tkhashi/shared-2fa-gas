3. 技術スタック & 実装構成
3.1 スタック

GAS (V8 ランタイム)

Google スプレッドシート

Node.js + webpack（ビルド専用）

authenticator (npm) … TOTP 生成ライブラリ

gas-webpack-plugin

node-polyfill-webpack-plugin

HTML テンプレート (index.html) + 素のブラウザ JS

3.2 ファイル構成（ターゲット像）

ローカル側（ビルド用）:

src/

index.ts … GAS エントリ (doGet / doPost)

totp.ts … TOTP 関連の薄いラッパ（authenticator 呼び出し）

sheet.ts … スプレッドシートアクセス

types.ts … 共有型定義

webpack.config.js

package.json

GAS プロジェクト側:

コード.gs … webpack 出力 (dist/Code.js 貼り付け)

index.html … テンプレート（HTML + <script src="..."> でクライアント JS を読み込む or Inline script）

（将来的にはクライアント JS も別バンドルで外出し可能）

4. 技術的な制約 & 前提
4.1 GAS 特有制約

グローバル関数 doGet(e) / doPost(e) が存在しないと Web アプリとして動かない

webpack で IIFE に包まれるので、
globalThis.doGet = doGet; globalThis.doPost = doPost; のような export が必須

Node 環境ではないため、標準 process / Buffer / crypto がそのまま使えない

node-polyfill-webpack-plugin で polyfill を入れる

それでも足りない場合は、GAS 側に最低限の process ダミー定義が必要になる可能性あり

ScriptApp.getService().getUrl() を HTML 内から使って
<form action="..."> を書くのが正攻法
→ これを JS 側で勝手に組み立てない

4.2 authenticator ライブラリ制約

Node 用の TOTP ライブラリ authenticator を利用する

GAS では require('authenticator') の結果をそのまま使用する:

// NG: named export として扱う
// const { authenticator } = require('authenticator');

// OK: モジュール本体
const authenticator = require('authenticator');


生成は authenticator.generateToken(secretBase32) を使用

TOTP 自前実装は禁止（方針）
（暗号ロジックがチームで読めなくなるのを避けるため）

4.3 ビルドフロー制約

TypeScript → webpack → dist/Code.js → GAS へコピペ、というフロー

将来的に CI で自動反映する余地はあるが、現時点では「手動コピペ運用」を前提

webpack.config.js では libraryTarget: 'this' 等、GAS 向け設定を維持する

5. リファクタリング方針
5.1 TypeScript 化

目的:

GAS / HTML / クライアント JS 間の データ構造を型で共有 する

service/account の結合値など、「文字列プロトコル」を生 JS ではなく型と関数で管理する

方針:

src/index.ts に GAS エントリ (doGet, doPost) を実装

共通型を src/types.ts に定義

例：

```typescript

// types.ts
export interface ServiceAccount {
  service: string;
  account: string;
}

export interface TotpPageData {
  items: ServiceAccount[];
  token: string;
  remaining: number;
}
```

TotpPageData をそのまま template.data に JSON で渡し、
HTML 側では DATA: TotpPageData として扱う

5.2 ドメインモデルと helper 関数の明確化
5.2.1 selector value のエンコード/デコード

現在は HTML 側で service + '/' + account のように文字列連結をしているが、
これは JS と GAS で暗黙の取り決めに依存している。

これを型と関数で共通化する：

```typescript
// types.ts
export const SERVICE_ACCOUNT_SEPARATOR = '/';

export function encodeServiceAccountId(sa: ServiceAccount): string {
  // 現状: service/account には "/" を使わない前提
  return `${sa.service}${SERVICE_ACCOUNT_SEPARATOR}${sa.account}`;
}

export function decodeServiceAccountId(raw: string): ServiceAccount {
  const [service, account] = raw.split(SERVICE_ACCOUNT_SEPARATOR);
  return { service, account };
}

```

HTML 側では encodeServiceAccountId と同じロジックを クライアント JS 側に持ち込むか、
そもそも value を service と account 別々の hidden にする設計に変えるのもアリ（要判断）。

少なくとも、「どこか1か所のルールを変えたら全部変える」状態は避ける。
ルールは TypeScript の関数定義に集約する。

5.2.2 TOTP 設定

TOTP の step 秒数・桁数は定数として置く：

```ts
export const TOTP_STEP_SECONDS = 30;
export const TOTP_DIGITS = 6;

```

だし、authenticator 自体がこれを内部に持っているなら、
**「ライブラリのデフォルトから変えない」**のを方針とし、
あくまで「説明用の定数」として扱う。

5.3 GAS とローカルロジックの分離

src/index.ts は純粋に GAS API (HtmlService, SpreadsheetApp) を触る層

スプレッドシート操作は sheet.ts に薄いラッパを作る：

```typescript
// sheet.ts
import { ServiceAccount } from './types';

const SHEET_NAME = 'secret-key';

export function fetchServiceAccounts(): ServiceAccount[] {
  const sheet = SpreadsheetApp.getActive().getSheetByName(SHEET_NAME);
  if (!sheet) throw new Error(`sheet not found: ${SHEET_NAME}`);

  const lastRow = sheet.getLastRow();
  const result: ServiceAccount[] = [];

  if (lastRow >= 2) {
    const rows = sheet.getRange(2, 1, lastRow - 1, 3).getValues();
    for (const row of rows) {
      const [service, account, secret] = row as string[];
      if (!service || !account || !secret) continue; // 空行スキップ
      result.push({ service, account });
    }
  }
  return result;
}


```

TOTP 生成は totp.ts に閉じ込める：

```ts

// totp.ts
// eslint-disable-next-line @typescript-eslint/no-var-requires
const authenticator = require('authenticator');

export function generateTotpToken(secretBase32: string): string {
  return authenticator.generateToken(secretBase32);
}

```

.4 HTML とクライアント JS の分離

index.html に inline script を書くのをやめ、
将来的には「クライアント用 JS」も webpack でバンドルして <script src="..."> で読み込む構成に寄せる（すぐでなくてもよい）。

少なくとも、今回のリファクタでは：

onLoad 内でやっている処理を 純粋関数＋イベントハンドラ に切り出す

DATA の構造（items, token, remaining）をコメントで明記する

6. 命名・インターフェースの取り決め（破ると事故るところ）

スプレッドシート名: secret-key

変えるなら GAS の定数を必ず一元変更する

カラム順: A:service, B:account, C:secret

これを変えると TOTP 生成が壊れるので構造として固定

HTML <form>:

method="post"

action="<?= ScriptApp.getService().getUrl() ?>"

selector の値:

現状: value="service/account"

TypeScript の SERVICE_ACCOUNT_SEPARATOR と encode/decode で定義された値のみ使う

これを変えるときは 必ず encode/decode の実装を更新し、他では直接連結しない

TOTP 生成関数:

generateTotpToken(secretBase32: string): string という形で 1 箇所にまとめる

直接 authenticator.generateToken を GAS の doPost から呼ばない（将来差し替えが難しくなる）

7. リファクタリング作業タスク（ざっくり）

typescript 導入

tsconfig.json 作成

src/index.ts, types.ts, sheet.ts, totp.ts の雛形作成

webpack の entry を ./src/index.ts に変更、ts-loader 追加

GAS エントリの移植

現行 index.js の doGet / doPost ロジックを TypeScript に移植

globalThis.doGet = doGet; globalThis.doPost = doPost; を TS に書く

スプレッドシートアクセスの分離

createInitialData + doPost 内のシート読み出しを sheet.ts に移動

空行スキップを共通処理化

selector value プロトコルの共通化

ServiceAccount と encodeServiceAccountId / decodeServiceAccountId を types.ts に定義

index.ts・HTML用JS の両方でこのプロトコルに従う

HTML onLoad の整理

option 再生成ロジックを関数化

残り秒カウントダウンロジックを別関数に切り出し

ローカルビルド & 手動デプロイ手順の README 化

npm install

npm run build

dist/Code.js を コード.gs に貼り付け

process polyfill が必要ならそれをどこにどう書くか明記

簡易 E2E チェックリスト作成

Web アプリ URL にアクセス → サービス一覧が 2 件だけ出る

hbdckr/ppdns を選択 → 「コード取得」 → TOTP が出る

Network タブに POST .../exec が 1 件

GAS ログで matched=true / generated token=xxxxxx
