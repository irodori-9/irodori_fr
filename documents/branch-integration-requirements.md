# ブランチ統合要件定義書
# feature-implementation × オンボーディング機能統合

## 1. プロジェクト概要

### 1.1 統合の目的
現在のブランチ（`feature-implementation`）のチャットボット・ニュース・レシピ機能と、別ブランチ（`2-流星さんはオンボーディング画面を見ることができる`）のオンボーディング機能を統合し、完全なアプリケーションを構築する。

### 1.2 統合対象
- **feature-implementation ブランチ機能**:
  - 音声対応チャットボット機能（音声録音、文字起こし、音声合成）
  - ニュース機能（CSV読み込み、カテゴリ別表示）
  - レシピ機能（API連携、適用中/おすすめレシピ表示）
  
- **オンボーディングブランチ機能**:
  - ユーザー登録・ログイン機能
  - 多段階オンボーディングフロー（15画面）
  - 家族構成・趣味・目標設定・レシピ選択機能

## 2. 現在の機能分析

### 2.1 feature-implementation ブランチの機能
#### 2.1.1 ホーム画面（`/home`）
- **チャットボット機能**: 音声録音→文字起こし→AI応答→音声合成の完全フロー
- **API連携**: `/transcribe`、`/feedback` エンドポイント
- **マンスリーサマリー**: 貯金・投資・節約額、いいね数の表示
- **技術**: React hooks、Axios、MediaRecorder API、Text-to-Speech

#### 2.1.2 ニュース機能（`/news`）
- **CSV読み込み**: `public/news.csv`からニュースデータを動的取得
- **カテゴリフィルタリング**: アニメ・K-POP・VTuberの3カテゴリ
- **外部リンク**: ニュース記事への直接リンク機能
- **UI**: カテゴリタブ、カード型レイアウト、アニメーション

#### 2.1.3 レシピ機能（`/recipes`）
- **API連携**: `/onboarding/recipes`から適用中レシピ取得
- **おすすめレシピ**: API連携によるレシピ推薦表示
- **UI**: パンチホール型サイドバー、カテゴリ別色分け

### 2.2 オンボーディングブランチの機能
#### 2.2.1 認証機能（`/auth/login`, `/auth/register`）
- **ログイン**: メールアドレス・パスワード認証
- **登録**: 個人情報入力、バリデーション、API連携
- **UI**: Cherry Bomb Oneフォント、一貫したデザインシステム

#### 2.2.2 オンボーディングフロー（`/auth/*`）
1. **家族構成選択**: 4つの選択肢（一人暮らし、実家、パートナー等）
2. **趣味選択**: キャラクター、マンガ、アニメ等の多選択
3. **活動選択**: グッズ購入、動画視聴等の活動パターン
4. **目標設定**: 貯金・投資・節約の数値目標設定
5. **レシピ選択**: 推奨レシピからの選択
6. **分析・レポート**: ユーザープロファイル分析結果表示

#### 2.2.3 UI/UXシステム
- **デザイン統一**: shadcn/uiコンポーネント
- **フォント**: Cherry Bomb One（メイン見出し）
- **色彩**: 紫系メインカラー（#B547EB）
- **アニメーション**: スムーズな画面遷移

## 3. 統合要件

### 3.1 機能統合要件

#### 3.1.1 認証統合
- **要件**: オンボーディング完了後、メイン機能（ホーム画面）に遷移
- **実装**: `/auth/recommendations` 完了後 → `/home` へのナビゲーション
- **セッション管理**: 既存のCookie認証を継続利用

#### 3.1.2 ルーティング統合
- **要件**: 認証状態に応じた適切なページ表示
- **実装**: 
  - 未認証: `/` → `/auth/login`
  - 認証済み: `/` → `/home`
  - オンボーディング未完了: ログイン後 → オンボーディングフロー

