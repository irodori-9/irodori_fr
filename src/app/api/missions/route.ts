import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET(request: NextRequest) {
  try {
    // publicフォルダのmission.csvファイルのパスを取得
    const filePath = path.join(process.cwd(), 'public', 'mission.csv')
    
    // ファイルの存在確認
    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: 'Mission file not found' },
        { status: 404 }
      )
    }

    // CSVファイルを読み込み
    const csvData = fs.readFileSync(filePath, 'utf8')

    // CSVデータを返す（適切なContent-Typeヘッダーを設定）
    return new NextResponse(csvData, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Cache-Control': 'public, max-age=3600', // 1時間キャッシュ
      },
    })
  } catch (error) {
    console.error('Error reading mission file:', error)
    return NextResponse.json(
      { error: 'Failed to read mission file' },
      { status: 500 }
    )
  }
}