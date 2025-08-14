"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Cherry_Bomb_One } from "next/font/google"
import { Heart, User } from "lucide-react"

const cherry = Cherry_Bomb_One({ weight: "400", subsets: ["latin"], display: "swap" })

const PunchHoleSidebar = () => (
  <div className="w-16 bg-slate-100 rounded-l-2xl flex flex-col items-center justify-around py-2 border-r border-slate-200">
    {Array(5)
      .fill(0)
      .map((_, i) => (
        <div key={i} className="w-5 h-5 bg-white rounded-full ring-1 ring-slate-200/50" />
      ))}
  </div>
)

const RecipeCard = ({
  title,
  description,
  categories,
  adoptionCount,
  creator,
  isSelected,
  onClick,
}: {
  title: string
  description: string
  categories: { type: string; items: string[]; color: string }[]
  adoptionCount: number
  creator: string
  isSelected: boolean
  onClick: () => void
}) => (
  <div
    className={`flex rounded-2xl overflow-hidden shadow-lg mb-6 border-2 cursor-pointer transition-all duration-200 ${
      isSelected ? "border-[#B547EB] bg-purple-50" : "border-[#D6D5D5] hover:border-purple-300"
    }`}
    onClick={onClick}
  >
    <PunchHoleSidebar />
    <div className="flex-1 bg-white p-2">
      <div className="mb-2 mt-1">
        <h3 className="font-bold text-lg text-gray-800 ml-2">{title}</h3>
      </div>

      <div className="mb-1 mt-1">
        <p className="text-xs text-gray-500 mb-1 ml-2">{description}</p>
      </div>

      <div className="rounded-lg p-1 mb-2">
        <div className="space-y-1">
          {categories.map((category, index) => (
            <div key={index} className={`${category.color} p-2 rounded-lg`}>
              <div className="flex items-start">
                <span className="text-xs font-bold mr-4 mt-1">{category.type}</span>
                <div className="flex-1">
                  {category.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="text-xs mb-1 text-black">
                      • {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-1.5 ml-2">
        <Heart className="text-purple-400 fill-current" size={18} />
        <span className="text-sm font-semibold text-purple-600">{adoptionCount}</span>
        <div className="ml-auto flex items-center gap-1">
          <User className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-500">{creator}</span>
        </div>
      </div>
    </div>
  </div>
)

export default function RecommendationsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [selectedRecipe, setSelectedRecipe] = useState<number | null>(null)

  const recipes = [
    {
      title: "ジュースを水に変える魔法",
      description: "理由：日々の小さな浪費を見直したい人！",
      categories: [
        {
          type: "貯金",
          items: ["毎月の収入の10%を貯蓄"],
          color: "bg-purple-100 text-purple-800",
        },
        {
          type: "節約",
          items: ["毎日の「余計な習慣支出」を1日おきに減らすチャレンジ", "減らした分は自動で「目標貯金」へ移動"],
          color: "bg-green-100 text-green-800",
        },
      ],
      adoptionCount: 112,
      creator: "りじちょー",
    },
    {
      title: "ヒヨコ貯金チャレンジ",
      description: "理由：日々の小さな浪費を見直したい人！",
      categories: [
        {
          type: "貯金",
          items: [
            "月末に残った金額の10%を「おつり貯金」",
            "毎週500円ずつ自動で貯金",
            "支出の1%を自動で貯金",
            "(例：コンビニで300円→3円貯金)",
          ],
          color: "bg-purple-100 text-purple-800",
        },
        {
          type: "節約",
          items: ["お昼のランチ代を700円以内にする"],
          color: "bg-green-100 text-green-800",
        },
      ],
      adoptionCount: 200,
      creator: "はとちゃん",
    },
    {
      title: "WHY 浪費 PEOPLE！？🔥",
      description: "理由：ストイックに節約し資産形成！",
      categories: [
        {
          type: "貯金",
          items: ["推し活・好きなことに使った金額の10%を貯金"],
          color: "bg-purple-100 text-purple-800",
        },
        {
          type: "投資",
          items: ["毎月の給与から30,000円をNISAで全世界株式を購入"],
          color: "bg-blue-100 text-blue-800",
        },
        {
          type: "節約",
          items: ["お昼のランチ代を500円以内にする", "コンビニでつい買ってしまうお菓子の購入は禁止"],
          color: "bg-green-100 text-green-800",
        },
      ],
      adoptionCount: 5,
      creator: "みっつ",
    },
  ]

  const btnBase = "w-[80%] mx-auto block h-14 rounded-full text-lg font-normal transition-all duration-200"
  const btnEnabled = "bg-[#B547EB] hover:bg-[#B547EB]/90 text-white shadow-[0_10px_24px_rgba(181,71,235,0.35)]"
  const btnDisabled =
    "bg-gradient-to-b from-[#ffffff] to-[#e1e0e2] text-white shadow-[0_8px_24px_rgba(0,0,0,0.12)] ring-1 ring-black/5"

  const handleNext = () => {
    if (selectedRecipe !== null) {
      router.push("/home")
    }
  }

  return (
    <div className="min-h-screen px-3 py-8">
      <div className="text-center mb-8">
        <h1 className={`${cherry.className} text-3xl sm:text-4xl text-gray-800 tracking-wider`}>おすすめレシピ</h1>
      </div>

      <div className="space-y-4 mb-8">
        {recipes.map((recipe, index) => (
          <RecipeCard
            key={index}
            title={recipe.title}
            description={recipe.description}
            categories={recipe.categories}
            adoptionCount={recipe.adoptionCount}
            creator={recipe.creator}
            isSelected={selectedRecipe === index}
            onClick={() => setSelectedRecipe(index)}
          />
        ))}
      </div>

      <div className="w-full">
        <Button
          onClick={handleNext}
          disabled={selectedRecipe === null}
          className={`${btnBase} ${selectedRecipe !== null ? btnEnabled : btnDisabled}`}
        >
          <span className={`${cherry.className} tracking-[0.06em]`}>つぎへ</span>
        </Button>
      </div>
    </div>
  )
}
