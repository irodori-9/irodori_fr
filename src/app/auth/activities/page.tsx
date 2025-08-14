"use client"

import { useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Cherry_Bomb_One } from "next/font/google"
import SpeechBubble from "@/components/speech-bubble"

const cherry = Cherry_Bomb_One({ weight: "400", subsets: ["latin"], display: "swap" })

const OPTIONS = [
  "グッズ購入",
  "動画視聴",
  "イベント参戦",
  "ファンクラブ",
  "ライブ参戦",
  "SNSへの投稿",
  "公式アカウントのチェック",
  "サブスク利用",
  "投げ銭",
]

export default function ActivitiesPage() {
  const router = useRouter()
  const params = useSearchParams()
  const nickname = useMemo(() => decodeURIComponent(params.get("name") || ""), [params])
  const [selected, setSelected] = useState<string[]>([])

  const toggle = (label: string) => {
    setSelected((prev) => (prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]))
  }

  const canNext = selected.length > 0

  const wide = "w-[84%] sm:w-[80%]"
  const btnBase = `${wide} mx-auto block h-14 rounded-full text-lg font-normal transition-all duration-200`
  const btnEnabled = "bg-[#B547EB] hover:bg-[#B547EB]/90 text-white shadow-[0_10px_24px_rgba(181,71,235,0.35)]"
  const btnDisabled =
    "bg-gradient-to-b from-[#ffffff] to-[#e1e0e2] text-white shadow-[0_8px_24px_rgba(0,0,0,0.12)] ring-1 ring-black/5"

  const buttonPositions = [
    { label: "グッズ購入", left: "2%", top: "2%" },
    { label: "動画視聴", left: "35%", top: "0%" },
    { label: "イベント参戦", left: "70%", top: "2%" },
    { label: "ファンクラブ", left: "15%", top: "25%" },
    { label: "ライブ参戦", left: "55%", top: "25%" },
    { label: "SNSへの投稿", left: "35%", top: "50%" },
    { label: "公式アカウントのチェック", left: "5%", top: "65%" },
    { label: "サブスク利用", left: "65%", top: "65%" },
    { label: "投げ銭", left: "35%", top: "80%" },
  ]

  return (
    <div className="flex flex-col items-center">
      <div className={`${wide} mx-auto mt-8`}>
        <div className="h-1.5 rounded-full bg-gradient-to-r from-[#e6ccff]/70 via-white/60 to-white/40 relative overflow-hidden">
          <div className="absolute left-0 top-0 h-full w-[50%] bg-[#B547EB] rounded-full" />
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
              <p className="text-sm font-semibold text-gray-800">推し活の内容はなにブヒ？</p>
            </SpeechBubble>
          </div>
        </div>

        <div className={`${wide} mx-auto`}>
          <div className="relative h-[400px] w-full">
            {buttonPositions.map(({ label, left, top }) => {
              const active = selected.includes(label)
              return (
                <button
                  key={label}
                  type="button"
                  aria-pressed={active}
                  onClick={() => toggle(label)}
                  className={[
                    "absolute w-24 h-24 rounded-full shadow-lg text-xs font-semibold transition-all",
                    "border border-black/10 bg-white text-gray-800",
                    "hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400",
                    "flex items-center justify-center text-center leading-tight",
                    active ? "bg-purple-100 text-purple-900 ring-2 ring-purple-400" : "",
                  ].join(" ")}
                  style={{ left, top }}
                >
                  <span className="px-1">{label}</span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="w-full mt-12">
          <Button
            disabled={!canNext}
            onClick={() => {
              router.push(`/auth/budget?name=${encodeURIComponent(nickname)}`)
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
