# Shared 2FA GAS

Google Apps Scriptで動作する2FAトークン共有Webアプリケーション。

<img width="610" height="295" alt="スクリーンショット 2025-11-30 4 58 43" src="https://github.com/user-attachments/assets/1c1a1bcf-0ece-469b-a896-c5a662086124" />

## 概要

チーム内で共有する2FAトークンをGoogleスプレッドシート上で一元管理し、Webインターフェースから簡単にアクセスできます。

## 参考

このコードは以下の記事を参考にしています

https://zenn.dev/gmomedia/articles/f24377fbabbf84

## 必要なもの

- Googleスプレッドシート
- Google Apps Script環境
- Node.js（ビルド用）

## スプレッドシート設定

下記のスプレッドシートを自身のGoogle Driveにコピーしてください。
https://docs.google.com/spreadsheets/d/1QV0287lXCrHhbj9_6n3Oks2YXO1CN1DhqGcgAMGzWv4/edit?usp=sharing

`secret-key` という名前のシートを作成し、以下の列を設定:

| A列 | B列 | C列 |
|-----|-----|-----|
| service | account | secret (Base32) |

## セットアップ

1. 依存関係のインストール:

```bash
npm install
```

2. ビルド:

```bash
npm run build
```

3. GASプロジェクトに以下のファイルをコピー:
   - `dist/Code.js` → GASの「コード.gs」（「.gs」ファイルとして追加）
   - `src/index.html` → GASの「index.html」（HTMLファイルとして追加）
   - `dist/client-bundle.html` → GASの「client-bundle.html」（HTMLファイルとして追加）

4. GASをWebアプリケーションとしてデプロイ
   - アクセス権限を適切に設定

## 使い方
1.スプレッドシートにシード値を記載

<img width="610" height="295" alt="スクリーンショット 2025-11-30 4 59 54" src="https://github.com/user-attachments/assets/0582d8ad-8877-46c7-a555-7c0bf7c68d1e" />

2. デプロイしたURLにアクセス

3. ドロップダウンからサービス/アカウントを選択

<img width="610" height="295" alt="スクリーンショット 2025-11-30 5 01 13" src="https://github.com/user-attachments/assets/468fbee3-2b4f-4004-b401-12ba86c3208f" />

4. 「コード取得」ボタンをクリック

5. 表示された6桁のコードを使用

<img width="610" height="295" alt="スクリーンショット 2025-11-30 4 58 43" src="https://github.com/user-attachments/assets/1c1a1bcf-0ece-469b-a896-c5a662086124" />



トークンは30秒ごとに更新されます。残り時間がカウントダウン表示されます。

## 技術スタック

- **フロントエンド**: React 19 + TypeScript
- **ビルドツール**: Vite（クライアント側）、Webpack（サーバー側）
- **バックエンド**: Google Apps Script
- **TOTP生成**: authenticator
- **デプロイ**: すべてのJSがHTMLにインライン化される単一ファイル構成

## アーキテクチャ

### ファイル構成

```
src/
  index.ts              # GAS サーバー側エントリポイント (doGet/doPost)
  index.html            # GASテンプレートHTML（client-bundleを読み込む）
  types.ts              # 共通型定義（サーバー・クライアント間で共有）
  sheet.ts              # スプレッドシート操作
  totp.ts               # TOTP生成ロジック
  client/
    main.tsx            # Reactエントリポイント
    App.tsx             # メインReactコンポーネント

dist/
  Code.js               # サーバー側バンドル（GASにデプロイ）
  client-bundle.html    # クライアント側バンドル（すべてインライン化）
```

### 特徴

- **React**: モダンなUIライブラリで保守性向上
- **型安全性**: TypeScriptによる型チェック
- **単一ファイル**: vite-plugin-singlefileでJS/CSSをHTMLにインライン化
- **責務分離**: サーバー側とクライアント側のコードを完全分離
- **コード共有**: `types.ts`の型とロジックをサーバー・クライアント間で共有

## ライセンス

ISC