#### 3.1.3 ナビゲーション統合
- **要件**: メイン機能間のナビゲーション（ホーム・ニュース・レシピ）
- **実装**: 共通ナビゲーションコンポーネントの追加
- **位置**: 各メイン機能ページにタブナビゲーション追加

### 3.2 UI/UX統合要件

#### 3.2.1 デザインシステム統合
- **メインカラー**: 紫系（#B547EB）を全体で統一
- **フォント**: Cherry Bomb Oneをメイン見出しに統一適用
- **コンポーネント**: shadcn/uiコンポーネントをメイン機能でも活用

#### 3.2.2 レイアウト統合
- **背景**: オンボーディング画面の背景デザインをメイン機能でも適用
- **カード**: 一貫したカードデザイン（角丸、シャドウ、透明度）
- **ボタン**: 統一されたボタンスタイル

### 3.3 データ統合要件

#### 3.3.1 ユーザー認証連携
- **要件**: 認証されたユーザーIDに基づくメイン機能の動作
- **現状課題**: ダミーユーザーID（1）の使用
- **対象機能**: 
  - `/home`: チャットボット機能（src/app/home/page.tsx:230 user_id: 1 → 実際のユーザーID）
  - `/news`: ニュース表示（将来的な個人化対応）
  - `/recipes`: レシピAPI呼び出し（useRecipes hook内 user_id=1 → 実際のユーザーID）
  - `/assets`: アセット管理（ユーザー固有データ）
- **具体的実装計画**: 
  1. **AuthContext・useAuth実装** (新規ファイル作成)
     - src/context/AuthContext.tsx
     - src/hooks/useAuth.ts
  2. **/api/user/session エンドポイント実装** (新規API作成)
     - src/app/api/user/session/route.ts
  3. **既存コード改修**
     - src/app/home/page.tsx:230 `user_id: 1` → `user_id: user?.user_id || 1`
     - src/hooks/useRecipes.ts作成（現在未実装）
  4. **エラーハンドリング追加**
     - 認証失敗時の/auth/loginリダイレクト
     - 一時的通信エラー時のフォールバック

#### 3.3.2 ユーザーデータ連携
- **要件**: オンボーディングで収集したユーザーデータをメイン機能で活用
- **実装**: 
  - チャットボットでのパーソナライズ応答
  - レシピ推薦のカスタマイズ
  - ニュースのパーソナライゼーション
  - アセット管理の個人化

#### 3.3.3 設定データ管理
- **要件**: オンボーディング設定をsessionStorageからAPIに移行
- **実装**: ユーザープロファイルAPIの活用

## 4. 技術統合仕様

### 4.1 依存関係統合

#### 4.1.1 パッケージ統合
```json
// 統合後のpackage.json主要依存関係
{
  "dependencies": {
    "next": "latest",
    "react": "latest", 
    "tailwindcss": "latest",
    "framer-motion": "latest",
    "lucide-react": "latest",
    "axios": "latest",
    "@radix-ui/*": "latest", // shadcn/ui components
    "next/font": "latest" // Cherry Bomb One
  }
}
```

#### 4.1.2 設定ファイル統合
- **tailwind.config.js**: 両ブランチの設定をマージ
- **next.config.js**: API rewriteとその他設定の統合
- **tsconfig.json**: TypeScript設定の統一

### 4.2 ファイル構造統合

