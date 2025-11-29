# ISSUE.md

## 既知の問題・改善点

### 1. 技術的な課題

#### 1.1 authenticator ライブラリの型定義
- `authenticator`ライブラリに型定義がないため、`@ts-ignore`で回避している
- より型安全な実装のために、独自の型定義ファイル作成を検討

#### 1.2 selector value のエンコード方式
- 現状は`service/account`の文字列連結だが、service/accountに`/`が含まれると破綻する
- より堅牢な方式（Base64、JSON、etc）への変更を検討

#### 1.3 TypeScript strict mode
- `tsconfig.json`で`strict: false`を設定している
- authenticatorの型問題解決後、strict modeの有効化を検討

### 2. 機能面の課題

#### 2.1 エラーハンドリング
- スプレッドシートが存在しない場合のエラー表示が不十分
- ネットワークエラー時のユーザーフィードバックがない

#### 2.2 セキュリティ
- TOTPシークレットがスプレッドシートに平文保存されている
- より安全な保存方法（暗号化、Properties Service、etc）の検討が必要

#### 2.3 UX改善
- コード取得後の自動コピー機能の追加
- コピー完了時のトースト通知
- キーボードショートカット対応

### 3. 保守性の課題

#### 3.1 デプロイフロー
- 現状は手動コピペ運用
- clasp等を使った自動デプロイの検討

## 対応優先度

### 🔴 High Priority
- [ ] エラーハンドリングの改善
- [ ] セキュリティ（シークレット暗号化）

### 🟡 Medium Priority
- [ ] UX改善（自動コピー機能）
- [ ] デプロイフローの自動化
- [ ] selector valueのエンコード改善

### 🟢 Low Priority
- [ ] TypeScript strict mode有効化

---

## メモ
- このファイルは随時更新してください
- 新しい問題を発見したら、優先度とともに追加してください
