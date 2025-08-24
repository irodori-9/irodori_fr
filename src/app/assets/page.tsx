"use client"
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts"
import { ChevronRight } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Cherry_Bomb_One } from "next/font/google"
import { useEffect, useMemo, useState } from "react"
import { useAuth } from "@/contexts/AuthContext"

const cherryBombOne = Cherry_Bomb_One({ subsets: ["latin"], weight: "400", display: "swap" })

const chartData = [
  { name: "投資BOX", value: 1000000, color: "#a855f7" },
  { name: "貯金BOX", value: 500000, color: "#d8b4fe" },
  { name: "メインウォレット", value: 500000, color: "#f3e8ff" },
]

const assetAccounts = [
  { icon: "WALLET", name: "メインウォレット", amount: "¥500,000" },
  { icon: "PIGGY", name: "貯金BOX", amount: "¥500,000" },
  { icon: "SEEDLING", name: "投資BOX", amount: "¥1,000,000" },
]

const getIcon = (icon: string) => {
  switch (icon) {
    case "WALLET":
      return "💳"
    case "PIGGY":
      return "🐖"
    case "SEEDLING":
      return "🌱"
    default:
      return "💰"
  }
}

// たなぼた履歴の型
type TanabotaTx = {
  id: number
  user_id: number
  amount_paid: number
  tanabota_total: number
  created_at: string
}

export default function AssetsPage() {
  const { user } = useAuth()
  const userId = useMemo(() => {
    if (user?.id) return user.id
    if (typeof window !== "undefined") {
      const stored = window.localStorage.getItem("registered_user_id")
      if (stored) return parseInt(stored, 10)
    }
    return undefined
  }, [user])

  const [tx, setTx] = useState<TanabotaTx | null>(null)

  useEffect(() => {
    const fetchTx = async () => {
      try {
        const base = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000"
        if (!userId) return
        const res = await fetch(`${base}/pos/transactions?user_id=${userId}&limit=1`)
        if (!res.ok) return
        const list: TanabotaTx[] = await res.json()
        setTx(list?.[0] ?? null)
      } catch {}
    }
    fetchTx()
  }, [userId])

  // 表示用フォーマット
  const dateLabel = useMemo(() => {
    if (!tx?.created_at) return ""
    try {
      const d = new Date(tx.created_at)
      const yyyy = d.getFullYear()
      const mm = String(d.getMonth() + 1).padStart(2, "0")
      const dd = String(d.getDate()).padStart(2, "0")
      return `${yyyy}/${mm}/${dd}`
    } catch {
      return tx.created_at
    }
  }, [tx])

  const historyAmount = tx ? `+ ¥${Number(tx.tanabota_total).toLocaleString()}` : "+ ¥0"

  return (
    <Dialog>
      <div className="space-y-6">
        <section className="text-center">
          <p className="text-sm text-[#6B7280]">資産合計</p>
          <p className="text-4xl font-bold text-[#1F2937]">¥2,000,000</p>
        </section>

        <section className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                cornerRadius={10}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => `¥${value.toLocaleString()}`} />
            </PieChart>
          </ResponsiveContainer>
        </section>

        <section>
          <ul className="space-y-3">
            {assetAccounts.map((account, index) => {
              const content = (
                <div className="w-full flex items-center justify-between p-3 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-12 h-12 bg-purple-100/70 rounded-full text-2xl">
                      {getIcon(account.icon)}
                    </div>
                    <p className="font-semibold text-base text-gray-800">{account.name}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <p className="font-semibold text-base text-gray-800 tracking-tight">{account.amount}</p>
                    <ChevronRight size={20} className="text-gray-400" />
                  </div>
                </div>
              )

              if (account.name === "メインウォレット") {
                return (
                  <li key={index}>
                    <Link href="/wallet">{content}</Link>
                  </li>
                )
              }
              if (account.name === "投資BOX") {
                return (
                  <li key={index}>
                    <DialogTrigger asChild>
                      <button className="w-full text-left">{content}</button>
                    </DialogTrigger>
                  </li>
                )
              }
              return (
                <li key={index}>
                  <div className="cursor-not-allowed">{content}</div>
                </li>
              )
            })}
          </ul>
        </section>

        <section>
          <h2 className="font-bold text-lg mb-2">たなぼた履歴</h2>
          <div className="p-4 bg-purple-100/80 rounded-2xl text-center">
            {tx ? (
              <>
                <p className="text-xs text-gray-500">{dateLabel || ""}</p>
                <p className="font-medium text-gray-700">TANABOTA機能体験</p>
                <p className="text-3xl font-bold text-green-600 mt-1">{historyAmount}</p>
                <p className="text-sm text-purple-700 font-semibold mt-1">貯金口座に追加</p>
              </>
            ) : (
              <p className="text-sm text-gray-600 py-2">取引履歴なし</p>
            )}
          </div>
        </section>
      </div>

      <DialogContent className="max-w-xs sm:max-w-sm rounded-3xl p-8 text-center">
        <div className="flex flex-col items-center gap-4">
          <h2 className="text-lg font-bold text-gray-800">たなぶた証券のサイトに遷移します</h2>
          <Image src="/images/mascot/piggy-bank-walking.png" alt="Walking piggy bank" width={150} height={150} className="my-4" unoptimized />
          <Button className={`w-full bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white font-bold rounded-2xl py-6 text-lg shadow-lg hover:opacity-90 transition-opacity ${cherryBombOne.className}`}>
            つづける
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
