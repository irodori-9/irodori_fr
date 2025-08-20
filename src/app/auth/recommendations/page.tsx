"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Cherry_Bomb_One } from "next/font/google"
import { Heart, User } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"

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
  const { login } = useAuth()
  const [selectedRecipe, setSelectedRecipe] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [recipes, setRecipes] = useState<
    {
      templateId: number
      title: string
      description: string
      categories: { type: string; items: string[]; color: string }[]
      adoptionCount: number
      creator: string
    }[]
  >([])

  useEffect(() => {
    const load = async () => {
      try {
        const base = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000"
        const uid = typeof window !== "undefined" ? localStorage.getItem("registered_user_id") : null
        if (!uid) return
        const res = await fetch(`${base}/onboarding/recommended_recipes?user_id=${encodeURIComponent(uid)}`, {
          credentials: "include",
        })
        if (!res.ok) return
        const data = await res.json()
        if (!Array.isArray(data)) return

        const categoryStyleMap: Record<string, { type: string; color: string }> = {
          INCREASE_SAVINGS: { type: "貯金", color: "bg-purple-100 text-purple-800" },
          REDUCE_EXPENSES: { type: "節約", color: "bg-green-100 text-green-800" },
          ASSET_MANAGEMENT: { type: "投資", color: "bg-blue-100 text-blue-800" },
          貯金: { type: "貯金", color: "bg-purple-100 text-purple-800" },
          節約: { type: "節約", color: "bg-green-100 text-green-800" },
          投資: { type: "投資", color: "bg-blue-100 text-blue-800" },
        }

        const mapped = data.map((item: any) => {
          const groups: Record<string, { type: string; items: string[]; color: string }> = {}
          const rules: any[] = Array.isArray(item?.rules) ? item.rules : []
          for (const rule of rules) {
            const catKey = String(rule?.category || "OTHER")
            const style = categoryStyleMap[catKey] || { type: "その他", color: "bg-gray-100 text-gray-800" }
            if (!groups[style.type]) groups[style.type] = { type: style.type, items: [], color: style.color }
            const ruleName = typeof rule?.name === "string" && rule.name ? rule.name : "ルール"
            groups[style.type].items.push(ruleName)
          }

          const templateId = Number(item?.id || 0)
          const title = typeof item?.name === "string" ? item.name : "おすすめレシピ"
          const description = typeof item?.description === "string" ? item.description : ""
          const adoptionCount = Number(item?.likes_count || 0)
          const creator = (
            ((item?.user?.nickname as string) ?? [item?.user?.last_name, item?.user?.first_name].filter(Boolean).join(" ")) ||
            "ユーザー"
          )

          return {
            templateId,
            title,
            description,
            categories: Object.values(groups),
            adoptionCount,
            creator,
          }
        })

        setRecipes(mapped)
      } catch {
        // noop
      }
    }
    load()
  }, [])

  const btnBase = "w-[80%] mx-auto block h-14 rounded-full text-lg font-normal transition-all duration-200"
  const btnEnabled = "bg-[#B547EB] hover:bg-[#B547EB]/90 text-white shadow-[0_10px_24px_rgba(181,71,235,0.35)]"
  const btnDisabled =
    "bg-gradient-to-b from-[#ffffff] to-[#e1e0e2] text-white shadow-[0_8px_24px_rgba(0,0,0,0.12)] ring-1 ring-black/5"

  const handleNext = async () => {
    if (selectedRecipe === null) return
    try {
      setSubmitting(true)
      const base = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000"
      const uid = typeof window !== "undefined" ? localStorage.getItem("registered_user_id") : null
      if (!uid) return
      const chosen = recipes[selectedRecipe]
      if (!chosen || !chosen.templateId) return
      const res = await fetch(`${base}/onboarding/recipe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ user_id: Number(uid), template_id: Number(chosen.templateId) }),
      })
      if (!res.ok) throw new Error("レシピの作成に失敗しました")
      
      // オンボーディング完了時にAuthContextに認証情報をセット
      if (uid) {
        login({
          id: Number(uid),
          isAuthenticated: true,
        })
      }
      
      router.push("/home")
    } catch (e) {
      // noop
    } finally {
      setSubmitting(false)
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
          disabled={selectedRecipe === null || submitting}
          className={`${btnBase} ${selectedRecipe !== null && !submitting ? btnEnabled : btnDisabled}`}
        >
          <span className={`${cherry.className} tracking-[0.06em]`}>つぎへ</span>
        </Button>
      </div>
    </div>
  )
}