#### 4.2.1 統合後のディレクトリ構造
```
src/
├── app/
│   ├── auth/              # オンボーディング機能
│   │   ├── login/
│   │   ├── register/
│   │   ├── family/
│   │   ├── fandoms/
│   │   ├── activities/
│   │   ├── goals/
│   │   ├── preparation/
│   │   ├── budget/
│   │   ├── connections/
│   │   ├── analyzing/
│   │   ├── nickname/
│   │   ├── recipe/
│   │   ├── recommendations/
│   │   ├── report/
│   │   └── consent/
│   ├── home/              # メインダッシュボード
│   ├── news/              # ニュース機能
│   ├── recipes/           # レシピ機能
│   ├── assets/            # アセット管理機能
│   ├── api/               # API routes
│   └── globals.css        # 統合スタイル
├── components/
│   ├── ui/                # shadcn/ui コンポーネント
│   ├── app-shell.tsx      # 共通レイアウト
│   └── Header.tsx         # ナビゲーション
├── hooks/                 # カスタムフック
│   ├── useAuth.ts         # 認証管理フック（新規追加）
│   ├── useUser.ts         # ユーザー情報管理フック（新規追加）
│   └── useTextToSpeech.ts # 音声合成フック
├── context/               # React Context（新規追加）
│   └── AuthContext.tsx    # 認証コンテキスト
├── types/                 # TypeScript型定義
└── config/                # 設定ファイル
```

### 4.3 API統合仕様

#### 4.3.1 既存APIエンドポイント（Azureバックエンド）
- `/login` - ログイン認証（オンボーディング機能で使用中）
- `/register` - ユーザー登録（オンボーディング機能で使用中）
- `/transcribe` - 音声文字起こし（チャットボット機能で使用中）
- `/feedback` - チャットボット応答（チャットボット機能で使用中）
- `/onboarding/recipes` - レシピデータ取得（レシピ機能で使用中）
- `/onboarding/recommended_recipes` - おすすめレシピ取得（オンボーディング機能で使用中）

#### 4.3.2 ユーザー認証API詳細仕様（新規追加必要）

##### /user/session - 認証済みユーザー情報取得
**目的**: ダミーユーザーID（1）を実際の認証済みユーザーIDに置換するための中核API

**リクエスト**:
```http
GET /api/user/session
Headers:
  Cookie: session_token=xxx (既存の認証Cookieを利用)
  Content-Type: application/json
```

**レスポンス**:
```json
{
  "success": true,
  "user": {
    "user_id": 123,
    "email": "user@example.com",
    "nickname": "ユーザー名",
    "onboarding_completed": true,
    "preferences": {
      "family_type": "一人暮らし",
      "fandoms": ["アニメ", "K-POP"],
      "savings_goal": 500000,
      "investment_goal": 1000000
    }
  }
}
```

**エラーレスポンス**:
```json
{
  "success": false,
  "error": "UNAUTHORIZED",
  "message": "認証が必要です"
}
```

##### /user/profile - ユーザープロファイル取得・更新
**目的**: オンボーディングで収集したデータの活用とパーソナライゼーション

**取得**:
```http
GET /api/user/profile
Headers: Cookie: session_token=xxx
```

**更新**:
```http
PUT /api/user/profile
Headers:
  Cookie: session_token=xxx
  Content-Type: application/json
Body:
{
  "nickname": "新しいニックネーム",
  "preferences": {
    "savings_goal": 600000
  }
}
```

##### /user/preferences - ユーザー設定管理
**目的**: アプリ設定（音声ON/OFF等）の永続化

**取得・更新**: /user/profile と同様の仕様

#### 4.3.3 既存APIのユーザーID対応改修仕様

##### /api/feedback - チャットボット応答（改修必要）
**現在の問題**: user_id: 1 がハードコード

**改修前**:
```javascript
const feedbackRequestBody = {
  text: transcribedText,
  user_id: 1 // ← ダミーユーザーID
}
```

**改修後**:
```javascript
// 1. 認証済みユーザーIDを動的取得
const { user } = await fetch('/api/user/session').then(r => r.json())
const feedbackRequestBody = {
  text: transcribedText,
  user_id: user.user_id // ← 実際の認証済みユーザーID
}
```

##### /api/onboarding/recipes - レシピデータ取得（改修必要）
**現在の問題**: useRecipes hookでuser_id=1を使用

**改修前（src/hooks/useRecipes.ts想定）**:
```javascript
const response = await axios.get('/api/onboarding/recipes?user_id=1')
```

