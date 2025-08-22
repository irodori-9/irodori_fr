# IRODORI プロジェクト設計書

## 1. プロジェクト概要

### 1.1 プロジェクト名
**IRODORI** - Tanabota Banking Application

### 1.2 概要
推し活を支援するモダンなバンキングアプリケーション。ユーザーが推し活に使用した金額を追跡し、「たなぼた」機能により貯金を促進するフィンテックアプリケーション。

### 1.3 主要機能
- ユーザー認証（登録・ログイン・ログアウト）
- 資産管理・ウォレット機能
- 取引履歴の表示
- 「たなぼた」ポップアップ機能
- 推し活支出の分類とトラッキング
- **音声入力チャットボット機能**（TANABUTAちゃん）
- レスポンシブデザイン

## 2. アーキテクチャ

### 2.1 技術スタック

#### フロントエンド
- **フレームワーク**: Next.js 14.0.3
- **言語**: TypeScript 5.2.0
- **スタイリング**: Tailwind CSS 3.3.0
- **UI コンポーネント**: カスタムコンポーネント + Lucide React アイコン
- **アニメーション**: Framer Motion 12.23.12
- **HTTP クライアント**: Axios 1.6.0
- **チャート**: Recharts 3.1.2

#### デプロイメント
- **プラットフォーム**: Azure Static Web Apps
- **CI/CD**: GitHub Actions
- **Node.js**: カスタムサーバー (server.js)

### 2.2 プロジェクト構造

```
irodori_fr/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── globals.css         # グローバルスタイル
│   │   ├── layout.tsx          # ルートレイアウト
│   │   ├── page.tsx            # ホームページ
│   │   ├── assets/             # 資産BOXページ
│   │   ├── home/               # ホームダッシュボード
│   │   ├── login/              # ログインページ
│   │   ├── register/           # 登録ページ
│   │   ├── news/               # ニュースページ
│   │   ├── recipes/            # レシピページ
│   │   └── wallet/             # ウォレットページ
│   ├── components/             # 再利用可能なコンポーネント
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── ErrorMessage.tsx
│   │   ├── FloatingDotButton.tsx
│   │   ├── FormField.tsx
│   │   ├── Header.tsx
│   │   ├── TanabotaPopup.tsx   # たなぼたポップアップ
│   │   ├── bottom-nav.tsx      # ボトムナビゲーション
│   │   └── ui/
│   │       └── dialog.tsx
│   └── lib/
│       └── utils.ts            # ユーティリティ関数
├── public/                     # 静的ファイル
│   ├── piggy-bank.png
│   └── piggy-bank-walking.png
├── server.js                   # カスタムサーバー
├── package.json
├── tailwind.config.js
├── next.config.js
└── tsconfig.json
```

## 3. 主要コンポーネント設計

### 3.1 レイアウトコンポーネント

#### RootLayout (`src/app/layout.tsx`)
- **機能**: アプリケーション全体の基本レイアウト
- **特徴**:
  - Cherry Bomb One フォントの適用
  - グラデーション背景（紫〜ピンク〜青）
  - レスポンシブデザイン（最大幅: 448px）
  - ヘッダー、メインコンテンツ、ボトムナビゲーションの配置

#### Header (`src/components/Header.tsx`)
- **機能**: アプリケーションヘッダー
- **デザイン**: IRODORI ブランディング

#### BottomNav (`src/components/bottom-nav.tsx`)
- **機能**: ボトムナビゲーション
- **ナビゲーション項目**:
  - ホーム (`/home`)
  - 資産BOX (`/assets`)
  - ニュース (`/news`)
  - レシピ (`/recipes`)
- **特徴**: アクティブ状態の視覚的フィードバック

### 3.2 認証システム

#### Login Page (`src/app/login/page.tsx`)
- **機能**: ユーザーログイン
- **フィールド**: メールアドレス、パスワード
- **エラーハンドリング**: APIエラーレスポンスの表示
- **リダイレクト**: ログイン成功時にホームページ（`/`）へ遷移

#### Authentication Flow
- **セッション管理**: Cookie ベースの認証
- **API エンドポイント**: 
  - ログイン: `POST /login`
  - ログアウト: `GET /logout`
- **withCredentials**: true で CORS 対応

### 3.3 ウォレット機能

#### Wallet Page (`src/app/wallet/page.tsx`)
- **機能**: 
  - デビットカードビュー
  - 取引明細（つうちょう）
  - タブ切り替え機能
- **取引データ**:
  - アイコン、カテゴリ、金額、日付
  - 「たなぼた」タグの表示
- **デザイン**: 
  - カード: グラデーション背景とグラスモーフィズム効果
  - 明細: 取引別の詳細表示

### 3.4 たなぼた機能

#### TanabotaPopup (`src/components/TanabotaPopup.tsx`)
- **機能**: 推し活支出に対する貯金リワードの表示
- **アニメーション**: Framer Motion による滑らかな表示・非表示
- **デザイン要素**:
  - 紫色グラデーション
  - TANABOTA キャラクター画像
  - リワード金額の強調表示
