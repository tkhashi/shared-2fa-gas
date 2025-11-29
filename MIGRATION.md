# Shared 2FA GAS

Google Apps Scriptを使用した2要素認証(TOTP)コード共有システム

## プロジェクト構造

プロジェクトはフロントエンドとバックエンドに分離されています:

```
.
├── backend/              # GASバックエンド
│   ├── src/
│   │   ├── index.ts     # GASエントリーポイント
│   │   ├── sheet.ts     # スプレッドシート操作
│   │   ├── totp.ts      # TOTP生成ロジック
│   │   ├── types.ts     # 型定義
│   │   └── appsscript.json
│   ├── package.json
│   ├── tsconfig.json
│   └── webpack.config.js
│
├── frontend/             # Reactフロントエンド
│   ├── src/
│   │   ├── App.tsx      # メインコンポーネント
│   │   ├── main.tsx     # エントリーポイント
│   │   └── types.ts     # 型定義(共有)
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
└── dist/                 # ビルド成果物
    ├── Code.js          # GASバックエンド
    ├── index.html       # フロントエンド(インライン化)
    └── appsscript.json
```

## セットアップ

### 1. 依存関係のインストール

```bash
# 全ての依存関係をインストール
npm run install:all
```

または個別にインストール:

```bash
# バックエンドの依存関係
cd backend && npm install

# フロントエンドの依存関係
cd frontend && npm install
```

### 2. ビルド

```bash
# ルートディレクトリで実行
npm run build
```

このコマンドは以下を実行します:
1. バックエンドのビルド (webpack) → `dist/Code.js`
2. フロントエンドのビルド (vite) → `dist/index.html`
3. `appsscript.json`を`dist/`にコピー

### 3. デプロイ

```bash
npm run deploy
```

## 変更点

### 従来の構造との違い

- **従来**: すべてのソースが`src/`配下にあり、フロントエンドとバックエンドの依存関係が混在
- **新構造**: `backend/`と`frontend/`に分離し、それぞれ独立した`package.json`を持つ

### メリット

1. **依存関係の分離**: フロントエンドは`authenticator`を、バックエンドは`react`を必要としない
2. **明確な責任範囲**: ディレクトリ構造で役割が明確
3. **保守性の向上**: 各部分を独立して開発・テスト可能

### distの出力内容

出力内容は従来と同じです:
- `dist/Code.js` - GASバックエンドコード
- `dist/index.html` - React UIがインライン化されたHTML
- `dist/appsscript.json` - GAS設定ファイル

## UIバグ修正

**修正内容**: トークンが取得される前にタイマーが開始される問題を修正

**変更点** (`frontend/src/App.tsx`):
- `useEffect`の依存配列に`data.token`を追加
- `data.token`が存在しない場合は`useEffect`を早期リターン
- タイマー表示部分を条件付きレンダリング(`{data.token && ...}`)

これにより、6桁のコードが実際に取得されるまでタイマーは開始されません。

## スクリプト一覧

- `npm run install:all` - 全ての依存関係をインストール
- `npm run build:backend` - バックエンドのみビルド
- `npm run build:frontend` - フロントエンドのみビルド
- `npm run build` - 全体をビルド
- `npm run deploy` - ビルドしてGASにデプロイ

## 開発

個別にビルドして開発することも可能です:

```bash
# バックエンドのみ開発
cd backend
npm run build

# フロントエンドのみ開発
cd frontend
npm run build
```