**改修後**:
```javascript
const { user } = await fetch('/api/user/session').then(r => r.json())
const response = await axios.get(`/api/onboarding/recipes?user_id=${user.user_id}`)
```

#### 4.3.4 認証コンテキスト実装仕様

##### AuthContext.tsx の実装
```typescript
// src/context/AuthContext.tsx
export interface User {
  user_id: number;
  email: string;
  nickname: string;
  onboarding_completed: boolean;
  preferences: {
    family_type: string;
    fandoms: string[];
    savings_goal: number;
    investment_goal: number;
  };
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ページロード時の認証状態確認
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/user/session');
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      }
    } catch (error) {
      console.error('認証状態確認エラー:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUser = async () => {
    await checkAuthStatus();
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      refreshUser,
      // login, logout実装
    }}>
      {children}
    </AuthContext.Provider>
  );
}
```

##### useAuth.ts カスタムフック
```typescript
// src/hooks/useAuth.ts
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
```

#### 4.3.5 ダミーユーザーID置換実装計画

##### Phase 1: 認証基盤の実装
1. **AuthContext・useAuth実装**
   - src/context/AuthContext.tsx作成
   - src/hooks/useAuth.ts作成
   - src/app/layout.tsx でAuthProvider適用

2. **/api/user/session エンドポイント実装**
   - src/app/api/user/session/route.ts作成
   - 既存のCookie認証との連携
   - エラーハンドリング実装

##### Phase 2: 既存機能の改修
1. **チャットボット機能（src/app/home/page.tsx）**
   ```typescript
   // 改修前
   user_id: 1
   
   // 改修後  
   const { user } = useAuth();
   user_id: user?.user_id || 1  // フォールバック付き
   ```

2. **レシピ機能（src/hooks/useRecipes.ts作成）**
   ```typescript
   export function useRecipes() {
     const { user } = useAuth();
     
     const fetchRecipes = useCallback(async () => {
       if (!user) return;
       const response = await axios.get(
         `/api/onboarding/recipes?user_id=${user.user_id}`
       );
       // ...
     }, [user]);
   }
   ```

3. **ニュース機能（将来対応）**
   - 現在はCSVベースだが、将来的にパーソナライゼーション対応

##### Phase 3: エラーハンドリング強化
1. **認証エラー時の自動リダイレクト**
   ```typescript
   // 401エラー時は自動的にログイン画面へ
   if (response.status === 401) {
     router.push('/auth/login');
   }
   ```

2. **ユーザー情報取得失敗時のフォールバック**
   ```typescript
   // 一時的な通信エラー時はダミーIDで継続
   const userId = user?.user_id || 1;
   ```

#### 4.3.6 APIセキュリティ・パフォーマンス考慮事項

##### セキュリティ
- **CSRF対策**: 既存のCookie認証メカニズムを活用
- **XSS対策**: user_idの適切なサニタイゼーション
- **認証状態の検証**: 各API呼び出し前の認証確認

##### パフォーマンス
- **認証状態キャッシュ**: useAuthでの適切なキャッシュ実装
- **不要なAPI呼び出し削減**: 認証状態の効率的な管理
- **エラー時のリトライ**: 一時的な通信エラーへの対応

#### 4.3.7 テスト・デバッグ要件

##### 単体テスト
- **useAuth hookテスト**: 認証状態の正確な管理
- **API endpointテスト**: レスポンス形式の検証
- **エラーハンドリングテスト**: 各種エラーケースの確認

##### 統合テスト
- **認証フロー**: ログイン → オンボーディング → メイン機能
- **ユーザーID連携**: 全機能でのuser_id正確性確認
- **セッション継続**: ページリロード時の状態保持

## 5. マージ戦略

### 5.1 競合解決方針

