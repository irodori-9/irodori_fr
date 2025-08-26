# iOS Safari音声再生機能改修要件定義書

## 概要

iOS Safariにおいて、チャットボットの音声再生機能で「音声の再生に失敗しました」エラーが発生する問題を解決するための改修要件を定義する。

## 問題分析

### 現在の実装概要

- **実装箇所**: `src/hooks/useTextToSpeech.ts:104-154`
- **エラー発生箇所**: `src/hooks/useTextToSpeech.ts:138` (`audio.onerror`ハンドラー)
- **使用箇所**: `src/app/home/page.tsx:286-287` (チャットボット応答後の自動再生)

### 技術的根本原因

#### 1. iOS Safari Blob URL制限問題

**影響度**: 🔴 Critical
- iOS Safari 15.4以降で `bytes=0-*` レンジリクエストによる416エラーが発生
- Safari 17.2でも「The media resource indicated by the src attribute...was not suitable」エラーが継続
- 70KB以上のオーディオファイルで無限ループやメモリリークが発生
- iOS 17.4.1でBlob URLサポートが一時的に停止（iOS 17.5 betaで修正済み）

#### 2. iOS Safari自動再生ポリシー違反

**影響度**: 🔴 Critical  
- 音声はユーザー操作後の非同期処理完了時に自動再生される（`home/page.tsx:286-287`）
- iOS Safariは非同期処理後の`play()`呼び出しをユーザージェスチャーとして認識しない
- `NotAllowedError: The request is not allowed`エラーが発生

#### 3. Promise拒否の未処理

**影響度**: 🟡 Medium
- `audio.play()`がPromiseを返すが、拒否時の適切な処理が不足
- 「Unhandled Promise Rejection」警告が発生する可能性

#### 4. MIMEタイプ最適化不足

**影響度**: 🟡 Medium  
- 現在`audio/wav`固定だが、Safariでは他の形式が適している場合がある
- Blob作成時の型指定が不適切な可能性

## 修正要件

### 要件1: 2024年iOS Safari対応の音声再生戦略（根本的見直し）

