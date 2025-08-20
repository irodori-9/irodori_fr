"use client";

import { useState } from "react";
import { ChevronRight, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNews } from "@/hooks/useNews";
import { NEWS_CATEGORIES, getCategoryConfig, getDefaultCategory } from "@/config/news";
import { NewsItem, NewsCategoryConfig } from "@/types/news";

export default function NewsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>(getDefaultCategory());
  const { loading, error, getNewsByCategory } = useNews();

  const currentNews = getNewsByCategory(selectedCategory);
  const selectedCategoryConfig = getCategoryConfig(selectedCategory);

  if (loading) {
    return <NewsLoadingState />;
  }

  if (error) {
    return <NewsErrorState error={error} />;
  }

  return (
    <div className="space-y-6">
      {/* カテゴリタブ */}
      <div className="flex items-center justify-center gap-3">
        {NEWS_CATEGORIES.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`px-6 py-2 rounded-full font-semibold transition-all ${
              selectedCategory === category.id
                ? "bg-green-400 text-white shadow-md transform scale-105"
                : "bg-white/80 text-gray-600 hover:bg-white/90 hover:scale-102"
            }`}
            aria-label={`${category.label}のニュースを表示`}
            role="tab"
            aria-selected={selectedCategory === category.id}
          >
            {category.label}
          </button>
        ))}
      </div>

      {/* ニュース一覧 */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedCategory}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="space-y-4"
        >
          {currentNews.length > 0 ? (
            currentNews.map((item, index) => (
              <NewsCard
                key={`${selectedCategory}-${index}`}
                item={item}
                categoryConfig={selectedCategoryConfig!}
                index={index}
              />
            ))
          ) : (
            <EmptyState category={selectedCategoryConfig?.label || selectedCategory} />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ニュースカードコンポーネント
interface NewsCardProps {
  item: NewsItem;
  categoryConfig: NewsCategoryConfig;
  index: number;
}

function NewsCard({ item, categoryConfig, index }: NewsCardProps) {
  const handleCardClick = () => {
    window.open(item.url, "_blank", "noopener,noreferrer");
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2, delay: index * 0.05 }}
      className="p-4 bg-white/50 backdrop-blur-sm rounded-2xl border border-white/30 shadow-md hover:shadow-lg hover:bg-white/60 transition-all duration-200 cursor-pointer group"
      onClick={handleCardClick}
      role="article"
      aria-label={`${item.title}の記事を開く`}
    >
      <div className="flex gap-4">
        <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition-colors">
          <categoryConfig.icon size={32} className="text-gray-400 group-hover:text-gray-500" />
        </div>
        <div className="flex-1">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${categoryConfig.colorClass}`}>
            {categoryConfig.label}
          </span>
          <h3 className="font-bold mt-1 text-gray-900 line-clamp-2 group-hover:text-gray-800">
            {item.title}
          </h3>
          <p className="text-xs text-gray-600 mt-1 leading-relaxed line-clamp-3">
            {item.details}
          </p>
        </div>
      </div>
      <div className="text-right mt-2">
        <div className="text-sm font-bold text-purple-700 flex items-center justify-end gap-1 group-hover:text-purple-800 group-hover:gap-2 transition-all duration-200">
          開く <ChevronRight size={16} className="transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </motion.div>
  );
}

// ローディング状態コンポーネント
function NewsLoadingState() {
  return (
    <div className="space-y-6">
      {/* カテゴリタブスケルトン */}
      <div className="flex items-center justify-center gap-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-10 w-20 bg-gray-200 rounded-full animate-pulse" />
        ))}
      </div>
      
      {/* ニュースカードスケルトン */}
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="p-4 bg-white/50 rounded-2xl border border-white/30">
            <div className="flex gap-4">
              <div className="w-16 h-16 bg-gray-200 rounded-lg animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse" />
                <div className="h-3 w-full bg-gray-200 rounded animate-pulse" />
                <div className="h-3 w-2/3 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// エラー状態コンポーネント
interface NewsErrorStateProps {
  error: string;
}

function NewsErrorState({ error }: NewsErrorStateProps) {
  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="text-center py-12">
      <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
        <AlertTriangle size={32} className="text-red-500" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        ニュースの読み込みに失敗しました
      </h3>
      <p className="text-sm text-gray-600 mb-6">{error}</p>
      <button
        onClick={handleRetry}
        className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
      >
        再試行
      </button>
    </div>
  );
}

// 空状態コンポーネント
interface EmptyStateProps {
  category: string;
}

function EmptyState({ category }: EmptyStateProps) {
  return (
    <div className="text-center py-12">
      <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
        <span className="text-2xl">📰</span>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {category}のニュースがありません
      </h3>
      <p className="text-sm text-gray-600">
        現在表示できるニュースがありません。しばらくしてからもう一度お試しください。
      </p>
    </div>
  );
}