"use client"

import { useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Cherry_Bomb_One } from "next/font/google"
import SpeechBubble from "@/components/speech-bubble"

const cherry = Cherry_Bomb_One({ weight: "400", subsets: ["latin"], display: "swap" })

const GOAL_OPTIONS = [
  "推し活以外の生活費に手を出さないようにしたいブヒ",
  "旅行などの推し以外の楽しみのために貯蓄したいブヒ",
  "結婚や出産、子育てのためにお金を貯めたいブヒ",
  "お家を購入するための資金を作りたいブヒ",
  "借金を無くしたいブヒ",
  "老後の生活に苦労したくないブヒ",
  "自由記述（なんでも書いていいブヒよ〜）",
]

export default function GoalsPage() {
  const router = useRouter()
  const params = useSearchParams()
  const nickname = useMemo(() => decodeURIComponent(params.get("name") || ""), [params])
  const [selected, setSelected] = useState<string>("")
  const [freeText, setFreeText] = useState<string>("")

  const select = (option: string) => {
    setSelected(option)
    if (option !== "自由記述（なんでも書いていいブヒよ〜）") {
      setFreeText("")
    }
  }

  const canNext = selected !== "" && (selected !== "自由記述（なんでも書いていいブヒよ〜）" || freeText.trim() !== "")

  const wide = "w-[97%] sm:w-[94%]"
  const btnBase = `${wide} mx-auto block h-14 rounded-full text-lg font-normal transition-all duration-200`
  const btnEnabled = "bg-[#B547EB] hover:bg-[#B547EB]/90 text-white shadow-[0_10px_24px_rgba(181,71,235,0.35)]"
  const btnDisabled =
    "bg-gradient-to-b from-[#ffffff] to-[#e1e0e2] text-white shadow-[0_8px_24px_rgba(0,0,0,0.12)] ring-1 ring-black/5"

  return (
    <div className="flex flex-col items-center">
      <div className={`${wide} mx-auto mt-8`}>
        <div className="h-1.5 rounded-full bg-gradient-to-r from-[#e6ccff]/70 via-white/60 to-white/40 relative overflow-hidden">
          <div className="absolute left-0 top-0 h-full w-[85%] bg-[#B547EB] rounded-full" />
        </div>
      </div>

      <div className="w-full mt-2 space-y-6">
        <div className={`${wide} mx-auto mt-6`}>
          <div className="flex items-start gap-3">
            <Image
              src="/images/mascot/pig.png"
              alt="たなぼたキャラクター"
              width={96}
              height={96}
              className="shrink-0"
            />
            <SpeechBubble>
              <p className="text-sm font-semibold text-gray-800">お金の目標を設定するブヒ！</p>
            </SpeechBubble>
          </div>
        </div>

        <div className={`${wide} mx-auto space-y-3`}>
          {GOAL_OPTIONS.map((option) => {
            const active = selected === option
            return (
              <div key={option} className="space-y-2">
                <button
                  type="button"
                  aria-pressed={active}
                  onClick={() => select(option)}
                  className={[
                    "w-full py-3 px-4 rounded-xl shadow-lg text-left font-medium transition-all",
                    "border border-black/10 bg-white text-gray-800",
                    "hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400",
                    active ? "bg-purple-100 text-purple-900 ring-2 ring-purple-400" : "",
                  ].join(" ")}
                >
                  <span className="text-sm leading-relaxed">{option}</span>
                </button>
                {active && option === "自由記述（なんでも書いていいブヒよ〜）" && (
                  <Input
                    placeholder="あなたの目標を入力してください"
                    value={freeText}
                    onChange={(e) => setFreeText(e.target.value)}
                    className="w-full bg-white border-purple-200 focus:border-purple-400 focus:ring-purple-400"
                  />
                )}
              </div>
            )
          })}
        </div>

        <div className="w-full mt-12">
          <Button
            disabled={!canNext}
            onClick={() => {
              const to = nickname ? `/auth/connections?name=${encodeURIComponent(nickname)}` : "/auth/connections"
              router.push(to)
            }}
            className={`${btnBase} ${canNext ? btnEnabled : btnDisabled}`}
          >
            <span className={`${cherry.className} tracking-[0.06em]`}>つぎへ</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