**優先度**: P0 (必須)  
**現状認識**: 2024年調査により、iOS Safari 17-18でも音声自動再生制限が継続している  
**参考**: 
- [MDN Autoplay Guide 2024](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay)
- [Howler.js iOS Safari対応](https://howlerjs.com/)
- [Safari 18.0 Release Notes](https://developer.apple.com/documentation/safari-release-notes/safari-18-release-notes)

#### 1.1 iOS Safari音声制限の2024年現状
- **制限継続**: iOS Safari 17-18でもWebAudio API・HTMLAudioElement共に自動再生制限継続
- **影響範囲**: 
  - ユーザー操作後の非同期処理での音声再生が`NotAllowedError`で失敗
  - AudioContext unlock後もHTMLAudioElementには制限が残る
  - 同一Audio要素の再利用が必要だが、技術的に困難

#### 1.2 従来のアンロック方式の限界（検証済み）
- **試行済み方式**: 無音Audio要素の事前再生による制限解除
- **失敗理由**: 
  - アンロック用と実際の再生用が別Audio要素のため制限継続
  - 同一要素の再利用が技術的に複雑
  - iOS Safari特有のBlob URL制限も併存

#### 1.3 2024年推奨アプローチ：ブラウザ別音声再生戦略

**根拠**: 
- iOS Safariは厳格な制限により手動再生必須
- Android Chromeやデスクトップブラウザはユーザージェスチャー後の自動再生が可能
- ブラウザごとに最適な体験を提供

**実装方針**:
- **iOS Safari**: 手動再生ボタンによる確実な音声再生
- **Android Chrome/Desktop**: 現在の自動再生を維持（ユーザビリティ重視）
- **その他ブラウザ**: 自動再生を試行し、失敗時は手動再生にフォールバック

**ブラウザ別UI/UX設計**:
```
🍎 iOS Safari:
ボット応答 + [🔊 音声を聞く] ボタン → クリックで再生

🤖 Android Chrome:
ボット応答 → 自動音声再生（現在のまま）

🖥️ Desktop:
ボット応答 → 自動再生試行 → 失敗時は手動ボタン表示
```

### 要件2: ブラウザ別音声再生戦略の実装

**優先度**: P0 (必須)

#### 2.1 ブラウザ判定ロジック
- **実装箇所**: `src/hooks/useTextToSpeech.ts`
- **判定条件**:
  ```javascript
  const isIOSSafari = /iPad|iPhone|iPod/.test(navigator.userAgent) && 
                      /Safari/.test(navigator.userAgent) && 
                      !/Chrome/.test(navigator.userAgent);
  const isAndroidChrome = /Android/.test(navigator.userAgent) && 
                          /Chrome/.test(navigator.userAgent);
  ```

#### 2.2 音声再生モードの分岐
- **iOS Safari**: 常に手動再生ボタンを表示
- **Android Chrome**: 従来通り自動再生を実行
- **その他ブラウザ**: 自動再生を試行、失敗時は手動ボタン表示

#### 2.3 手動音声再生ボタン（iOS Safari専用）
- **UI仕様**:
  - 音声合成準備中: 「🔊 音声準備中...」（無効化状態）
  - 音声準備完了: 「🔊 音声を聞く」（クリック可能）
  - 音声再生中: 「⏸️ 停止」（停止ボタン）
- **表示条件**: iOS Safariまたは自動再生失敗時のみ

### 要件3: エラーハンドリング強化

**優先度**: P1 (重要)

#### 3.1 Promise拒否の適切な処理
- **実装箇所**: `src/hooks/useTextToSpeech.ts:154`
- **実装内容**:
  ```javascript
  try {
    await audio.play();
    console.log('✅ Audio playback started');
  } catch (error) {
    if (error.name === 'NotAllowedError') {
      // 音声アンロックが必要
      if (!isAudioUnlocked) {
        setError('音声再生には最初に「はなす」ボタンを押してください');
      } else {
        setError('音声の再生に失敗しました。再度お試しください');
      }
    } else {
      handleAudioError(error);
    }
  }
  ```

#### 3.2 アンロック状態に応じたエラーメッセージ
- **実装内容**: アンロック状態を考慮したエラー表示
- **iOS Safari用メッセージ**: 
  - アンロック未実行: 「音声再生には最初に「はなす」ボタンを押してください」
  - アンロック済みエラー: 「音声の再生に失敗しました。ページを更新して再度お試しください」

### 要件4: パフォーマンス最適化（オプション）

**優先度**: P2 (改善)

#### 4.1 音声ファイルサイズ最適化
- **実装箇所**: `src/hooks/useTextToSpeech.ts:55-61`
- **実装内容**: 
  - 現在の制限値（1000文字）を維持
  - iOS Safari向けの最適化は音声アンロックで解決されるため不要
- **注意**: アンロック方式により大容量ファイルも再生可能になる予定

## 技術仕様

### 修正対象ファイル

1. **`src/hooks/useTextToSpeech.ts`** ⭐ メイン修正対象
   - ブラウザ判定ロジックの追加
   - 音声再生モード分岐の実装
   - 手動再生状態管理とiOS Safari対応

2. **`src/app/home/page.tsx`** ⭐ メイン修正対象
   - ブラウザ別音声再生処理の分岐
   - iOS Safari用手動再生ボタンの条件表示
   - Android Chrome用自動再生の維持

3. **`src/components/AudioPlayButton.tsx`** 🆕 新規作成推奨
   - iOS Safari専用音声再生ボタンコンポーネント
   - 再生状態に応じたUI切り替え
   - ブラウザ判定に応じた表示制御

### 互換性マトリクス（ブラウザ別戦略版）

| ブラウザ | 音声再生方式 | 対応状況 | 実装方式 |
|---------|------------|----------|----------|
| Chrome Desktop | 自動再生→手動フォールバック | ✅ 対応 | 自動再生試行、失敗時手動ボタン |
| **Android Chrome** | **自動再生** | ✅ **現状維持** | **従来通り自動再生（ユーザビリティ重視）** |
| Safari Desktop | 自動再生→手動フォールバック | ✅ 対応 | 自動再生試行、失敗時手動ボタン |
| **iOS Safari** | **手動再生ボタン** | 🎯 **修正対象** | **最初から手動ボタン表示** |
| Firefox | 自動再生→手動フォールバック | ✅ 対応 | 自動再生試行、失敗時手動ボタン |

**ハイブリッド戦略**: 
- ✅ Android Chrome: 従来の自動再生を維持（UX最適化）
- ✅ iOS Safari: 確実な手動再生（技術制限対応）
- ✅ その他ブラウザ: 自動再生を試行、失敗時は手動再生（柔軟性重視）

## テスト要件

### 1. 機能テスト

#### 1.1 iOS Safari (必須)
- [ ] iOS 16.x Safari での音声再生テスト
- [ ] iOS 17.x Safari での音声再生テスト  
- [ ] iOS 18.x Safari での音声再生テスト
- [ ] PWAモードでの動作テスト

#### 1.2 他ブラウザ回帰テスト
- [ ] Chrome Desktop/Mobile
- [ ] Safari Desktop
- [ ] Firefox Desktop/Mobile
- [ ] Edge Desktop/Mobile

### 2. パフォーマンステスト

- [ ] 音声ファイル読み込み時間測定
- [ ] メモリ使用量監視（特にiOS Safari）
- [ ] 連続再生でのメモリリーク確認

### 3. エラーハンドリングテスト

- [ ] ネットワーク切断時の動作
- [ ] ファイルサイズ上限超過時の動作
- [ ] 音声合成API失敗時の動作

## 実装優先順位（2024年改定版）

### フェーズ1 (P0 - 必須対応) 🎯 **今回実装**
1. ブラウザ判定ロジックの実装
2. iOS Safari用手動再生ボタンUIの実装  
3. Android Chrome用自動再生の維持
4. 音声再生モード分岐システムの構築

### フェーズ2 (P1 - 重要対応) 🔧 **品質向上**  
1. iOS Safari専用エラーハンドリング
2. アクセシビリティ対応強化
3. 音声再生状態の詳細管理

### フェーズ3 (P2 - 改善対応) ⚡ **UX向上**
1. 音声再生ボタンのアニメーション
2. キーボードショートカット対応
3. 詳細なテスト実施

**重要**: ブラウザごとに最適な音声再生戦略を採用
- Android Chrome: 自動再生維持（UX重視）
- iOS Safari: 手動再生（確実性重視）
- その他: 自動再生試行後フォールバック（柔軟性重視）

## 完了基準（ブラウザ別戦略版）

- ✅ **Android Chrome**: 現在の自動音声再生が継続動作する
- ✅ **iOS Safari**: 手動音声再生ボタンが確実に動作する  
- ✅ **その他ブラウザ**: 自動再生試行→失敗時手動ボタン表示が正常動作
- ✅ ブラウザ判定ロジックが正確に動作する
- ✅ 音声準備完了時の適切な通知とUI切り替え
- ✅ アクセシビリティガイドライン（WCAG 2.1 AA）準拠  
- ✅ 全ブラウザでの回帰テストがPASSしている

**UX向上基準**:
- 🎯 音声再生までのクリック数を最小化（1クリック）
- 🎯 音声準備中の視覚的フィードバック提供
- 🎯 エラー時の分かりやすいメッセージ表示

## 参考資料（2024年版）

### 📋 **今回の主要参考資料**
- [MDN Autoplay Guide 2024](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay) - 最新の自動再生ポリシー
- [Howler.js Documentation](https://howlerjs.com/) - iOS Safari対応ベストプラクティス  
- [Safari 18.0 Release Notes](https://developer.apple.com/documentation/safari-release-notes/safari-18-release-notes) - 最新制限情報

### 📚 **補助参考資料**
- [Qiita - iOS Safariでの音声再生制限回避](https://qiita.com/pentamania/items/2c568a9ec52148bbfd08) - 参考（ただし古い情報）
- [Safari Audio API Limitations](https://developer.apple.com/forums/thread/701201) - Apple公式フォーラム
- [WebKit Bug Reports](https://bugs.webkit.org/show_bug.cgi?id=232076) - 継続中の既知問題

---

**作成日**: 2025-08-25  
**最終更新**: 2025-08-25（2024年iOS Safari調査反映）  
**作成者**: Claude Code  
**バージョン**: 2.0

## 📝 **変更履歴**

### v2.0 (2025-08-25)
- **重要**: 2024年iOS Safari 17-18の最新調査結果を反映
- **方針転換**: 音声アンロック方式からブラウザ別戦略へ変更
- **Android Chrome**: 従来の自動再生を維持（ユーザビリティ重視）
- **iOS Safari**: 手動再生ボタンによる確実な音声再生
- **その他**: 自動再生試行後、失敗時は手動再生フォールバック

### v1.0 (2025-08-25)  
- 初版作成：音声コンテキストアンロック方式による自動再生実現を目指す