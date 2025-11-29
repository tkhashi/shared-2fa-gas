# Shared 2FA GAS

Google Apps Scriptで動作する2FAトークン共有Webアプリケーション。

## 概要

チーム内で共有する2FAトークンをGoogleスプレッドシート上で一元管理し、Webインターフェースから簡単にアクセスできます。

## 参考

このコードは以下の記事を参考にしています:
https://zenn.dev/gmomedia/articles/f24377fbabbf84

## 必要なもの

- Googleスプレッドシート
- Google Apps Script環境
- Node.js（ビルド用）

## スプレッドシート設定

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
npx webpack
```

3. `dist/Code.js` の内容をGoogle Apps Scriptにコピー

4. `src/index.html` をGASのHTMLファイルとして追加

5. GASをWebアプリケーションとしてデプロイ
   - アクセス権限を適切に設定

## 使い方

1. デプロイしたURLにアクセス
2. ドロップダウンからサービス/アカウントを選択
3. 「コード取得」ボタンをクリック
4. 表示された6桁のコードを使用

トークンは30秒ごとに更新されます。残り時間がカウントダウン表示されます。

## 技術スタック

- Google Apps Script
- Webpack
- authenticator（TOTPトークン生成）
- Node.js polyfill（GAS環境用）

## ライセンス

ISC
