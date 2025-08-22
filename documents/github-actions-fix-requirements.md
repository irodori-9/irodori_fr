# GitHub Actions デプロイ失敗の修正要件定義書

## 1. 問題の概要
GitHub ActionsでのNext.jsアプリケーションのビルド時に、TypeScriptの型エラー（Lucide React関連）が発生してデプロイに失敗している。

## 2. エラーの詳細分析

### 2.1 TypeScript型エラー
- **ファイル**: `src/config/news.ts:11:5`
- **エラー内容**: Lucide ReactのTvアイコンの型が期待される型と一致しない

## 3. 根本原因分析

### 3.1 TypeScript型エラーの原因
`src/types/news.ts:27`のNewsCategoryConfig型の`icon`プロパティの型定義が、Lucide Reactアイコンの実際の型と互換性がない。

**現在の型定義（問題あり）:**
```typescript
icon: React.ComponentType<{ size?: number; className?: string }>;
```

**実際のLucide React型:**
```typescript
ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>
```

**具体的な不一致点:**
- `size`プロパティ: 期待値`number`のみ vs 実際`string | number`

## 4. 修正要件

### 4.1 TypeScript型エラーの修正（必須）
**修正方法**: 型定義を`LucideIcon`に変更

```typescript
import { LucideIcon } from "lucide-react";

export interface NewsCategoryConfig {
  id: string;
  label: string;
  icon: LucideIcon;  // ← 修正箇所
  colorClass: string;
}
```

## 5. 実装手順詳細

### 5.1 TypeScript型エラー修正
```typescript
// src/types/news.ts
import { LucideIcon } from "lucide-react";

export interface NewsCategoryConfig {
  id: string;
  label: string;
  icon: LucideIcon;  // ← 修正箇所
  colorClass: string;
}
```

### 5.2 ビルドテスト
1. ローカル環境でのビルド確認: `npm run build`
2. 型チェック確認: `npm run lint`

### 5.3 GitHub Actions再実行
修正後のプッシュによる自動デプロイ確認

## 6. 影響範囲の詳細

### 6.1 影響を受けるファイル（TypeScript型エラー）
- `src/types/news.ts` (修正対象)
- `src/config/news.ts` (型エラーの発生源)

### 6.2 影響を受けないファイル
- `src/components/bottom-nav.tsx` (正常動作中)
- `src/components/Header.tsx` (正常動作中)
- その他31ファイル (Lucide React使用中だが問題なし)

## 7. テスト要件

### 7.1 必須テスト項目
- [ ] TypeScript型エラーの解消
- [ ] ローカルビルドの成功確認
- [ ] GitHub Actionsビルドの成功確認
- [ ] ニュース機能の正常動作確認
- [ ] アイコン表示の確認

### 7.2 回帰テスト
- [ ] 既存のアイコン使用箇所への影響なし
- [ ] 他のコンポーネントの正常動作

## 8. 完了条件

1. ✅ GitHub Actionsでのビルドが成功する
2. ✅ TypeScriptエラーが解消される
3. ✅ ニュース機能が正常に動作する
4. ✅ 既存機能に影響がない

## 9. 追加考慮事項

### 9.1 セキュリティ
- 型安全性の向上により、ランタイムエラーのリスク軽減

### 9.2 保守性
- Lucide Reactの公式型を使用することで、将来のアップデートに対応

### 9.3 パフォーマンス
- 修正による性能への影響なし

---

**作成日**: 2025-08-22
**最終更新**: 2025-08-22
**ステータス**: 実装待ち