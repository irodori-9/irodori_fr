import { test, expect, Page } from '@playwright/test';

test.describe('Chatbot Functionality Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the home page where the chatbot is located
    await page.goto('/home');
    
    // Wait for the chatbot UI to be loaded
    await expect(page.getByText('今日もお仕事お疲れ様プイ！')).toBeVisible();
  });

  test('初期UI要素の確認', async ({ page }) => {
    // TANABUTAちゃんの初期メッセージを確認
    await expect(page.getByText('今日もお仕事お疲れ様プイ！')).toBeVisible();
    await expect(page.getByText('お金のことで困ったことがあれば聞かせてほしいプイ！')).toBeVisible();
    
    // TANABUTAちゃんの画像を確認
    const piggyBankImage = page.locator('img[alt="Piggy bank character"]');
    await expect(piggyBankImage).toBeVisible();
    
    // 「はなす」ボタンを確認
    const speakButton = page.getByRole('button', { name: 'はなす' });
    await expect(speakButton).toBeVisible();
    await expect(speakButton).not.toBeDisabled();
    
    // マイクアイコンを確認
    await expect(page.locator('svg').first()).toBeVisible(); // Mic icon
  });

  test('音声録音UI の開始・停止', async ({ page, context }) => {
    // マイク権限をグラントする（テスト環境）
    await context.grantPermissions(['microphone']);
    
    const speakButton = page.getByRole('button', { name: 'はなす' });
    
    // 「はなす」ボタンをクリック
    await speakButton.click();
    
    // 録音中のUI確認
    await expect(page.getByText('TANABUTAちゃんが聞いています...')).toBeVisible();
    await expect(page.getByText(/\d+s \/ 30s/)).toBeVisible(); // 録音時間表示
    await expect(speakButton).toHaveText('終了');
    
    // アニメーション要素の確認
    const listeningIndicator = page.locator('.animate-ping');
    await expect(listeningIndicator.first()).toBeVisible();
    
    // 「終了」ボタンをクリック
    await speakButton.click();
    
    // 録音終了後のUI確認
    await expect(page.getByText('TANABUTAちゃんが聞いています...')).not.toBeVisible();
    await expect(speakButton).toHaveText('はなす');
  });

  test('エラーハンドリングの表示', async ({ page }) => {
    // マイク権限を拒否してエラーを発生させる
    await page.context().grantPermissions([], { origin: page.url() });
    
    const speakButton = page.getByRole('button', { name: 'はなす' });
    await speakButton.click();
    
    // エラーメッセージの表示確認
    await expect(page.getByText('マイクの使用を許可してください')).toBeVisible();
    
    // エラーメッセージの閉じるボタン確認
    const closeButton = page.getByRole('button', { name: '閉じる' });
    await expect(closeButton).toBeVisible();
    
    // エラーメッセージを閉じる
    await closeButton.click();
    await expect(page.getByText('マイクの使用を許可してください')).not.toBeVisible();
  });

  test('レスポンシブデザインの確認', async ({ page }) => {
    // モバイルサイズに変更
    await page.setViewportSize({ width: 375, height: 667 });
    
    // モバイルでもUI要素が正しく表示されることを確認
    await expect(page.getByText('今日もお仕事お疲れ様プイ！')).toBeVisible();
    
    const speakButton = page.getByRole('button', { name: 'はなす' });
    await expect(speakButton).toBeVisible();
    
    // ボタンがフルwidth であることを確認
    const buttonBox = await speakButton.boundingBox();
    const pageBox = await page.boundingBox();
    expect(buttonBox!.width).toBeGreaterThan(pageBox!.width * 0.8); // 80%以上の幅
  });

  test('最大録音時間制限の確認', async ({ page, context }) => {
    await context.grantPermissions(['microphone']);
    
    const speakButton = page.getByRole('button', { name: 'はなす' });
    
    // 録音開始
    await speakButton.click();
    
    // 録音時間が表示されることを確認
    await expect(page.getByText(/\d+s \/ 30s/)).toBeVisible();
    
    // 録音時間が増加することを確認（数秒待機）
    await page.waitForTimeout(2000);
    await expect(page.getByText(/[2-9]s \/ 30s/)).toBeVisible();
    
    // 手動で録音を停止
    await speakButton.click();
  });

  test('処理中状態の確認', async ({ page, context }) => {
    await context.grantPermissions(['microphone']);
    
    // API呼び出しをモックして長時間の処理をシミュレート
    await page.route('**/transcribe', async route => {
      await page.waitForTimeout(3000); // 3秒待機
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ text: 'テストメッセージ' })
      });
    });
    
    await page.route('**/feedback', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ feedback: 'テスト応答プイ！' })
      });
    });
    
    const speakButton = page.getByRole('button', { name: 'はなす' });
    
    // 録音開始・停止
    await speakButton.click();
    await page.waitForTimeout(1000);
    await speakButton.click();
    
    // 処理中状態の確認
    await expect(page.getByText('TANABUTAちゃんが考え中...')).toBeVisible();
    await expect(speakButton).toHaveText('処理中...');
    await expect(speakButton).toBeDisabled();
    
    // 処理完了後の確認
    await expect(page.getByText('テストメッセージ')).toBeVisible();
    await expect(page.getByText('テスト応答プイ！')).toBeVisible();
    await expect(speakButton).toHaveText('はなす');
    await expect(speakButton).not.toBeDisabled();
  });

  test('APIエンドポイント呼び出しの確認', async ({ page, context }) => {
    await context.grantPermissions(['microphone']);
    
    let transcribeCallMade = false;
    let feedbackCallMade = false;
    
    // API呼び出しを監視
    await page.route('**/transcribe', async route => {
      transcribeCallMade = true;
      
      // リクエストヘッダーとボディを確認
      const request = route.request();
      expect(request.method()).toBe('POST');
      expect(request.headers()['content-type']).toMatch(/multipart\/form-data/);
      
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ text: 'テスト用文字起こし結果' })
      });
    });
    
    await page.route('**/feedback', async route => {
      feedbackCallMade = true;
      
      const request = route.request();
      expect(request.method()).toBe('POST');
      expect(request.headers()['content-type']).toBe('application/json');
      
      const postData = request.postDataJSON();
      expect(postData.text).toBe('テスト用文字起こし結果');
      
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ feedback: 'TANABUTAちゃんのテスト応答プイ！' })
      });
    });
    
    const speakButton = page.getByRole('button', { name: 'はなす' });
    
    // 録音プロセスをシミュレート
    await speakButton.click();
    await page.waitForTimeout(1000);
    await speakButton.click();
    
    // 処理完了を待機
    await page.waitForTimeout(5000);
    
    // API呼び出しが行われたことを確認
    expect(transcribeCallMade).toBe(true);
    expect(feedbackCallMade).toBe(true);
    
    // メッセージが表示されたことを確認
    await expect(page.getByText('テスト用文字起こし結果')).toBeVisible();
    await expect(page.getByText('TANABUTAちゃんのテスト応答プイ！')).toBeVisible();
  });

  test('会話履歴の表示確認', async ({ page, context }) => {
    await context.grantPermissions(['microphone']);
    
    // 複数回の会話をシミュレート
    await page.route('**/transcribe', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ text: '最初のメッセージ' })
      });
    });
    
    await page.route('**/feedback', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ feedback: '最初の応答プイ！' })
      });
    });
    
    const speakButton = page.getByRole('button', { name: 'はなす' });
    
    // 最初の会話
    await speakButton.click();
    await page.waitForTimeout(500);
    await speakButton.click();
    await page.waitForTimeout(2000);
    
    // メッセージの表示を確認
    await expect(page.getByText('最初のメッセージ')).toBeVisible();
    await expect(page.getByText('最初の応答プイ！')).toBeVisible();
    
    // ユーザーメッセージのスタイル確認
    const userMessage = page.locator('div:has-text("最初のメッセージ")').first();
    await expect(userMessage).toHaveClass(/bg-purple-500/);
    
    // ボットメッセージのスタイル確認
    const botMessage = page.locator('div:has-text("最初の応答プイ！")').first();
    await expect(botMessage).toHaveClass(/bg-white/);
  });

  test('エラー状況でのAPI処理確認', async ({ page, context }) => {
    await context.grantPermissions(['microphone']);
    
    // 401エラーをシミュレート
    await page.route('**/transcribe', async route => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Unauthorized' })
      });
    });
    
    const speakButton = page.getByRole('button', { name: 'はなす' });
    
    await speakButton.click();
    await page.waitForTimeout(500);
    await speakButton.click();
    
    // 認証エラーメッセージを確認
    await expect(page.getByText('認証が必要です。ログインしてください。')).toBeVisible();
  });

  test('チャットボードのアクセシビリティ確認', async ({ page }) => {
    // ボタンにaria-labelやroleが適切に設定されているか確認
    const speakButton = page.getByRole('button', { name: 'はなす' });
    await expect(speakButton).toBeVisible();
    
    // キーボードナビゲーションの確認
    await page.keyboard.press('Tab');
    await expect(speakButton).toBeFocused();
    
    // Enterキーでボタンが動作するか確認
    await page.keyboard.press('Enter');
    
    // 画像にalt属性があるか確認
    const piggyBankImage = page.locator('img[alt="Piggy bank character"]');
    await expect(piggyBankImage).toBeVisible();
  });
});