#### 5.1.1 ファイル競合
- **package.json**: feature-implementationベースに両方の依存関係をマージ
- **globals.css**: オンボーディングブランチのスタイルを優先
- **layout.tsx**: オンボーディングブランチのapp-shell構造を採用

#### 5.1.2 機能競合
- **ルートページ**: オンボーディングブランチの認証フローを優先
- **ナビゲーション**: メイン機能間ナビゲーションを新規追加
- **API設定**: feature-implementationのAPI rewrite設定を継続

### 5.2 段階的統合

#### 5.2.1 Phase 1: 基盤統合
1. オンボーディングブランチをベースに設定
2. feature-implementationの機能ファイルを移植
3. 依存関係の統合とビルド確認

#### 5.2.2 Phase 2: UI統合
1. デザインシステムの統一適用
2. コンポーネントの統合とスタイル調整
3. ナビゲーション機能の追加

#### 5.2.3 Phase 3: 機能連携
1. 認証フローとメイン機能の連携
2. ユーザーID認証連携の実装
3. ダミーユーザーID（1）から実際のユーザーIDへの修正
4. ユーザーデータの活用実装
5. エンドツーエンドテスト

## 6. 品質保証

### 6.1 テスト要件

#### 6.1.1 機能テスト
- [ ] オンボーディングフロー完全実行
- [ ] 認証フローの動作確認
- [ ] チャットボット機能（音声含む）
- [ ] ニュース機能（CSV読み込み、フィルタリング）
- [ ] レシピ機能（API連携、表示）

#### 6.1.2 統合テスト
- [ ] オンボーディング完了後のホーム画面遷移
- [ ] ナビゲーション機能の動作
- [ ] セッション管理の継続性
- [ ] API認証の一貫性

#### 6.1.3 UI/UXテスト
- [ ] デザインの一貫性確認
- [ ] レスポンシブ対応確認
- [ ] アニメーション動作確認
- [ ] アクセシビリティ確認

### 6.2 パフォーマンス要件

#### 6.2.1 読み込み性能
- 初期ページロード: 5秒以内（React 19 + 大量shadcn/uiコンポーネント考慮）
- ページ遷移: 1秒以内
- API応答: 5秒以内
- **バンドルサイズ制限**: 現在比+30%以内（shadcn/ui追加による増加を考慮）

#### 6.2.2 ユーザビリティ
- オンボーディング完了率: 80%以上
- 音声機能成功率: 90%以上
- ニュース読み込み成功率: 95%以上

## 7. 実装計画

### 7.1 実装順序

#### 7.1.0 互換性検証フェーズ（所要時間: 2-3時間）【新規追加】
1. **React 19 + Next.js 15 互換性テスト**
   - feature-implementationブランチでのアップグレードテスト
   - チャットボット機能（音声録音・合成）の動作確認
   - framer-motionアニメーションの互換性確認
   - TypeScript型エラーの特定と修正

2. **重要な依存関係の事前検証**
   - MediaRecorder API の React 19 での動作確認
   - useTextToSpeech hookの互換性確認
   - axios API呼び出しの動作確認

3. **パフォーマンス基準値測定**
   - 現在のバンドルサイズ測定
   - ページロード時間の基準値設定
   - メモリ使用量の基準値設定

#### 7.1.1 準備フェーズ（所要時間: 1-2時間）
1. ブランチ競合の特定と解決戦略確定
2. 統合作業用ブランチの作成
3. バックアップとリスク対策
4. 互換性検証結果に基づく統合計画の調整

#### 7.1.2 統合フェーズ（所要時間: 3-4時間）
1. オンボーディング機能をベースとした統合
2. feature-implementation機能の移植
3. 設定ファイルの統合
4. ビルドエラーの解決

#### 7.1.3 調整フェーズ（所要時間: 1-2時間）
1. UI/UXの統一
2. ナビゲーション機能の実装
3. 機能連携の実装

#### 7.1.4 検証フェーズ（所要時間: 1時間）
1. 全機能の動作確認
2. エンドツーエンドテスト
3. 品質チェック

