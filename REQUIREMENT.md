1. 背景・目的
背景

プロジェクト共有アカウントの 2FA(TOTP) を、
個人スマホに紐付けず Google Workspace + GAS + スプレッドシート だけで運用したい。

現状、最低限動く GAS Web アプリがあるが、

JS が 1 ファイルにベタ書き

Node ライブラリ(authenticator) を webpack でねじ込んでいる

GAS 特有の制約 (globalThis export, process polyfill など) が暗黙知

これを チームの誰でも追いかけられる構造にしたい。

リファクタリングの目的

TypeScript 化して振る舞いを型で表現する

関数分割 & HTML と JS の責務分離

GAS／HTML／クライアント JS 間の インタフェースを明文化して揃える

Node ライブラリ(authenticator) や webpack の「お作法」をドキュメント化して、
属人化したトリックをなくす

2. 現状の機能要件（挙動）
2.1 ユースケース

ユーザーが Web アプリ URL を開く

Google アカウントで認証される（Workspace 内）

プロジェクト用スプレッドシートから「共有アカウント一覧」を取得して表示

ユーザーが「サービス / アカウント」を選択し「コード取得」を押す

フォームが POST /exec され、doPost が呼ばれる

スプレッドシート上の該当行の TOTP シークレット(Base32) から
authenticator.generateToken() で 6 桁コードを生成

HTML を再描画し、現在のコードと残り秒数を表示

画面上で残り秒数が 1 秒ごとにカウントダウンする（クライアント側 JS）

2.2 データモデル（スプレッドシート）

シート名: secret-key

カラム:

カラム	内容	例
A	service	hbdckr
B	account	ppdns
C	secret (Base32)	BEUCX4DE...

行の条件:

service / account / secret のいずれかが空の行は ロジック上は無視 する（UIに出さない＋マッチ対象にしない）