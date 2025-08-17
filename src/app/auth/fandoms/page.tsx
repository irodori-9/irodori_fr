"use client"

import { useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Cherry_Bomb_One } from "next/font/google"
import SpeechBubble from "@/components/speech-bubble"

const cherry = Cherry_Bomb_One({ weight: "400", subsets: ["latin"], display: "swap" })

const STORAGE_KEY = "onboarding_preferences"
type Pref = { question: string; selected_answers: string[] }
const loadPrefs = (): Pref[] => {
  try {
    const s = typeof window !== "undefined" ? sessionStorage.getItem(STORAGE_KEY) : null
    return s ? JSON.parse(s) : []
  } catch {
    return []
  }
}
const savePref = (question: string, selected_answers: string[]) => {
  const prefs = loadPrefs().filter((p) => p.question !== question)
  const next = [...prefs, { question, selected_answers }]
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next))
}

const OPTIONS = [
  "キャラクター",
  "マンガ",
  "ゲーム",
  "アニメ",
  "アーティスト/バンド",
  "K-POPアイドル",
  "J-POPアイドル",
  "VTuber",
  "YouTuber",
  "スポーツ選手/チーム",
  "クリエイター/芸術家",
  "インフルエンサー",
  "海外セレブ",
  "お笑い芸人",
  "声優",
  "舞台俳優",
]

export default function FandomsPage() {
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
    { label: "キャラクター", left: "5%", top: "0%" },
    { label: "アーティスト/バンド", left: "53%", top: "5%" },
    { label: "J-POPアイドル", left: "78%", top: "0%" },
    { label: "マンガ", left: "0%", top: "18%" },
    { label: "アニメ", left: "25%", top: "15%" },
    { label: "K-POPアイドル", left: "70%", top: "20%" },
    { label: "ゲーム", left: "15%", top: "33%" },
    { label: "VTuber", left: "55%", top: "40%" },
    { label: "YouTuber", left: "80%", top: "50%" },
    { label: "クリエイター/芸術家", left: "18%", top: "55%" },
    { label: "スポーツ選手/チーム", left: "0%", top: "68%" },
    { label: "インフルエンサー", left: "58%", top: "60%" },
    { label: "お笑い芸人", left: "0%", top: "90%" },
    { label: "海外セレブ", left: "25%", top: "85%" },
    { label: "声優", left: "80%", top: "88%" },
    { label: "舞台俳優", left: "55%", top: "83%" },
  ]

  return (
    <div className="flex flex-col items-center">
      <div className={`${wide} mx-auto mt-8`}>
        <div className="h-1.5 rounded-full bg-gradient-to-r from-[#e6ccff]/70 via-white/60 to-white/40 relative overflow-hidden">
          <div className="absolute left-0 top-0 h-full w-[36%] bg-[#B547EB] rounded-full" />
        </div>
      </div>

      <div className="w-full mt-2 space-y-6">
        {/* ブタ + 吹き出し（ニックネーム入り） */}
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
              <p className="text-sm font-semibold text-gray-800">
                {nickname ? `${nickname}の推しはなにブヒ？` : "あなたの推しはなにブヒ？"}
              </p>
            </SpeechBubble>
          </div>
        </div>

        <div className={`${wide} mx-auto`}>
          <div className="relative h-[450px] w-full">
            {buttonPositions.map(({ label, left, top }) => {
              const active = selected.includes(label)
              return (
                <button
                  key={label}
                  type="button"
                  aria-pressed={active}
                  onClick={() => toggle(label)}
                  className={[
                    "absolute w-20 h-20 rounded-full shadow-lg text-xs font-semibold transition-all",
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

        {/* つぎへ（1つ以上で有効） */}
        <div className="w-full mt-12">
          <Button
            disabled={!canNext}
            onClick={() => {
              savePref("推しのジャンル", selected)
              router.push(`/auth/activities?name=${encodeURIComponent(nickname)}`)
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
