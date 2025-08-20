import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { user_id } = body

    if (!user_id || typeof user_id !== 'number') {
      return NextResponse.json(
        { error: 'user_id is required and must be a number' },
        { status: 400 }
      )
    }

    // Azureバックエンドに認証状態を確認
    const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'
    
    const response = await fetch(`${backendUrl}/user/session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user_id }),
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: 'User session validation failed' },
        { status: response.status }
      )
    }

    const userData = await response.json()
    
    // ユーザー情報の基本的な形式チェック
    if (!userData.user_id) {
      return NextResponse.json(
        { error: 'Invalid user data from backend' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      user_id: userData.user_id,
      nickname: userData.nickname || null,
      email: userData.email || null,
      is_authenticated: true,
    })
    
  } catch (error) {
    console.error('User session API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}