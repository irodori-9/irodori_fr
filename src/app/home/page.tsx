import { Heart, Mic } from "lucide-react"
import Image from "next/image"
import { Cherry_Bomb_One } from "next/font/google"

const cherryBombOne = Cherry_Bomb_One({ subsets: ["latin"], weight: "400", display: "swap" })

const summaryData = [
  { label: "貯金した額", value: "¥500,000" },
  { label: "投資した額", value: "¥1,000,000" },
  { label: "節約した額", value: "¥500,000" },
  { label: "いいね(今週)", value: "112", icon: Heart },
]

export default function HomePage() {
  return (
    <div className="space-y-6">
      {/* Chatbot Card */}
      <div className="p-4 bg-purple-200/60 rounded-3xl shadow-lg">
        <div className="flex items-center gap-2">
          <div className="flex-shrink-0">
            <Image src="/piggy-bank.png" alt="Piggy bank character" width={80} height={80} />
          </div>
          <div className="relative flex-1">
            <div className="bg-white text-gray-800 p-4 rounded-xl shadow-sm">
              <p className="font-bold text-sm leading-relaxed">今日もお仕事お疲れ様プイ！</p>
              <p className="text-sm leading-relaxed">ちょっと待つブヒ！今月の予算を超えそうブヒよ〜。一度立ち止まって考えてみるブヒ！</p>
            </div>
            {/* Speech bubble tail */}
            <div className="absolute top-1/2 -left-2 -translate-y-1/2 w-0 h-0 border-t-8 border-t-transparent border-r-8 border-r-white border-b-8 border-b-transparent" />
          </div>
        </div>
        <button className="mt-4 w-full py-3 bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg hover:opacity-90 transition-opacity">
          <Mic size={20} />
          はなす
        </button>
      </div>

      {/* Monthly Summary */}
      <div>
        <h2 className={`font-bold text-2xl mb-3 text-center text-gray-700 ${cherryBombOne.className}`}>マンスリーサマリー</h2>
        <div className="grid grid-cols-2 gap-4">
          {summaryData.map((item, index) => (
            <div key={index} className="p-4 bg-purple-100/70 rounded-2xl text-center shadow-sm">
              <p className="text-sm text-purple-800/80 font-medium">{item.label}</p>
              <div className="flex items-center justify-center gap-1 mt-1">
                {item.icon && <item.icon className="text-red-500 fill-current" size={20} />}
                <p className="text-xl font-bold text-purple-900">{item.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
