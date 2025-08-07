"use client"

import { useState } from "react"
import { CreditCard, ChevronDown } from "lucide-react"

const transactions = [
  { icon: "💧", category: "港南水道局", amount: -3306, date: "2025/07/23" },
  { icon: "🛒", category: "ちけっとクロス", amount: -20000, date: "2025/07/25", tag: "たなぼた ¥2,000" },
  { icon: "🍔", category: "渋谷ドーム売店", amount: -2000, date: "2025/07/12", tag: "たなぼた ¥200" },
  { icon: "🍟", category: "マックフルバーガー", amount: -3306, date: "2025/07/14" },
  { icon: "💸", category: "給与振り込み", amount: 200000, date: "2025/07/15", tag: "たなぼた ¥20,000" },
]

export default function WalletPage() {
  const [activeTab, setActiveTab] = useState("card")

  return (
    <div className="space-y-6">
      <section className="text-center">
        <p className="text-sm text-[#6B7280]">メインウォレット合計</p>
        <p className="text-4xl font-bold text-[#1F2937]">¥2,000,000</p>
      </section>

      <div className="flex bg-purple-200/50 rounded-full p-1">
        <button
          onClick={() => setActiveTab("card")}
          className={`w-1/2 py-2 rounded-full font-semibold transition-all ${activeTab === "card" ? "bg-white shadow-md text-purple-700" : "text-gray-500"}`}
        >
          デビットカード
        </button>
        <button
          onClick={() => setActiveTab("details")}
          className={`w-1/2 py-2 rounded-full font-semibold transition-all ${activeTab === "details" ? "bg-white shadow-md text-purple-700" : "text-gray-500"}`}
        >
          つうちょう
        </button>
      </div>

      {activeTab === "card" ? <CardView /> : <DetailsView />}
    </div>
  )
}

const CardView = () => (
  <div className="space-y-6">
    <div className="relative p-6 bg-gradient-to-br from-purple-400/50 to-fuchsia-400/30 backdrop-blur-xl rounded-3xl border border-white/40 shadow-xl overflow-hidden">
      <div className="absolute top-0 left-0 w-48 h-48 bg-purple-300/50 rounded-full -translate-x-1/4 -translate-y-1/4 blur-2xl"></div>
      <div className="absolute bottom-0 right-0 w-48 h-48 bg-fuchsia-300/50 rounded-full translate-x-1/4 translate-y-1/4 blur-2xl"></div>
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-8">
          <h2 className="text-xl font-bold text-white">TANABOTA CARD</h2>
          <CreditCard size={24} className="text-white/80" />
        </div>
        <p className="font-mono text-2xl tracking-widest text-white mb-6">4111 1111 1111 1111</p>
        <div className="flex justify-between items-end">
          <p className="font-medium text-white">MIKI TANAKA</p>
          <p className="text-sm text-white/80">Tech 0</p>
        </div>
      </div>
    </div>
    <div>
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-bold text-lg">支出</h3>
        <button className="flex items-center gap-1 text-sm font-semibold text-purple-700">
          2025年6月 <ChevronDown size={16} />
        </button>
      </div>
      <div className="space-y-3">
        {["生活費", "推しかつ", "変動費"].map((item) => (
          <div
            key={item}
            className="flex items-center justify-between p-4 bg-white/50 backdrop-blur-sm rounded-2xl border border-white/30 shadow-md"
          >
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-100 text-xl">💳</div>
              <p className="font-semibold">{item}</p>
            </div>
            <p className="font-semibold">¥500,000</p>
          </div>
        ))}
      </div>
    </div>
  </div>
)

const DetailsView = () => (
  <section>
    <h2 className="text-xl font-bold mb-4">明細</h2>
    <div className="space-y-3">
      {transactions.map((tx, index) => (
        <div
          key={index}
          className="flex items-center justify-between p-4 bg-white/50 backdrop-blur-sm rounded-2xl border border-white/30 shadow-md"
        >
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-100 text-xl">
              {tx.icon}
            </div>
            <div>
              <p className="font-semibold">{tx.category}</p>
              <p className="text-xs text-[#6B7280]">{tx.date}</p>
            </div>
          </div>
          <div className="text-right">
            <p className={`font-semibold ${tx.amount > 0 ? "text-green-600" : "text-[#1F2937]"}`}>
              {tx.amount > 0 ? "+" : ""}¥{tx.amount.toLocaleString()}
            </p>
            {tx.tag && (
              <p className="text-xs bg-purple-200 text-purple-800 font-semibold px-2 py-0.5 rounded-full mt-1 inline-block">
                {tx.tag}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  </section>
)
