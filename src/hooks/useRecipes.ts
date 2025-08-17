import { useState, useEffect } from 'react';

// 一時的なダミー実装（基準値測定用）
export interface UIRecipeData {
  id: string;
  title: string;
  description: string;
  status: string;
  details: Array<{
    label: string;
    color: string;
    items: string[];
  }>;
}

export interface UIRecommendedRecipeData {
  id: string;
  title: string;
  author: string;
  description: string;
  likes_count: number;
  copies_count: number;
  details: Array<{
    label: string;
    color: string;
    items: string[];
  }>;
}

export function useRecipes() {
  const [recipes, setRecipes] = useState<UIRecipeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recommendedRecipes, setRecommendedRecipes] = useState<UIRecommendedRecipeData[]>([]);
  const [recommendedLoading, setRecommendedLoading] = useState(true);
  const [recommendedError, setRecommendedError] = useState<string | null>(null);

  useEffect(() => {
    // ダミーデータでの初期化
    setTimeout(() => {
      setRecipes([]);
      setRecommendedRecipes([]);
      setLoading(false);
      setRecommendedLoading(false);
    }, 500);
  }, []);

  const refetch = () => {
    setLoading(true);
    setError(null);
    setTimeout(() => {
      setLoading(false);
    }, 500);
  };

  return {
    recipes,
    loading,
    error,
    refetch,
    recommendedRecipes,
    recommendedLoading,
    recommendedError
  };
}