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
| service | account | secret |

## セットアップ 

### 1. 依存関係インストール・ビルド

```bash
npm install
npm run build
```

成果物 (`dist/`):
- `Code.js` (GAS用バンドル。先頭に process polyfill を自動挿入)
- `index.html` (Reactビルド済みインラインHTML)

### 2. コピペで貼り付け
GASエディタに以下を手動で張り付けます。

1. `dist/index.html` の中身を、GASの `index.html` (HTMLファイル) に全てコピペ
2. `dist/Code.js` の中身を、GASのスクリプトファイル (例: `Code.js`) に全てコピペ
スクリプト先頭に以下を挿入

```js
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

```
3. 「保存」をクリック

### 3. デプロイ（Webアプリ）
GASエディタ → デプロイ → 新しいデプロイ → 「アクセスできるユーザー」を必要に応じて設定し、公開URLを取得します。

## 使用方法
0. シートのコピー
- 下記のスプレッドシートを自身のGoogle Driveにコピーしてください。
  - https://docs.google.com/spreadsheets/d/1QV0287lXCrHhbj9_6n3Oks2YXO1CN1DhqGcgAMGzWv4/edit?usp=sharing

1.スプレッドシートにシード値を記載

<img width="610" height="295" alt="スクリーンショット 2025-11-30 4 59 54" src="https://github.com/user-attachments/assets/0582d8ad-8877-46c7-a555-7c0bf7c68d1e" />

2. デプロイしたURLにアクセス

3. ドロップダウンからサービス/アカウントを選択

<img width="610" height="295" alt="スクリーンショット 2025-11-30 5 01 13" src="https://github.com/user-attachments/assets/468fbee3-2b4f-4004-b401-12ba86c3208f" />

4. 「コード取得」ボタンをクリック

5. 表示された6桁のコードを使用

<img width="610" height="295" alt="スクリーンショット 2025-11-30 4 58 43" src="https://github.com/user-attachments/assets/1c1a1bcf-0ece-469b-a896-c5a662086124" />



トークンは30秒ごとに更新されます。残り時間がカウントダウン表示されます。

## ライセンス

ISC
