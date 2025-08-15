import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // リクエストボディの検証
    if (!body.text || typeof body.text !== 'string') {
      return NextResponse.json(
        { error: 'テキストが必要です' },
        { status: 400 }
      )
    }

    // バックエンドAPIの TTSRequest スキーマに合わせてパラメーターを設定
    const speechParams = {
      text: body.text,
      speaker: body.speaker || 3,
      speedScale: body.speedScale || null,
      pitchScale: body.pitchScale || null,
      intonationScale: body.intonationScale || null,
      volumeScale: body.volumeScale || null,
      prePhonemeLength: body.prePhonemeLength || null,
      postPhonemeLength: body.postPhonemeLength || null
    }

    console.log('音声合成リクエスト:', speechParams)

    // バックエンドAPIのベースURLを取得
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.API_BASE_URL || 'http://localhost:8000'
    const speechApiUrl = `${apiBaseUrl}/speech`
    
    console.log('バックエンドAPI URL:', speechApiUrl)

    // バックエンドの /speech エンドポイントを呼び出し
    const response = await fetch(speechApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(speechParams),
      // CORS対応
      credentials: 'include'
    })

    if (!response.ok) {
      console.error('バックエンド音声合成API エラー:', response.status, response.statusText)
      
      // レスポンス詳細をログ出力
      try {
        const errorText = await response.text()
        console.error('エラーレスポンス:', errorText)
      } catch (e) {
        console.error('エラーレスポンス読み取り失敗:', e)
      }
      
      throw new Error(`音声合成に失敗しました: ${response.status} ${response.statusText}`)
    }

    console.log('バックエンド音声合成API 成功')

    // バックエンドからのレスポンスを確認
    const contentType = response.headers.get('content-type')
    console.log('レスポンス Content-Type:', contentType)

    // WAVファイルを取得
    const audioBuffer = await response.arrayBuffer()
    console.log('音声データサイズ:', audioBuffer.byteLength, 'bytes')
    
    // WAVファイルをクライアントに返す
    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/wav',
        'Content-Length': audioBuffer.byteLength.toString(),
        'Cache-Control': 'no-cache',
      },
    })

  } catch (error: any) {
    console.error('音声合成API エラー:', error)
    
    // エラーの詳細をログに記録
    if (error.code === 'ECONNREFUSED') {
      console.error('バックエンドAPIに接続できません。サービスが起動しているか確認してください。')
      return NextResponse.json(
        { error: 'バックエンドAPIに接続できません' },
        { status: 503 }
      )
    }
    
    if (error.code === 'ENOTFOUND') {
      console.error('バックエンドAPIのホストが見つかりません。')
      return NextResponse.json(
        { error: 'バックエンドAPIが見つかりません' },
        { status: 503 }
      )
    }

    return NextResponse.json(
      { 
        error: '音声合成に失敗しました',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
}