- **UX**: 背景タップまたは確認ボタンで閉じる

### 3.5 共通UIコンポーネント

#### Button (`src/components/Button.tsx`)
- **バリアント**: プライマリ、セカンダリ、危険
- **状態**: ローディング、無効化
- **サイズ**: 小、中、大

#### Card (`src/components/Card.tsx`)
- **機能**: コンテンツの統一されたカードレイアウト

#### FormField (`src/components/FormField.tsx`)
- **機能**: ラベル付きフォーム入力フィールド

#### ErrorMessage (`src/components/ErrorMessage.tsx`)
- **機能**: エラー表示の統一されたコンポーネント

### 3.6 音声入力チャットボット機能

#### 概要
TANABUTAちゃんとの音声会話機能。ユーザーが音声で質問すると、AIが財務アドバイスや推し活のアドバイスを提供する。

#### 技術仕様
- **実装ページ**: Home Page (`src/app/home/page.tsx`)
- **音声録音**: MediaRecorder API (m4a形式対応)
- **音声認識**: バックエンドAPIによる文字起こし (`/transcribe`)
- **AI応答生成**: バックエンドAPIによるフィードバック (`/feedback`)
- **CORS対策**: Next.js rewrite機能でプロキシ経由

#### 実装フロー
```
1. ユーザーが「はなす」ボタンをクリック
2. ブラウザでマイク権限を取得
3. MediaRecorder APIで音声録音開始 (m4a形式)
4. 「終了」ボタンで録音停止
5. 音声データを /api/transcribe に送信
6. 文字起こし結果をユーザーメッセージとして表示
7. 文字起こし結果を /api/feedback に送信
8. AI応答をTANABUTAちゃんの発言として表示
```

#### UI/UX設計
- **録音中状態**: 「TANABUTAちゃんが聞いています...」+ 録音時間表示
- **処理中状態**: 「TANABUTAちゃんが考え中...」+ アニメーション
- **会話表示**: ユーザーメッセージ（右側・紫色）、AI応答（左側・白色）
- **エラー処理**: マイク権限拒否、API通信エラー等の適切な表示

#### 技術的特徴
- **音声形式**: m4a (AAC codec) でAPI互換性確保
- **エラーハンドリング**: 包括的なエラー処理とユーザーフレンドリーなメッセージ
- **デバッグ機能**: 詳細なコンソールログでトラブルシューティング対応
- **レスポンシブ対応**: デスクトップ・モバイル両対応

## 4. デザインシステム

