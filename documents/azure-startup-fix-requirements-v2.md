# Azure App Service 起動修正 - 改修要件定義書 v2.0

## 🔍 根本原因分析

### 1. ポート設定問題（最重要）
**発見事項:**
- スタンドアロンサーバー: `const currentPort = parseInt(process.env.PORT, 10) || 3000`
- Azure App Service: `--expose=8080` を期待するが、アプリは異なるポートでリッスン
- **成功ケース**: PORT環境変数未設定（デフォルト3000）+ `--expose=8080` → 正常動作

### 2. 環境変数とプロキシの不一致
```
失敗パターン:
- PORT=3000 + --expose=3000 → 失敗
- PORT=8000 + --expose=8000 → 失敗  
- PORT=3000 + --expose=8080 → 失敗

成功パターン:
- PORT未設定(default 3000) + --expose=8080 → 成功
```

### 3. ログ無効化問題
- コンテナログが無効: `"Logging is not enabled for this container"`
- 実際のアプリケーションエラーが見えない
- デバッグが困難

## 🎯 改修要件

### Phase 1: ポート設定の統一（最優先）

#### 1-1. スタンドアロンサーバーの修正
```javascript
// 修正前（問題のあるコード）
const currentPort = parseInt(process.env.PORT, 10) || 3000

// 修正後（Azure App Service対応）
const currentPort = process.env.WEBSITES_PORT || 
                   parseInt(process.env.PORT, 10) || 8080
```

#### 1-2. GitHub Actionsワークフローの修正
```yaml
# デプロイ後のserver.js修正ステップを追加
- name: Fix Azure App Service port configuration
  run: |
    # server.jsのポート設定を8080に統一
    sed -i 's/|| 3000/|| 8080/g' ./deploy/server.js
    # 修正確認
    grep -n "currentPort" ./deploy/server.js
```

#### 1-3. Azure App Service設定
- **スタートアップコマンド**: `node server.js`
- **ポート設定**: 明示的に8080固定
- **環境変数**: `WEBSITES_PORT=8080` 追加

### Phase 2: ログとモニタリング強化

#### 2-1. ログ有効化
```yaml
# GitHub Actionsでの設定
startup-file: 'server.js'
enable-logging: true
```

#### 2-2. Azure App Service診断設定
- Application Loggingを有効化
- Web Server Loggingを有効化
- Detailed Error Messagesを有効化
- File System経由でログ出力

### Phase 3: 堅牢性向上

#### 3-1. ヘルスチェックエンドポイント追加
```javascript
// server.js に追加予定
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    port: currentPort,
    env: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});
```

#### 3-2. 環境変数検証
```javascript
// 起動時の環境確認
console.log('=== Azure App Service Environment Check ===');
console.log('PORT:', process.env.PORT);
console.log('WEBSITES_PORT:', process.env.WEBSITES_PORT);
console.log('Current Port:', currentPort);
console.log('Hostname:', hostname);
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('===========================================');
```

## 🔧 実装手順

### Step 1: 緊急修正（即時実装）
1. **GitHub Actions修正**: 
   - server.jsのポート設定を8080に統一
   - デプロイ前の修正ステップを追加

2. **Azure Portal設定**:
   - スタートアップコマンド: `node server.js`
   - 環境変数: `WEBSITES_PORT=8080`
   - Application Logging: File System (Level: Information)

3. **デプロイ実行**: 修正版をデプロイして即座に検証

### Step 2: 検証・最適化（修正後）
1. **デプロイテスト**: 
   - 修正版をデプロイして起動確認
   - 複数回のデプロイテストで安定性確認

2. **ヘルスチェック**: 
   - `/health` エンドポイントでポート確認
   - レスポンス内容の妥当性チェック

3. **ログ監視**: 
   - 起動ログとエラーログの詳細確認
   - Azure Log Streamでリアルタイム監視

### Step 3: 長期改善（安定化後）
1. **Next.js設定最適化**: 
   - ポート設定をより柔軟に
   - 環境別設定の分離

2. **モニタリング強化**: 
   - Azure Application Insightsとの連携
   - アラート設定とダッシュボード作成

3. **自動復旧**: 
   - 起動失敗時の自動再試行設定
   - ヘルスチェック連携の自動スケーリング

## 📊 期待される改善効果

### 技術的改善
- ✅ **一貫した起動成功率**: 現在: 不安定 → 目標: 99%+
- ✅ **起動時間短縮**: 現在: 30-60秒 → 目標: 10-20秒
- ✅ **エラー原因の可視化**: 現在: ログ無し → 目標: 詳細ログ
- ✅ **ポート設定の統一**: 現在: 混乱状態 → 目標: 8080固定

### 運用改善
- ✅ **デプロイの信頼性向上**: 手動介入不要
- ✅ **障害時の迅速な原因特定**: ログとメトリクスによる可視化
- ✅ **Azure App Serviceのベストプラクティス準拠**: 推奨設定の採用
- ✅ **チーム開発効率向上**: 安定したインフラ基盤

## 🚀 具体的修正内容

### GitHub Actions ワークフロー修正
```yaml
- name: Fix Azure App Service port configuration
  run: |
    # ポート設定を8080に統一
    sed -i 's/parseInt(process\.env\.PORT, 10) || 3000/8080/g' ./deploy/server.js
    # 環境変数ログ追加
    sed -i '/process\.chdir(__dirname);/a\\nconsole.log("=== Azure App Service Environment ===");\\nconsole.log("PORT:", process.env.PORT);\\nconsole.log("Current Port:", 8080);\\nconsole.log("======================================");' ./deploy/server.js
    # 修正内容確認
    echo "Modified server.js port configuration:"
    grep -A 5 -B 5 "8080" ./deploy/server.js
```

### Azure App Service 設定項目
```
アプリケーション設定:
- WEBSITES_PORT: 8080
- NODE_ENV: production
- WEBSITE_NODE_DEFAULT_VERSION: 22-lts

全般設定:
- スタートアップ コマンド: node server.js
- HTTP バージョン: 2.0
- ARR アフィニティ: オフ

ログ:
- Application Logging (File System): Information
- Web Server Logging: File System  
- 詳細エラー メッセージ: オン
```

## ⚠️ 重要な注意点

### 実装時の注意
1. **ポート統一の重要性**: 8080ポート統一が最も重要な修正
2. **段階的実装**: 緊急修正→検証→最適化の順序を遵守
3. **ログ監視**: 修正後は必ずログを確認して動作検証
4. **バックアップ**: 現在の動作する設定を記録保存

### リスク管理
1. **ロールバック計画**: 修正が失敗した場合の戻し手順
2. **テスト環境**: 本番適用前のテスト環境での検証
3. **監視体制**: 修正後24時間のログ監視体制

## 📋 成功判定基準

### Phase 1 成功基準
- [ ] コンテナが15秒以内に正常起動
- [ ] HTTP ヘルスチェックが成功
- [ ] ログにポート8080でのリッスン開始が記録
- [ ] 連続3回のデプロイが成功

### Phase 2 成功基準  
- [ ] アプリケーションログが正常出力
- [ ] エラーログに意味のある情報が記録
- [ ] Azure Log Stream でリアルタイム確認可能

### Phase 3 成功基準
- [ ] `/health` エンドポイントが正常レスポンス
- [ ] 24時間連続稼働での安定性確認
- [ ] 負荷テストでの正常動作確認

この改修により、Azure App Service での安定した起動と運用が実現されます。