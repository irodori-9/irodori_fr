# Azure App Service 起動修正要件定義書

## 📋 エラー分析結果

### 主要なエラー原因
1. **MODULE_NOT_FOUND エラー**: `server.js` ファイルが存在しない
2. **Next.js スタンドアロンモード設定不整合**: `output: 'standalone'` 設定だが、起動スクリプトが対応していない
3. **ビルド成果物の配置問題**: `.next` ディレクトリが正しく生成・配置されていない
4. **メモリ使用量超過**: アプリがメモリ制限を超えて停止

### エラーログから抽出された詳細
- `Error: Cannot find module '/home/site/wwwroot/server.js'`
- `path: '/home/site/wwwroot/.next/trace'` (ENOENTエラー)
- `Stopping site aps-irodori-01-service because it exceeded memory limits`
- `Container aps-irodori-01-service_0_28c4bb73 for site aps-irodori-01-service has exited, failing site start`

## 🎯 修正要件

### 1. package.json 修正 (最優先)
**現在の問題のある設定:**
```json
{
  "scripts": {
    "start": "node server.js"
  }
}
```

**修正案 A: 標準的なNext.jsアプローチ**
```json
{
  "scripts": {
    "build": "next build",
    "start": "next start"
  }
}
```

**修正案 B: スタンドアロンモード活用**
```json
{
  "scripts": {
    "build": "next build",
    "start": "node .next/standalone/server.js"
  }
}
```

### 2. Next.js 設定最適化
**現在の設定 (next.config.js):**
- `output: 'standalone'` が設定済み
- 適切なwebpack設定とrewrites設定が存在

**推奨アプローチ:**
- 修正案Aを採用し、標準的なNext.js起動方式に変更
- または修正案Bでスタンドアロンモードを正しく活用

### 3. Azure App Service 設定修正
**必要な環境変数:**
```bash
WEBSITE_NODE_DEFAULT_VERSION=22-lts
WEBSITES_ENABLE_APP_SERVICE_STORAGE=false
PORT=3000
NODE_ENV=production
```

**起動コマンド設定:**
- Azure App Service の起動コマンドが `npm start` になっていることを確認

### 4. ビルドプロセス確認
**デプロイ時の必須ステップ:**
1. `npm install` の実行
2. `npm run build` の実行
3. `.next` ディレクトリの生成確認
4. 必要な静的ファイルの配置確認

### 5. メモリ最適化対応
**問題:**
- コンテナがメモリ制限を超えて停止

**対策:**
- App Service プランのスケールアップ検討
- ビルド時のメモリ使用量最適化
- 実行時メモリ使用量の監視設定

## 🔧 実装手順

### Phase 1: 緊急修正 (即座に実装)
1. **package.json の start スクリプト修正**
   ```bash
   "start": "next start"
   ```

2. **デプロイ確認**
   - GitHub Actions でビルドが成功することを確認
   - `.next` ディレクトリが正しく生成されることを確認

### Phase 2: 検証・最適化 (修正後)
1. **起動確認**
   - Azure App Service でアプリが正常に起動することを確認
   - ヘルスチェックが成功することを確認

2. **メモリ使用量監視**
   - 実行時のメモリ使用量を監視
   - 必要に応じてプランをアップグレード

3. **パフォーマンステスト**
   - 基本的なページアクセステスト
   - API エンドポイントのレスポンステスト

## ⚠️ 重要な注意点

### スタンドアロンモードについて
- 現在 `output: 'standalone'` が設定されているが、適切に活用されていない
- 標準モードに変更するか、スタンドアロンモードを正しく実装するかを決定する必要がある

### 依存関係
- `next` パッケージが dependencies に正しく含まれていることを確認済み
- Node.js 22 LTS での動作を前提とした設定

### セキュリティ
- 環境変数の適切な設定
- 本番環境での機密情報の保護

## 📊 成功指標

### 技術的指標
- [ ] アプリケーションが正常に起動する
- [ ] HTTP ヘルスチェックが成功する
- [ ] メモリ使用量が制限内に収まる
- [ ] レスポンス時間が許容範囲内である

### 運用指標
- [ ] デプロイプロセスが安定している
- [ ] ログにエラーが出力されない
- [ ] モニタリングダッシュボードが正常値を示す

## 📝 備考

### 代替案の検討
- Docker コンテナでの直接デプロイ
- Azure Static Web Apps への移行検討
- CDN との組み合わせによるパフォーマンス向上

### 今後の改善項目
- CI/CDパイプラインの最適化
- 自動スケーリングの設定
- ログ監視とアラートの設定