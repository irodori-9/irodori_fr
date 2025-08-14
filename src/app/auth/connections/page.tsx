"use client"

import { useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Cherry_Bomb_One } from "next/font/google"
import SpeechBubble from "@/components/speech-bubble"

const cherry = Cherry_Bomb_One({ weight: "400", subsets: ["latin"], display: "swap" })

const CARD_OPTIONS = ["三友カード", "サゾンカード"]

const BANK_OPTIONS = ["三菱友好銀行", "三友銀行"]

export default function ConnectionsPage() {
  const router = useRouter()
  const params = useSearchParams()
  const nickname = useMemo(() => decodeURIComponent(params.get("name") || ""), [params])
  const [selectedCard, setSelectedCard] = useState<string>("")
  const [selectedBank, setSelectedBank] = useState<string>("")

  const canNext = selectedCard !== "" && selectedBank !== ""

  const wide = "w-[97%] sm:w-[94%]"
  const btnBase = `${wide} mx-auto block h-14 rounded-full text-lg font-normal transition-all duration-200`
  const btnEnabled = "bg-[#B547EB] hover:bg-[#B547EB]/90 text-white shadow-[0_10px_24px_rgba(181,71,235,0.35)]"
  const btnDisabled =
    "bg-gradient-to-b from-[#ffffff] to-[#e1e0e2] text-white shadow-[0_8px_24px_rgba(0,0,0,0.12)] ring-1 ring-black/5"

  return (
    <div className="flex flex-col items-center">
      <div className={`${wide} mx-auto mt-8`}>
        <div className="h-1.5 rounded-full bg-gradient-to-r from-[#e6ccff]/70 via-white/60 to-white/40 relative overflow-hidden">
          <div className="absolute left-0 top-0 h-full w-full bg-[#B547EB] rounded-full" />
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
              <p className="text-sm font-semibold text-gray-800">いま支払いに使っているカードと銀行を教えてブヒ！</p>
            </SpeechBubble>
          </div>
        </div>

        <div className={`${wide} mx-auto space-y-3`}>
          {CARD_OPTIONS.map((option) => {
            const active = selectedCard === option
            return (
              <button
                key={option}
                type="button"
                aria-pressed={active}
                onClick={() => setSelectedCard(option)}
                className={[
                  "w-full py-4 px-6 rounded-xl shadow-lg text-left font-medium transition-all",
                  "border border-black/10 bg-white text-gray-800 flex items-center justify-between",
                  "hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400",
                  active ? "bg-purple-100 text-purple-900 ring-2 ring-purple-400" : "",
                ].join(" ")}
              >
                <span className="text-base font-semibold">{option}</span>
                <span className="text-sm text-purple-600 font-medium">連携</span>
              </button>
            )
          })}

          {BANK_OPTIONS.map((option) => {
            const active = selectedBank === option
            return (
              <button
                key={option}
                type="button"
                aria-pressed={active}
                onClick={() => setSelectedBank(option)}
                className={[
                  "w-full py-4 px-6 rounded-xl shadow-lg text-left font-medium transition-all",
                  "border border-black/10 bg-white text-gray-800 flex items-center justify-between",
                  "hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400",
                  active ? "bg-purple-100 text-purple-900 ring-2 ring-purple-400" : "",
                ].join(" ")}
              >
                <span className="text-base font-semibold">{option}</span>
                <span className="text-sm text-purple-600 font-medium">連携</span>
              </button>
            )
          })}
        </div>

        <div className="w-full mt-12">
          <Button
            disabled={!canNext}
            onClick={() => {
              const to = nickname ? `/auth/analyzing?name=${encodeURIComponent(nickname)}` : "/auth/analyzing"
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
