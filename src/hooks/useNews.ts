// ニュース機能のカスタムフック
// ニュースデータの取得、状態管理、エラーハンドリングを担当

import { useState, useEffect } from "react";
import { NewsItem, NewsData, NewsApiResponse } from "@/types/news";

export function useNews() {
  const [newsData, setNewsData] = useState<NewsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAllNews();
  }, []);

  const fetchAllNews = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch("/api/news");
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result: NewsApiResponse = await response.json();
      
      if (result.success && typeof result.data === 'object' && !Array.isArray(result.data)) {
        setNewsData(result.data as NewsData);
      } else {
        setError(result.message || "Failed to fetch news");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Network error occurred";
      setError(errorMessage);
      console.error("News fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const getNewsByCategory = (category: string): NewsItem[] => {
    if (!newsData) return [];
    return newsData[category] || [];
  };

  const fetchNewsByCategory = async (category: string): Promise<NewsItem[]> => {
    try {
      const response = await fetch(`/api/news?category=${encodeURIComponent(category)}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result: NewsApiResponse = await response.json();
      
      if (result.success && Array.isArray(result.data)) {
        return result.data as NewsItem[];
      } else {
        throw new Error(result.message || "Failed to fetch category news");
      }
    } catch (err) {
      console.error(`Error fetching news for category ${category}:`, err);
      return [];
    }
  };

  return {
    newsData,
    loading,
    error,
    getNewsByCategory,
    fetchNewsByCategory,
    refetch: fetchAllNews
  };
}