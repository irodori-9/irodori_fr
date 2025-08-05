"use client"
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts"
import { ChevronRight } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/Button"
import { Cherry_Bomb_One } from "next/font/google"

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

export default function AssetsPage() {
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
            <p className="text-xs text-gray-500">2025/07/01</p>
            <p className="font-medium text-gray-700">チケットクロス</p>
            <p className="text-3xl font-bold text-green-600 mt-1">+ ¥2,000</p>
            <p className="text-sm text-purple-700 font-semibold mt-1">貯金口座に追加</p>
          </div>
        </section>
      </div>

      <DialogContent className="max-w-xs sm:max-w-sm rounded-3xl p-8 text-center">
        <div className="flex flex-col items-center gap-4">
          <h2 className="text-lg font-bold text-gray-800">たなぶた証券のサイトに遷移します</h2>
          <Image src="/piggy-bank-walking.png" alt="Walking piggy bank" width={150} height={150} className="my-4" />
          <Button className={`w-full bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white font-bold rounded-2xl py-6 text-lg shadow-lg hover:opacity-90 transition-opacity ${cherryBombOne.className}`}>
            つづける
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
