// ニュース機能の型定義

export interface NewsItem {
  category: string;
  title: string;
  details: string;
  url: string;
}

export interface NewsData {
  [category: string]: NewsItem[];
}

export interface NewsApiResponse {
  success: boolean;
  data: NewsItem[] | NewsData;
  category?: string;
  count?: number;
  timestamp?: string;
  error?: string;
  message?: string;
}

export interface NewsCategoryConfig {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  colorClass: string;
}

// 設定ファイルから動的に生成される型
export type NewsCategory = string;