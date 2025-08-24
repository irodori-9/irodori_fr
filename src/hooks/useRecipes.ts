import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'

export interface UIRecipeData {
  id: string;
  title: string;
  description: string;
  status: string;
  author?: string;
  likes_count?: number;
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
  const { user } = useAuth()
  const [recipes, setRecipes] = useState<UIRecipeData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [recommendedRecipes, setRecommendedRecipes] = useState<UIRecommendedRecipeData[]>([])
  const [recommendedLoading, setRecommendedLoading] = useState(true)
  const [recommendedError, setRecommendedError] = useState<string | null>(null)

  // カテゴリ→色マッピング（recommendations と整合）
  const mapCategoryToColor = (category: string | undefined): string => {
    const key = (category || "").toString()
    if (/(INCREASE_SAVINGS|貯金)/i.test(key)) return "bg-purple-100 text-purple-800"
    if (/(ASSET_MANAGEMENT|投資)/i.test(key)) return "bg-blue-100 text-blue-800"
    if (/(REDUCE_EXPENSES|節約)/i.test(key)) return "bg-green-100 text-green-800"
    return "bg-slate-100 text-slate-800"
  }

  const fetchRecipes = async () => {
    try {
      setLoading(true)
      setError(null)
      
      if (!user?.id) {
        setError('レシピを表示するにはログインが必要です')
        setLoading(false)
        return
      }

      const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'
      const response = await fetch(`${backendUrl}/onboarding/recipes?user_id=${user.id}`)
      
      if (!response.ok) {
        throw new Error('レシピの取得に失敗しました')
      }
      
      const recipes = await response.json()
      // API仕様に基づいてデータを変換（色分けはカテゴリで判定）
      const uiRecipes = recipes.map((recipe: any) => ({
        id: recipe.id.toString(),
        title: recipe.name,
        description: recipe.description,
        status: "適用中",
        author: recipe.user?.nickname || `${recipe.user?.first_name} ${recipe.user?.last_name}` || "不明",
        likes_count: 0,
        details: recipe.rules?.map((rule: any) => ({
          label: rule.category || "ルール",
          color: mapCategoryToColor(rule.category),
          items: [rule.description || rule.name]
        })) || []
      }))
      setRecipes(uiRecipes)
    } catch (err: any) {
      setError(err.message || 'レシピの取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const fetchRecommendedRecipes = async () => {
    try {
      setRecommendedLoading(true)
      setRecommendedError(null)
      
      if (!user?.id) {
        setRecommendedError('おすすめレシピを表示するにはログインが必要です')
        setRecommendedLoading(false)
        return
      }

      const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'
      const response = await fetch(`${backendUrl}/onboarding/recommended_recipes?user_id=${user.id}`)
      
      if (!response.ok) {
        throw new Error('おすすめレシピの取得に失敗しました')
      }
      
      const recommendedRecipes = await response.json()
      // API仕様に基づいてデータを変換（色分けはカテゴリで判定）
      const uiRecommendedRecipes = recommendedRecipes.map((recipe: any) => ({
        id: recipe.id.toString(),
        title: recipe.name,
        author: recipe.user?.nickname || `${recipe.user?.first_name} ${recipe.user?.last_name}` || "不明",
        description: recipe.description,
        likes_count: recipe.likes_count || 0,
        copies_count: recipe.copies_count || 0,
        details: recipe.rules?.map((rule: any) => ({
          label: rule.category || "ルール",
          color: mapCategoryToColor(rule.category),
          items: [rule.description || rule.name]
        })) || []
      }))
      setRecommendedRecipes(uiRecommendedRecipes)
    } catch (err: any) {
      setRecommendedError(err.message || 'おすすめレシピの取得に失敗しました')
    } finally {
      setRecommendedLoading(false)
    }
  }

  useEffect(() => {
    // 認証状態に関わらずレシピフェッチを開始
    fetchRecipes()
    fetchRecommendedRecipes()
  }, [user?.id]) // user?.idの変化時にも再実行

  const refetch = () => {
    fetchRecipes()
    fetchRecommendedRecipes()
  }

  return {
    recipes,
    loading,
    error,
    refetch,
    recommendedRecipes,
    recommendedLoading,
    recommendedError
  }
}