### 7.2 リスク管理

#### 7.2.1 重大な技術的リスク（🔴 HIGH）

##### React/Next.jsバージョン互換性リスク
- **React 18.2.0 → 19**: 
  - Concurrent Rendering の厳密化により既存のuseEffect、状態管理に影響
  - MediaRecorder APIを使用するチャットボット機能で問題発生の可能性
  - TypeScript型定義の大幅変更（@types/react: 18 → 19）
- **Next.js 14.0.3 → 15.2.4**:
  - App Router の新機能と変更点による既存ルーティングへの影響
  - webpack設定の互換性問題
  - API Routes の挙動変更によるAPI連携への影響

##### その他の技術的リスク
- **framer-motion互換性**: React 19対応版への更新が必要
- **依存関係の大幅変更**: 50+のshadcn/uiコンポーネント追加によるバンドルサイズ増加
- **TypeScript型エラー**: 既存コードで100+の型エラー発生予想
- **API互換性**: 両ブランチのAPI設定の相違

#### 7.2.2 リスク対策

##### 段階的アップグレード戦略
1. **Phase 0: 互換性検証**（必須追加フェーズ）
   - feature-implementationブランチでReact 19 + Next.js 15での動作確認
   - チャットボット機能の詳細テスト（MediaRecorder、音声合成）
   - framer-motionの互換性確認
   - TypeScript型エラーの事前特定と修正

2. **Phase 1: 基盤統合**
   - オンボーディングブランチをベースとした段階的統合
   - 依存関係の慎重な統合とビルド確認
   - 重要な設定ファイルの個別検証

3. **Phase 2-4**: 既存フェーズを継続

##### 具体的な技術対策
- **バックアップ戦略**: 各段階での詳細なコミット保存とタグ付け
- **テスト駆動**: 統合前後での機能別詳細テスト
- **ロールバック計画**: 問題発生時の迅速な復旧手順
- **パフォーマンス監視**: バンドルサイズとレンダリング性能の継続監視

## 8. 成功基準

### 8.1 機能成功基準
- [ ] 全15画面のオンボーディングフローが正常動作
- [ ] 認証からメイン機能への遷移が正常動作
- [ ] チャットボット（音声）機能が正常動作
- [ ] ニュース・レシピ機能が正常動作
- [ ] ナビゲーション機能が正常動作

### 8.2 品質成功基準
- [ ] TypeScriptエラーが0件（React 19 + Next.js 15 環境で）
- [ ] ビルドが正常完了（警告含む0件）
- [ ] 全機能でUI一貫性が保たれている
- [ ] パフォーマンス要件を満たしている
- [ ] **React 19 互換性要件**:
  - [ ] チャットボット音声機能が正常動作
  - [ ] framer-motionアニメーションが正常動作
  - [ ] MediaRecorder APIが安定動作
  - [ ] useEffect、状態管理が期待通り動作

### 8.3 ユーザー体験成功基準
- [ ] 新規ユーザーがオンボーディングを完了できる
- [ ] 既存ユーザーがメイン機能を利用できる
- [ ] 機能間の遷移がスムーズ
- [ ] 音声機能が直感的に操作できる

## 9. 保守・運用

### 9.1 今後の開発方針
- **機能拡張**: オンボーディングデータのパーソナライゼーション活用
- **パフォーマンス改善**: 読み込み速度とUX最適化
- **セキュリティ強化**: 認証・API セキュリティの向上

### 9.2 技術債務管理
- **コードリファクタリング**: 重複コードの整理
- **テストカバレッジ**: 自動テストの追加
- **ドキュメント更新**: 統合後の仕様書更新

---

**作成日**: 2025-08-17  
**最終更新**: 2025-08-17  
**バージョン**: 1.2.0 - API設計・ユーザー認証仕様詳細追加  
**作成者**: Claude Code Assistant