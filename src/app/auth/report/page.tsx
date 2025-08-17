"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Cherry_Bomb_One } from "next/font/google"
// Fixed import to use default export instead of named export
import SpeechBubble from "@/components/speech-bubble"

const cherry = Cherry_Bomb_One({ weight: "400", subsets: ["latin"], display: "swap" })

type Category = { name: string; value: number; color: string }
type Stats = { income: number; expense: number; balance: number; totalExpense: number }

export default function ReportPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [viewType, setViewType] = useState<"monthly" | "yearly">("monthly")
  const [currentMonth] = useState("2025年7月")
  const nickname = searchParams.get("name")

  const [monthlyData, setMonthlyData] = useState<Category[]>([])
  const [monthlyStats, setMonthlyStats] = useState<Stats>({ income: 0, expense: 0, balance: 0, totalExpense: 0 })
  const [insight, setInsight] = useState<string>("推し活への熱い思いはよく伝わったブヒ！でもちょっぴり推し活に使い過ぎているブヒ！")

  useEffect(() => {
    const load = async () => {
      try {
        const base = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000"
        const uid = typeof window !== "undefined" ? localStorage.getItem("registered_user_id") : null
        const qs = uid ? `?user_id=${encodeURIComponent(uid)}` : ""
        const res = await fetch(`${base}/onboarding/financial-report${qs}`, { credentials: "include" })
        if (!res.ok) throw new Error("レポートの取得に失敗しました")
        const data = await res.json()
        // カテゴリ別支出（カード支出のみ）
        const categories: Category[] = (data?.expenses_by_category || []).map((c: any, idx: number) => ({
          name: c.category,
          value: Math.abs(c.total_amount || 0),
          color: ["#60A5FA", "#34D399", "#FBBF24", "#F472B6", "#A78BFA", "#F87171"][idx % 6],
        }))
        setMonthlyData(categories)
        // インサイト（最初の1件を吹き出しに表示）
        if (Array.isArray(data?.insights) && data.insights.length > 0 && typeof data.insights[0] === "string") {
          setInsight(data.insights[0])
        }
        // 収入/支出/収支 合計（サーバ計算値を使用）
        const income = Number(data?.income_total || 0)
        const expense = Number(data?.expense_total || 0)
        const balance = Number(data?.balance_total || income - expense)
        const totalExpense = categories.reduce((s, c) => s + c.value, 0)
        setMonthlyStats({ income, expense, balance, totalExpense })
      } catch (e) {
        // フォールバック: 空のまま
      }
    }
    load()
  }, [])

  const yearlyData = monthlyData.map((item) => ({ ...item, value: item.value * 12 }))
  const yearlyStats: Stats = {
    income: monthlyStats.income * 12,
    expense: monthlyStats.expense * 12,
    balance: monthlyStats.balance * 12,
    totalExpense: monthlyStats.totalExpense * 12,
  }

  const currentData = viewType === "monthly" ? monthlyData : yearlyData
  const currentStats = viewType === "monthly" ? monthlyStats : yearlyStats

  const formatAmount = (amount: number) => {
    return `¥ ${amount.toLocaleString()}`
  }

  const btnBase = "w-[80%] mx-auto block h-14 rounded-full text-lg font-normal transition-all duration-200"
  const btnEnabled = "bg-[#B547EB] hover:bg-[#B547EB]/90 text-white shadow-[0_10px_24px_rgba(181,71,235,0.35)]"

  return (
    <div className="min-h-screen px-6 py-8">
      <div className="text-center mb-6">
        <h1 className={`${cherry.className} text-3xl sm:text-4xl text-gray-800 tracking-wider`}>たなブタれぽーと</h1>
      </div>

      <div className="flex items-start gap-4 mb-6">
        <div className="relative">
          <Image
            src="/images/mascot/pig-analyzing.png"
            alt="レポートブタ"
            width={96}
            height={96}
            className="shrink-0"
          />
        </div>
        <SpeechBubble className="flex-1">
          <p className="text-sm font-semibold text-gray-800">{insight}</p>
        </SpeechBubble>
      </div>

      <div className="flex justify-center mb-4 px-8">
        <button
          onClick={() => setViewType("monthly")}
          className={`${cherry.className} px-6 py-2 rounded-full text-base font-medium transition-all scale-120 mr-3 ${
            viewType === "monthly" ? "bg-[#B547EB] text-white" : "bg-gray-200 text-gray-600 hover:bg-gray-300"
          }`}
        >
          つきごと
        </button>
        <button
          onClick={() => setViewType("yearly")}
          className={`${cherry.className} px-6 py-2 rounded-full text-base font-medium transition-all scale-120 ml-3 ${
            viewType === "yearly" ? "bg-[#B547EB] text-white" : "bg-gray-200 text-gray-600 hover:bg-gray-300"
          }`}
        >
          としごと
        </button>
      </div>

      <div className="flex items-center justify-center gap-4 mb-2">
        <ChevronLeft className="w-5 h-5 text-gray-400" />
        <span className="text-sm text-gray-600">{viewType === "monthly" ? "2025年7月" : "2025年"}</span>
        <ChevronRight className="w-5 h-5 text-gray-400" />
      </div>

      <div className="h-56 mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={currentData}
              cx="50%"
              cy="50%"
              innerRadius={72}
              outerRadius={96}
              paddingAngle={5}
              dataKey="value"
              cornerRadius={10}
              animationBegin={0}
              animationDuration={800}
            >
              {currentData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="text-center -mt-34">
          <p className="text-xs text-gray-500">支出</p>
          <p className="text-lg font-bold text-gray-800">{formatAmount(currentStats.totalExpense)}</p>
        </div>
      </div>

      <div className="space-y-2 mb-2">
        <div className="flex justify-between items-center pb-3">
          <span className="font-semibold text-gray-800">収支</span>
          <span className={`font-bold ${currentStats.balance < 0 ? "text-[#B547EB]" : "text-gray-800"}`}>
            {formatAmount(currentStats.balance)}
          </span>
        </div>
        <div className="border-t border-[#D9D9D9]"></div>
        <div className="flex justify-between items-center py-3">
          <span className="font-semibold text-gray-800">収入</span>
          <span className="font-bold text-gray-800">{formatAmount(currentStats.income)}</span>
        </div>
        <div className="border-t border-[#D9D9D9]"></div>
        <div className="flex justify-between items-center pt-3">
          <span className="font-semibold text-gray-800">支出</span>
          <span className="font-bold text-gray-800">{formatAmount(currentStats.expense)}</span>
        </div>
      </div>

      <div className="space-y-2 mb-8">
        {currentData.map((category, index) => (
          <div key={index}>
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-4 ml-10">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: category.color }} />
                <span className="text-sm text-gray-700">{category.name}</span>
              </div>
              <span className="font-semibold text-gray-800">{formatAmount(category.value)}</span>
            </div>
            {index < currentData.length - 1 && <div className="border-t border-[#D9D9D9] ml-10"></div>}
          </div>
        ))}
      </div>

      <div className="w-full">
        <Button
          onClick={() => {
            const url = nickname ? `/auth/recipe?name=${encodeURIComponent(nickname)}` : "/auth/recipe"
            router.push(url)
          }}
          className={`${btnBase} ${btnEnabled}`}
        >
          <span className={`${cherry.className} tracking-[0.06em]`}>つぎへ</span>
        </Button>
      </div>
    </div>
  )
}
