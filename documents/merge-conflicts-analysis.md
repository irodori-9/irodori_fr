# マージ競合・不整合分析レポート
# feature-implementation × オンボーディング機能統合

## 1. 重要な競合ファイル分析

### 1.1 package.json - 依存関係の大幅な相違
**競合レベル: 🔴 HIGH**

#### feature-implementation側の依存関係
```json
{
  "dependencies": {
    "@playwright/test": "^1.54.2",
    "axios": "^1.6.0",
    "framer-motion": "^12.23.12",
    "lucide-react": "^0.536.0",
    "next": "14.0.3",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  }
}
```

#### オンボーディング側の依存関係
```json
{
  "dependencies": {
    "@radix-ui/*": "1.x.x", // 多数のUIコンポーネント
    "framer-motion": "latest",
    "lucide-react": "^0.454.0",
    "next": "15.2.4",
    "react": "^19",
    "react-dom": "^19",
    "class-variance-authority": "^0.7.1",
    "tailwindcss-animate": "^1.0.7"
  }
}
```

#### 統合方針
1. **React/Next.js**: オンボーディング側の新しいバージョン（React 19, Next.js 15.2.4）を採用
2. **UI Library**: shadcn/ui（@radix-ui/*）をメイン機能でも活用
3. **framer-motion**: バージョン統一（latest）
4. **lucide-react**: バージョン統一（最新版）

### 1.2 next.config.js - 設定の相違
**競合レベル: 🟡 MEDIUM**

#### feature-implementation側
```javascript
{
  rewrites: [
    {
      source: '/api/:path*',
      destination: `${process.env.NEXT_PUBLIC_API_BASE_URL || process.env.API_BASE_URL || 'http://localhost:8000'}/:path*`,
    }
  ],
  webpack: {
    // キャッシュ設定、ファイル監視最適化
  }
}
```

#### オンボーディング側
```javascript
{
  rewrites: [
    {
      source: '/api/:path*',
      destination: `${process.env.API_BASE_URL || 'http://localhost:8000'}/:path*`,
    }
  ]
  // webpack設定なし
}
```

#### 統合方針
- **API rewrite**: feature-implementation側の詳細な設定を維持
- **webpack設定**: feature-implementation側の最適化設定を維持

### 1.3 src/app/layout.tsx - レイアウト構造の根本的相違
**競合レベル: 🔴 HIGH**

#### feature-implementation側
```tsx
// Header + BottomNav構造
<div className="relative min-h-screen w-full bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
  <div className="mx-auto max-w-md bg-gray-50/80 shadow-2xl">
    <Header />
    <main className="flex-grow p-4 sm:p-6 pt-6 pb-32">{children}</main>
    <BottomNav />
  </div>
</div>
```

#### オンボーディング側
```tsx
// AppShell構造
<div className="fixed inset-0 -z-50 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50" />
<AppShell>{children}</AppShell>
```

#### 統合方針
1. **背景**: オンボーディング側のfixed背景を採用（performance向上）
2. **レイアウト**: AppShell構造をベースに、Header/BottomNavを組み込む
3. **メタデータ**: オンボーディング側のシンプルな設定をベースに必要項目追加

### 1.4 src/app/page.tsx - ルートページの相違
**競合レベル: 🔴 HIGH**

#### feature-implementation側
```tsx
// 簡単なログアウト機能付きダッシュボード
export default function Home() {
  return (
    <div className="max-w-md mx-auto">
      <h1>IRODORI ダッシュボード</h1>
      <Button onClick={handleLogout}>ログアウト</Button>
    </div>
  )
}
```

#### オンボーディング側
```tsx
// 認証フローへのリダイレクト
export default function RootPage() {
  redirect("/auth/login")
}
```

#### 統合方針
- **オンボーディング側を採用**: 認証フローを優先
- **認証後の遷移**: `/auth/report` 完了後 → `/home` に変更

## 2. 機能重複・統合課題

### 2.1 認証機能の重複
**競合レベル: 🟡 MEDIUM**

#### feature-implementation側
- `src/app/login/page.tsx` - 基本的なログイン画面
- `src/app/register/page.tsx` - 基本的な登録画面

#### オンボーディング側  
- `src/app/auth/login/page.tsx` - 高度なデザインのログイン画面
- `src/app/auth/register/page.tsx` - 詳細な登録フォーム

#### 統合方針
- **オンボーディング側を採用**: より完成度の高いUIとバリデーション
- **feature-implementation側は削除**: 重複排除

### 2.2 コンポーネントライブラリの相違
**競合レベル: 🟡 MEDIUM**

#### feature-implementation側
```tsx
// カスタムコンポーネント
src/components/Button.tsx
src/components/Card.tsx
src/components/FormField.tsx
src/components/Header.tsx
```

#### オンボーディング側
```tsx
// shadcn/ui コンポーネント
src/components/ui/button.tsx
src/components/ui/card.tsx
src/components/ui/input.tsx
src/components/ui/dialog.tsx
// ... 50+ UIコンポーネント
```

#### 統合方針
1. **shadcn/ui優先**: 一貫性とメンテナンス性向上
2. **カスタムコンポーネント**: 必要に応じてshadcn/ui形式に移行
3. **Header**: feature-implementation側を改修してshadcn/ui活用

### 2.3 スタイリング手法の相違
**競合レベル: 🟡 MEDIUM**

#### feature-implementation側
```css
/* カスタムCSS + Tailwind */
.custom-chatbot-styles { ... }
.news-card-animations { ... }
```

#### オンボーディング側
```css
/* Pure Tailwind + CSS Variables */
:root {
  --background: #ffffff;
  --foreground: #09090b;
  --primary: #B547EB;
}
```

#### 統合方針
- **オンボーディング側のCSS Variables採用**: テーマ管理の向上
- **カスタムスタイル**: CSS Variablesを活用して統一

## 3. ファイルパス競合

### 3.1 画像ファイルの重複配置
**競合レベル: 🟡 MEDIUM**

#### feature-implementation側
```
public/piggy-bank.png
public/news.csv
```

#### オンボーディング側
```
public/images/mascot/pig.png
public/images/mascot/pig-analyzing.png
public/images/family/*.png
public/images/preparation/*.png
src/public/ (重複ディレクトリ)
```

#### 統合方針
1. **public/images/構造採用**: 組織化された構造
2. **pig.pngをpiggy-bank.pngとして統合**: 既存の参照を維持
3. **src/public/削除**: 不適切な配置の修正

### 3.2 設定ファイルの競合
**競合レベル: 🟡 MEDIUM**

#### feature-implementation側
```
.claude/settings.local.json (開発設定)
playwright.config.ts (テスト設定)
```

#### オンボーディング側
```
components.json (shadcn/ui設定)
next.config.mjs (追加設定ファイル)
postcss.config.mjs (追加設定ファイル)
```

#### 統合方針
- **両方の設定を統合**: 機能要件に応じて適切に結合
- **playwright.config.ts維持**: テスト機能の保持

## 4. API・環境設定の不整合

### 4.1 環境変数の相違
**競合レベル: 🟡 MEDIUM**

#### feature-implementation側
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
API_BASE_URL=http://localhost:8000
```

#### オンボーディング側
```env
API_BASE_URL=http://localhost:8000
```

#### 統合方針
- **統一的な環境変数命名**: `NEXT_PUBLIC_API_BASE_URL`で統一
- **rewrite設定の調整**: 両方の変数をサポート

### 4.2 TypeScript設定の相違
**競合レベル: 🟡 MEDIUM**

#### 主な相違点
- **paths設定**: エイリアスの相違
- **strict mode**: 厳密さレベルの相違
- **include/exclude**: 対象ファイルの相違

#### 統合方針
- **より厳密な設定採用**: 品質向上のため
- **paths統一**: `@/`エイリアスで統一

## 5. 統合時のリスク分析

### 5.1 高リスク項目

#### 5.1.1 React/Next.jsバージョンアップ (🔴 HIGH)
**リスク**: 既存のチャットボット・ニュース・レシピ機能の互換性
**対策**: 段階的アップグレード、機能別テスト

#### 5.1.2 UI Framework移行 (🔴 HIGH)  
**リスク**: カスタムコンポーネントのshadcn/ui移行時のスタイル破綻
**対策**: 既存デザインを忠実に再現、段階的移行

#### 5.1.3 認証フロー統合 (🔴 HIGH)
**リスク**: 既存のAPI認証との互換性
**対策**: セッション管理の検証、API連携テスト

### 5.2 中リスク項目

#### 5.2.1 パフォーマンス影響 (🟡 MEDIUM)
**リスク**: 大量のshadcn/uiコンポーネント追加によるバンドルサイズ増加
**対策**: Tree Shaking確認、必要最小限のコンポーネント使用

#### 5.2.2 音声機能互換性 (🟡 MEDIUM)
**リスク**: MediaRecorder APIの新環境での動作
**対策**: ブラウザ別テスト、polyfill検討

### 5.3 低リスク項目

#### 5.3.1 スタイル微調整 (🟢 LOW)
**リスク**: 色味やスペーシングの微調整必要
**対策**: CSS Variables活用で柔軟な調整

#### 5.3.2 ファイル整理 (🟢 LOW)
**リスク**: 不要ファイルの残存
**対策**: 統合後のクリーンアップ実施

## 6. 統合優先順位

### 6.1 Phase 1: 基盤統合 (重要度: 🔴 CRITICAL)
1. package.json統合とビルド確認
2. next.config.js統合
3. TypeScript設定統合
4. 基本的なlayout.tsx統合

### 6.2 Phase 2: 認証・ルーティング統合 (重要度: 🔴 HIGH)
1. 認証フローの統合
2. ページルーティングの整理
3. AppShell + Navigation統合

### 6.3 Phase 3: 機能統合 (重要度: 🟡 MEDIUM)
1. チャットボット機能の移植
2. ニュース機能の移植  
3. レシピ機能の移植
4. UIコンポーネントの統一

### 6.4 Phase 4: 最適化・テスト (重要度: 🟢 LOW)
1. パフォーマンス最適化
2. スタイル統一
3. 総合テスト実施

## 7. 推奨統合戦略

### 7.1 ベースブランチ選択
**推奨: オンボーディングブランチをベース**

#### 理由
1. **より新しい技術スタック**: React 19, Next.js 15.2.4
2. **完成度の高いUI基盤**: shadcn/ui ecosystem
3. **拡張性の高いアーキテクチャ**: AppShell構造
4. **保守性**: 統一されたデザインシステム

### 7.2 機能移植アプローチ
1. **feature-implementation機能をオンボーディングブランチに移植**
2. **段階的な統合**: 機能ごとに個別検証
3. **UI統一**: shadcn/uiを活用した一貫したデザイン
4. **API互換性維持**: 既存のAPI連携を保持

### 7.3 品質保証戦略
1. **TypeScript strict mode**: 型安全性の確保
2. **段階的テスト**: 機能ごとの動作確認
3. **パフォーマンス監視**: バンドルサイズとレンダリング性能
4. **ブラウザ互換性**: 特に音声機能の検証

---

**作成日**: 2025-08-17  
**最終更新**: 2025-08-17  
**バージョン**: 1.0.0  
**作成者**: Claude Code Assistant