### 4.1 カラーパレット
- **プライマリ**: 紫色系 (Purple 400-600)
- **セカンダリ**: ピンク色系 (Pink/Fuchsia)
- **アクセント**: 青色系 (Blue)
- **背景**: グラデーション (Purple → Pink → Blue)
- **テキスト**: グレー系 (#1F2937, #6B7280)

### 4.2 タイポグラフィ
- **メインフォント**: Inter (Google Fonts)
- **ブランドフォント**: Cherry Bomb One (見出しやブランド要素)
- **フォントサイズ**: Tailwind CSS のスケール準拠

### 4.3 視覚効果
- **グラスモーフィズム**: `backdrop-blur` と半透明背景
- **シャドウ**: 複数レイヤーの影効果
- **角丸**: 大きめの border-radius (rounded-2xl, rounded-3xl)

## 5. API設計

### 5.1 エンドポイント
- **プロダクション API サーバー**: `https://aps-irodori-sub-01-gxbyb0d3bafadgdz.japaneast-01.azurewebsites.net/`
- **開発環境**: `http://localhost:8000`
- **設定方法**: `process.env.NEXT_PUBLIC_API_BASE_URL` 環境変数で切り替え
- **認証**: Cookie ベースセッション
- **CORS**: 適切に設定済み（localhost からのリクエスト許可）
- **ホスティング**: Azure Web Apps (Japan East リージョン)
- **プロキシ設定**: Next.js rewrite で `/api/*` → API サーバーにプロキシ

### 5.2 API仕様書
プロジェクトルートにある `backend_apidetail.json` ファイルにOpenAPI 3.1.0形式で詳細なAPI仕様が記載されています。

### 5.3 主要API エンドポイント

#### 認証関連 (`auth` タグ)
```
POST /register
- 機能: ユーザー登録
- Body: UserRegister schema (姓名、メール、生年月日、住所、電話番号、職業、会社名、パスワード等)
- Response: MessageResponse

POST /login
- 機能: ユーザーログイン  
- Body: { email: string, password: string }
- Response: MessageResponse

GET /logout
- 機能: ログアウト（セッション終了）
- Response: MessageResponse
```

#### 音声・チャット関連 (`talk` タグ)
```
POST /transcribe
- 機能: 音声ファイルから文字起こし
- Body: multipart/form-data (audiofile)
- Response: 文字起こし結果

POST /feedback
- 機能: たなブタちゃんから可愛いフィードバックを取得
- Body: { text: string }
- Response: { feedback: string }

GET /voicevox/speakers
- 機能: 利用可能な音声合成話者一覧取得

POST /voicevox/initialize
- 機能: 指定話者の音声合成エンジン初期化
- Query: speaker (integer)

POST /speech
- 機能: テキスト音声合成（TTS）
- Body: TTSRequest (text, speaker, 各種音声パラメータ)
```

#### オンボーディング関連 (`onboarding` タグ)
```
POST /onboarding/preference
- 機能: ユーザー属性・傾向の質問回答を1件保存
- Body: { user_id, question, selected_answers[] }
- Response: Preference

POST /onboarding/preferences  
- 機能: ユーザー属性・傾向の質問回答リストを一括保存
- Body: PreferenceCreate[]
- Response: Preference[]

GET /onboarding/preferences
- 機能: ユーザーの属性・傾向質問回答リストを取得
- Query: user_id
- Response: Preference[]

GET /onboarding/financial-report
- 機能: ユーザーの財務状況分析とインサイト取得
- Query: user_id  
- Response: FinancialReport (insights[], expenses_by_category[])

GET /onboarding/recommended_recipes
- 機能: ユーザーに推奨されるレシピテンプレート取得
- Query: user_id
- Response: RecipeTemplateWithUserAndRuleTemplatesWithTriggerAndAction[]

POST /onboarding/recipe
- 機能: レシピテンプレートをコピーしてユーザーレシピとして保存
- Body: { user_id, template_id }
- Response: RecipeWithUserAndRulesWithTriggerAndAction

GET /onboarding/recipes  
- 機能: ユーザーが利用中のレシピリスト取得
- Query: user_id
- Response: RecipeWithUserAndRulesWithTriggerAndAction[]
```

#### その他
```
GET /
- 機能: ルートエンドポイント（ヘルスチェック）
- Response: 基本レスポンス
```

## 6. 状態管理

### 6.1 ローカル状態
- **React useState**: コンポーネントレベルの状態
- **フォーム管理**: 各ページで個別に管理
- **ナビゲーション**: Next.js Router による状態管理

### 6.2 グローバル状態
- **認証状態**: セッションベースで管理
- **現在ページ**: usePathname フックで取得

## 7. パフォーマンス最適化

### 7.1 Next.js 最適化
- **App Router**: 最新のルーティングシステム
- **Image コンポーネント**: 最適化された画像配信
- **静的生成**: 可能な部分での事前生成

### 7.2 バンドル最適化
- **Tree Shaking**: 未使用コードの除去
- **Code Splitting**: ページ単位での分割

## 8. セキュリティ

### 8.1 認証セキュリティ
- **セッション管理**: HTTP-only cookies
- **CSRF対策**: Same-origin policy
- **入力検証**: フォームバリデーション

### 8.2 データ保護
- **環境変数**: API URL の設定
- **エラーハンドリング**: 適切なエラーメッセージ

## 9. デプロイメント

### 9.1 Azure Static Web Apps
- **自動デプロイ**: GitHub Actions による CI/CD
- **カスタムドメイン**: 設定可能
- **SSL**: 自動設定

### 9.2 必要な環境変数
```
NEXT_PUBLIC_API_BASE_URL=https://aps-irodori-sub-01-gxbyb0d3bafadgdz.japaneast-01.azurewebsites.net/
AZURE_STATIC_WEB_APPS_API_TOKEN=<Azure API トークン>
```

### 9.3 バックエンドAPI サーバー
- **URL**: `https://aps-irodori-sub-01-gxbyb0d3bafadgdz.japaneast-01.azurewebsites.net/`
- **ホスティング**: Azure Web Apps
- **リージョン**: Japan East
- **接続方法**: Axios による HTTP リクエスト
- **セッション管理**: Cookie ベース認証で連携

## 10. 今後の拡張計画

### 10.1 機能追加案
- **通知システム**: たなぼた発生の通知
- **推し活カテゴリ**: より詳細な支出分類
- **目標設定**: 貯金目標の設定と進捗追跡
- **データ分析**: 支出パターンの可視化

### 10.2 技術改善案
- **状態管理**: Redux Toolkit の導入検討
- **テスト**: Jest + Testing Library の追加
- **PWA対応**: モバイルアプリ化
- **国際化**: 多言語対応

## 11. 開発・運用

### 11.1 開発コマンド
```bash
npm run dev    # 開発サーバー起動
npm run build  # プロダクションビルド
npm start      # プロダクションサーバー起動
npm run lint   # ESLint チェック
```

### 11.2 ファイル構成ルール
- **コンポーネント**: PascalCase で命名
- **ページ**: page.tsx で統一
- **型定義**: TypeScript で厳密な型付け
- **スタイリング**: Tailwind CSS クラスベース

### 11.3 テストログインID(メールアドレス)とパスワード
- **メールアドレス**: mitsurunano@gmail.com
- **パスワード**:mitsurunagano
---

**最終更新**: 2025年8月12日  
**バージョン**: 1.0.0  
**作成者**: Claude Code Assistant