// ニュース機能の設定ファイル
// 新カテゴリ追加時はこのファイルのみ修正すれば自動対応

import { Tv, Music, Coffee, Gamepad2, Film, Sparkles } from "lucide-react";
import { NewsCategoryConfig } from "@/types/news";

export const NEWS_CATEGORIES: NewsCategoryConfig[] = [
  {
    id: "anime",
    label: "アニメ",
    icon: Tv,
    colorClass: "bg-purple-200 text-purple-800"
  },
  {
    id: "K-POP",
    label: "K-POP",
    icon: Music,
    colorClass: "bg-green-200 text-green-800"
  },
  {
    id: "VTuber",
    label: "VTuber",
    icon: Coffee,
    colorClass: "bg-blue-200 text-blue-800"
  }
  // 新カテゴリ追加例:
  // {
  //   id: "gaming",
  //   label: "ゲーム",
  //   icon: Gamepad2,
  //   colorClass: "bg-orange-200 text-orange-800"
  // },
  // {
  //   id: "movie",
  //   label: "映画",
  //   icon: Film,
  //   colorClass: "bg-pink-200 text-pink-800"
  // },
  // {
  //   id: "idol",
  //   label: "アイドル",
  //   icon: Sparkles,
  //   colorClass: "bg-indigo-200 text-indigo-800"
  // }
];

export const CSV_FILE_PATH = "public/news.csv";

// 有効なカテゴリIDを動的に取得
export const getValidCategories = (): string[] => {
  return NEWS_CATEGORIES.map(cat => cat.id);
};

// カテゴリ設定を取得
export const getCategoryConfig = (categoryId: string): NewsCategoryConfig | undefined => {
  return NEWS_CATEGORIES.find(cat => cat.id === categoryId);
};

// デフォルトカテゴリを取得
export const getDefaultCategory = (): string => {
  return NEWS_CATEGORIES[0]?.id || "";
};