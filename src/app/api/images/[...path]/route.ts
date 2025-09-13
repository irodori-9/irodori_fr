import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { headers } from 'next/headers'

// 許可する画像ファイル拡張子
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp', '.ico']

// MIME タイプのマッピング
const MIME_TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon'
}

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    // パスパラメータからファイルパスを構築
    const imagePath = params.path.join('/')
    
    // セキュリティ: パストラバーサル攻撃を防ぐ
    if (imagePath.includes('..') || imagePath.includes('\\')) {
      return NextResponse.json(
        { error: 'Invalid path' },
        { status: 400 }
      )
    }

    // publicフォルダ内の画像ファイルのパスを取得
    const filePath = path.join(process.cwd(), 'public', 'images', imagePath)
    
    // ファイル拡張子をチェック
    const fileExt = path.extname(filePath).toLowerCase()
    if (!ALLOWED_EXTENSIONS.includes(fileExt)) {
      return NextResponse.json(
        { error: 'File type not allowed' },
        { status: 400 }
      )
    }

    // ファイルの存在確認
    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: 'Image not found' },
        { status: 404 }
      )
    }

    // ファイルを読み込み
    const imageBuffer = fs.readFileSync(filePath)
    
    // 適切なContent-Typeヘッダーを設定
    const mimeType = MIME_TYPES[fileExt] || 'application/octet-stream'

    // 画像データを返す
    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': mimeType,
        'Cache-Control': 'public, max-age=31536000, immutable', // 1年間キャッシュ
        'Content-Length': imageBuffer.length.toString(),
      },
    })
  } catch (error) {
    console.error('Error serving image:', error)
    return NextResponse.json(
      { error: 'Failed to serve image' },
      { status: 500 }
    )
  }
}