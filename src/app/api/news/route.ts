// ニュースAPI エンドポイント
// public/news.csv から動的にニュースデータを取得

import { NextRequest, NextResponse } from "next/server";
import { readFileSync } from "fs";
import { join } from "path";
import { NewsItem, NewsData, NewsApiResponse } from "@/types/news";
import { getValidCategories } from "@/config/news";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");

    if (category) {
      // 特定カテゴリのニュースを取得
      const newsItems = await getNewsByCategory(category);
      return NextResponse.json({
        success: true,
        data: newsItems,
        category,
        count: newsItems.length
      } as NewsApiResponse);
    } else {
      // 全カテゴリのニュースを取得
      const allNews = await getAllNews();
      return NextResponse.json({
        success: true,
        data: allNews,
        timestamp: new Date().toISOString()
      } as NewsApiResponse);
    }
  } catch (error) {
    console.error("News API Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal Server Error",
        message: "Failed to fetch news data"
      } as NewsApiResponse,
      { status: 500 }
    );
  }
}

async function getNewsByCategory(category: string): Promise<NewsItem[]> {
  const validCategories = getValidCategories();
  if (!validCategories.includes(category)) {
    throw new Error(`Invalid category: ${category}. Valid categories: ${validCategories.join(", ")}`);
  }

  const allNews = await getAllNews();
  return allNews[category] || [];
}

async function getAllNews(): Promise<NewsData> {
  const filePath = join(process.cwd(), "public", "news.csv");
  
  try {
    const csvContent = readFileSync(filePath, "utf-8");
    const allItems = parseCSV(csvContent);
    
    // 設定ファイルから有効なカテゴリを取得して動的に初期化
    const validCategories = getValidCategories();
    const newsData: NewsData = {};
    
    // 各カテゴリで配列を初期化
    validCategories.forEach(category => {
      newsData[category] = [];
    });
    
    // CSVデータをカテゴリ別に分類
    allItems.forEach(item => {
      if (newsData[item.category]) {
        newsData[item.category].push(item);
      } else {
        // 未定義のカテゴリの場合、警告を出力
        console.warn(`Unknown category found in CSV: ${item.category}`);
      }
    });
    
    return newsData;
  } catch (error) {
    console.error("Failed to read news.csv:", error);
    
    // エラー時も設定ファイルベースで空のデータを返す
    const validCategories = getValidCategories();
    const emptyData: NewsData = {};
    validCategories.forEach(category => {
      emptyData[category] = [];
    });
    return emptyData;
  }
}

function parseCSV(csvContent: string): NewsItem[] {
  const lines = csvContent.split("\n").filter(line => line.trim() !== "");
  const items: NewsItem[] = [];

  // ヘッダー行をスキップ
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const columns = parseCSVLine(line);
    
    if (columns.length >= 4) {
      items.push({
        category: columns[0],
        title: columns[1],
        details: columns[2],
        url: columns[3]
      });
    }
  }

  return items;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++; // Skip next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
}