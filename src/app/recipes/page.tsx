"use client";

import { Heart, AlertTriangle, Loader2, RefreshCw, Copy } from "lucide-react"
import { useRecipes } from "@/hooks/useRecipes"

const PunchHoleSidebar = () => (
  <div className="w-16 bg-slate-100 rounded-l-2xl flex flex-col items-center justify-around py-4 border-r border-slate-200">
    {Array(6)
      .fill(0)
      .map((_, i) => (
        <div key={i} className="w-5 h-5 bg-white rounded-full ring-1 ring-slate-200/50" />
      ))}
  </div>
)

export default function RecipesPage() {
  const { 
    recipes, 
    loading, 
    error, 
    refetch,
    recommendedRecipes,
    recommendedLoading,
    recommendedError
  } = useRecipes();

  if (loading) {
    return <RecipeLoadingState />;
  }

  if (error) {
    return <RecipeErrorState error={error} onRetry={refetch} />;
  }

  return (
    <div className="space-y-8">
      {/* 利用中のレシピセクション */}
      <section>
        <h2 className="text-lg font-bold text-gray-800 mb-4">
          利用中のレシピ
        </h2>
        {recipes.length === 0 ? (
          <EmptyActiveRecipeState />
        ) : (
          <div className="space-y-4">
            {recipes.map((recipe) => (
              <ActiveRecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        )}
      </section>

      {/* おすすめレシピセクション */}
      <section>
        <h2 className="text-lg font-bold text-gray-800 mb-4">
          おすすめレシピ
        </h2>
        {recommendedLoading ? (
          <RecommendedRecipeLoadingState />
        ) : recommendedError ? (
          <RecommendedRecipeErrorState error={recommendedError} />
        ) : recommendedRecipes.length === 0 ? (
          <EmptyRecommendedRecipeState />
        ) : (
          <div className="space-y-4">
            {recommendedRecipes.map((recipe) => (
              <RecommendedRecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

// ローディング状態コンポーネント
function RecipeLoadingState() {
  return (
    <div className="space-y-4">
      <div className="text-center py-8">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-purple-500" />
        <p className="text-sm text-gray-600">レシピを読み込み中...</p>
      </div>
      
      {/* スケルトンカード */}
      {[1, 2].map((i) => (
        <div key={i} className="flex rounded-2xl overflow-hidden border-2 border-transparent shadow-md">
          <PunchHoleSidebar />
          <div className="flex-1 bg-white p-4">
            <div className="flex justify-between items-start mb-1">
              <div className="h-6 w-3/4 bg-gray-200 rounded animate-pulse" />
              <div className="h-6 w-16 bg-gray-200 rounded-full animate-pulse" />
            </div>
            <div className="h-4 w-full bg-gray-200 rounded animate-pulse mb-4" />
            
            <div className="space-y-2">
              <div className="bg-gray-100 p-3 rounded-lg">
                <div className="h-3 w-12 bg-gray-200 rounded animate-pulse mb-2" />
                <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// エラー状態コンポーネント
interface RecipeErrorStateProps {
  error: string;
  onRetry: () => void;
}

function RecipeErrorState({ error, onRetry }: RecipeErrorStateProps) {
  return (
    <div className="text-center py-12">
      <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
        <AlertTriangle size={32} className="text-red-500" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        レシピの読み込みに失敗しました
      </h3>
      <p className="text-sm text-gray-600 mb-6 max-w-md mx-auto">{error}</p>
      <button
        onClick={onRetry}
        className="inline-flex items-center gap-2 px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
      >
        <RefreshCw size={16} />
        再試行
      </button>
    </div>
  );
}

// 適用中レシピカードコンポーネント
interface ActiveRecipeCardProps {
  recipe: UIRecipeData;
}

function ActiveRecipeCard({ recipe }: ActiveRecipeCardProps) {
  return (
    <div className="flex rounded-2xl overflow-hidden border-2 border-purple-400 shadow-lg shadow-purple-400/40 transition-all">
      <PunchHoleSidebar />
      <div className="flex-1 bg-white p-4">
        <div className="flex justify-between items-start mb-1">
          <h3 className="font-bold text-lg text-gray-800">{recipe.title}</h3>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-purple-600 text-white">
            {recipe.status}
          </span>
        </div>
        <p className="text-xs text-gray-500 mb-4">{recipe.description}</p>

        <div className="space-y-2">
          {recipe.details.map((detail, i) => (
            <div key={i} className={`${detail.color} p-3 rounded-lg`}>
              <p className="text-xs font-bold">{detail.label}</p>
              <ul className="mt-1 space-y-1">
                {detail.items.map((item, j) => (
                  <li key={j} className="text-sm font-medium text-gray-800 list-disc list-inside">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-center gap-1.5">
          <Heart className="text-purple-400 fill-current" size={18} />
          <span className="text-sm font-semibold text-purple-600">いいね</span>
        </div>
      </div>
    </div>
  );
}

// おすすめレシピカードコンポーネント
interface RecommendedRecipeCardProps {
  recipe: UIRecommendedRecipeData;
}

function RecommendedRecipeCard({ recipe }: RecommendedRecipeCardProps) {
  return (
    <div className="flex rounded-2xl overflow-hidden border-2 border-transparent shadow-md hover:shadow-lg transition-all cursor-pointer group">
      <PunchHoleSidebar />
      <div className="flex-1 bg-white p-4">
        <div className="flex justify-between items-start mb-1">
          <h3 className="font-bold text-lg text-gray-800 group-hover:text-gray-700">{recipe.title}</h3>
        </div>
        <p className="text-xs text-gray-500 mb-2">作成者: {recipe.author}</p>
        <p className="text-xs text-gray-500 mb-4">{recipe.description}</p>

        <div className="space-y-2">
          {recipe.details.map((detail, i) => (
            <div key={i} className={`${detail.color} p-3 rounded-lg`}>
              <p className="text-xs font-bold">{detail.label}</p>
              <ul className="mt-1 space-y-1">
                {detail.items.map((item, j) => (
                  <li key={j} className="text-sm font-medium text-gray-800 list-disc list-inside">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <Heart className="text-purple-400 fill-current" size={16} />
            <span className="text-sm font-semibold text-purple-600">{recipe.likes_count}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Copy className="text-blue-400" size={16} />
            <span className="text-sm font-semibold text-blue-600">{recipe.copies_count}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// おすすめレシピローディング状態
function RecommendedRecipeLoadingState() {
  return (
    <div className="space-y-4">
      {[1, 2].map((i) => (
        <div key={i} className="flex rounded-2xl overflow-hidden border-2 border-transparent shadow-md">
          <PunchHoleSidebar />
          <div className="flex-1 bg-white p-4">
            <div className="h-6 w-3/4 bg-gray-200 rounded animate-pulse mb-2" />
            <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse mb-2" />
            <div className="h-4 w-full bg-gray-200 rounded animate-pulse mb-4" />
            
            <div className="space-y-2">
              <div className="bg-gray-100 p-3 rounded-lg">
                <div className="h-3 w-12 bg-gray-200 rounded animate-pulse mb-2" />
                <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// おすすめレシピエラー状態
interface RecommendedRecipeErrorStateProps {
  error: string;
}

function RecommendedRecipeErrorState({ error }: RecommendedRecipeErrorStateProps) {
  return (
    <div className="text-center py-8 bg-red-50 rounded-2xl border border-red-200">
      <div className="w-12 h-12 mx-auto mb-3 bg-red-100 rounded-full flex items-center justify-center">
        <AlertTriangle size={24} className="text-red-500" />
      </div>
      <h3 className="text-sm font-semibold text-gray-900 mb-1">
        おすすめレシピの読み込みに失敗しました
      </h3>
      <p className="text-xs text-gray-600">{error}</p>
    </div>
  );
}

// 適用中レシピ空状態
function EmptyActiveRecipeState() {
  return (
    <div className="text-center py-8 bg-gray-50 rounded-2xl border border-gray-200">
      <div className="w-12 h-12 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
        <span className="text-xl">📝</span>
      </div>
      <h3 className="text-sm font-semibold text-gray-900 mb-1">
        利用中のレシピがありません
      </h3>
      <p className="text-xs text-gray-600">
        現在適用中のレシピがありません。下記のおすすめレシピから選んでみましょう。
      </p>
    </div>
  );
}

// おすすめレシピ空状態
function EmptyRecommendedRecipeState() {
  return (
    <div className="text-center py-8 bg-blue-50 rounded-2xl border border-blue-200">
      <div className="w-12 h-12 mx-auto mb-3 bg-blue-100 rounded-full flex items-center justify-center">
        <span className="text-xl">💡</span>
      </div>
      <h3 className="text-sm font-semibold text-gray-900 mb-1">
        おすすめレシピがありません
      </h3>
      <p className="text-xs text-gray-600">
        現在おすすめできるレシピがありません。しばらくしてからもう一度お試しください。
      </p>
    </div>
  );
}
