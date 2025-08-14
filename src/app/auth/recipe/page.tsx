"use client"

import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Cherry_Bomb_One } from "next/font/google"
import SpeechBubble from "@/components/speech-bubble"
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

export default function RecipePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const nickname = searchParams.get("name") || "君"

  const btnBase = "w-[80%] mx-auto block h-14 rounded-full text-lg font-normal transition-all duration-200"
  const btnEnabled = "bg-[#B547EB] hover:bg-[#B547EB]/90 text-white shadow-[0_10px_24px_rgba(181,71,235,0.35)]"

  const handleNext = () => {
    const params = new URLSearchParams()
    if (nickname && nickname !== "君") {
      params.set("name", nickname)
    }
    const to = params.toString() ? `/auth/recommendations?${params.toString()}` : "/auth/recommendations"
    router.push(to)
  }

  return (
    <div className="min-h-screen px-3 py-8">
      <div className="text-center mb-6">
        <h1 className={`${cherry.className} text-3xl sm:text-4xl text-gray-800 tracking-wider`}>たなブタレシピ</h1>
      </div>

      <div className="flex items-start gap-4 mb-8 px-3">
        <div className="relative">
          <Image src="/images/mascot/pig-analyzing.png" alt="レシピブタ" width={96} height={96} className="shrink-0" />
        </div>
        <SpeechBubble className="flex-1">
          <p className="text-sm font-semibold text-gray-800">つぎにおすすめのたなブタレシピを紹介するブヒ！！</p>
        </SpeechBubble>
      </div>

      <div className="text-center mb-4">
        <h2 className={`${cherry.className} text-gray-800 tracking-wider`}>
          <span className="text-2xl" style={{ fontSize: "180%" }}>
            たなブタレシピ
          </span>
          <span className="text-lg" style={{ fontSize: "120%" }}>
            とは...
          </span>
        </h2>
      </div>

      <div className="text-center mb-8 px-3">
        <p className="text-sm text-black leading-relaxed">
          あなたのお金の使い方や貯め方を
          <br />
          サポートする"お金のルールセット"です
        </p>
      </div>

      <div className="flex rounded-2xl overflow-hidden shadow-lg mb-6 border-2 border-[#D6D5D5]">
        <PunchHoleSidebar />
        <div className="flex-1 bg-white p-2">
          <div className="mb-2 mt-1">{/* Placeholder for future content */}</div>

          <div className="mb-1 mt-1">{/* Placeholder for future content */}</div>

          <div className="mb-2 mt-1">
            <h3 className="font-bold text-lg text-gray-800 ml-2">レシピ名称</h3>
          </div>

          <div className="mb-1 mt-1">
            <p className="text-xs text-gray-500 mb-1 ml-2">あなたにおすすめの理由</p>
            <div className="flex justify-end mb-1">
              <Button className="bg-[#B547EB] hover:bg-[#B547EB]/90 text-white text-xs px-4 py-1 h-auto rounded-full scale-80">
                ルールセット
              </Button>
            </div>
          </div>

          <div className="border-2 border-dashed border-purple-400 rounded-lg p-1 mb-2">
            <div className="space-y-1">
              <div className="bg-purple-100 text-purple-800 p-2 rounded-lg">
                <div className="flex items-center">
                  <span className="text-xs font-bold mr-4">貯金</span>
                  <div className="flex gap-1">
                    {Array.from({ length: 15 }, (_, i) => (
                      <div key={i} className="w-2 h-2 rounded-full border border-black bg-transparent" />
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-blue-100 text-blue-800 p-2 rounded-lg">
                <div className="flex items-center">
                  <span className="text-xs font-bold mr-4">投資</span>
                  <div className="flex gap-1">
                    {Array.from({ length: 15 }, (_, i) => (
                      <div key={i} className="w-2 h-2 rounded-full border border-black bg-transparent" />
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-green-100 text-green-800 p-2 rounded-lg">
                <div className="flex items-center">
                  <span className="text-xs font-bold mr-4">節約</span>
                  <div className="flex gap-1">
                    {Array.from({ length: 15 }, (_, i) => (
                      <div key={i} className="w-2 h-2 rounded-full border border-black bg-transparent" />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 ml-2">
            <Heart className="text-purple-400 fill-current" size={18} />
            <span className="text-sm font-semibold text-purple-600">採用された数</span>
            <div className="ml-auto flex items-center gap-1">
              <User className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-500">作成ユーザー</span>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center mb-8 px-1">
        <p className="text-sm text-black leading-relaxed max-w-none">
          料理のレシピが「どう作るか」を教えてくれるように
          <br />
          「どう貯めるか・どう使うか」の習慣をデザインします
        </p>
      </div>

      <div className="w-full">
        <Button onClick={handleNext} className={`${btnBase} ${btnEnabled}`}>
          <span className={`${cherry.className} tracking-[0.06em]`}>つぎへ</span>
        </Button>
      </div>
    </div>
  )
}
