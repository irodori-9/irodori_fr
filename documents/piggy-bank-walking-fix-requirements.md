# piggy-bank-walking.png 404エラー修正 要件定義書

## 問題の概要

### 発生している問題
- 本番環境（Azure App Service）で「はなす」ボタンを押した際に、TANABUTAちゃんのキャラクター画像（piggy-bank-walking.png）が404エラーで表示されない
- エラー: `GET https://aps-irodori-01-service-habzggebhadug7fg.eastasia-01.azurewebsites.net/images/mascot/piggy-bank-walking.png 404 (Not Found)`
- テスト環境では正常に表示される

### 影響範囲
- ユーザーがチャットボットで「はなす」ボタンを押した際の以下の状態表示：
  - TANABUTA thinking（考え中）
  - TANABUTA synthesizing speech（音声合成中）  
  - TANABUTA listening（音声認識中）

## 調査結果

### 現在の状況
1. **ファイル存在確認**: ✅
   - `/public/images/mascot/piggy-bank-walking.png` が存在
   - `/public/piggy-bank-walking.png` も存在（重複）

2. **コード参照確認**: ✅
   - `src/app/home/page.tsx:546`, `575`, `610` で `/images/mascot/piggy-bank-walking.png` を参照
   - `src/app/assets/page.tsx:11` でimport文での参照も存在

3. **Next.js設定確認**: ✅
   - `output: 'standalone'` モード使用
   - `images.unoptimized: true` 設定済み

4. **ビルドプロセス確認**: ❌ **問題発見**
   - `.next/standalone/public/` フォルダには `news.csv` のみ存在
   - 画像ファイル群が standalone ビルド出力にコピーされていない

## 根本原因

**ファイルパスの不整合による問題**

- **本番環境（コミット 3af2d17）**: `piggy-bank-walking.png` が `src/public/images/mascot/` 配下に存在
- **現在のローカル環境**: `piggy-bank-walking.png` が `/public/images/mascot/` 配下に移動（未コミット）
- **pig.png との差異**: `pig.png` は当初から `/public/images/mascot/` にあったため本番でも正常表示

コードは `/images/mascot/piggy-bank-walking.png` を参照しているが、本番環境のファイル構造では `src/public/` 配下にあるため404エラーが発生。

## 解決方針

### 優先順位1: ファイル構造の統一
正しいファイル構造（`/public/images/mascot/` 配下）でコミットし、本番環境に再デプロイ

### 優先順位2: 重複ファイルの整理
`/public/piggy-bank-walking.png`（ルート直下の重複ファイル）を削除

## 技術要件

### 必須要件
1. **ファイル配置**: `piggy-bank-walking.png` を `/public/images/mascot/` 配下に正しく配置
2. **重複削除**: `/public/piggy-bank-walking.png` の重複ファイルを削除
3. **コミット実行**: 正しいファイル構造をmainブランチにコミット
4. **再デプロイ**: Azure App Service への再デプロイ実行

### 非機能要件
1. **一貫性**: 全ての画像ファイルが同一の構造で管理される
2. **保守性**: 将来的な画像追加時も同じ構造を維持
3. **互換性**: 開発環境での動作に影響しない

## 実装案

### 案1: 即座の修正（推奨）
1. 重複ファイル `/public/piggy-bank-walking.png` を削除
2. 現在の正しいファイル構造をコミット
3. Azure App Service に再デプロイ

### 案2: 段階的修正
1. まず重複ファイルの整理
2. ファイル構造の検証
3. テスト環境での動作確認後にデプロイ

## 検証方法

### テスト項目
1. **ローカル確認**: `/public/images/mascot/piggy-bank-walking.png` の存在確認
2. **重複削除確認**: `/public/piggy-bank-walking.png` が削除されていることを確認
3. **本番環境確認**: デプロイ後に「はなす」ボタンでキャラクター画像表示確認
4. **回帰テスト**: 他の画像（pig.png等）に影響がないことを確認

### 検証環境
- ローカル開発環境
- Azure App Service 本番環境

## リスクと対策

### リスク
1. **デプロイ失敗**: Azure App Service へのデプロイが失敗する可能性
2. **キャッシュ影響**: ブラウザキャッシュにより変更が即座に反映されない可能性

### 対策
1. デプロイ前にローカル環境での十分な確認
2. デプロイ後のキャッシュクリアでの検証
3. 必要に応じてロールバック準備

## 成功基準

1. ✅ 本番環境で piggy-bank-walking.png が正常に表示される
2. ✅ 「はなす」ボタン押下時にキャラクター画像が表示される
3. ✅ 既存機能に影響がない
4. ✅ 開発環境での動作に変更がない