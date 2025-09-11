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

const BUDGET_OPTIONS = [
  "0～2,999円",
  "3,000～4,999円",
  "5,000～9,999円",
  "10,000～20,000円",
  "20,000～50,000円",
  "50,000円以上",
]

export default function BudgetPage() {
  const router = useRouter()
  const params = useSearchParams()
  const nickname = useMemo(() => decodeURIComponent(params.get("name") || ""), [params])
  const [selected, setSelected] = useState<string>("")

  const select = (option: string) => {
    setSelected(option)
  }

  const canNext = selected !== ""

  const wide = "w-[84%] sm:w-[80%]"
  const btnBase = `${wide} mx-auto block h-14 rounded-full text-lg font-normal transition-all duration-200`
  const btnEnabled = "bg-[#B547EB] hover:bg-[#B547EB]/90 text-white shadow-[0_10px_24px_rgba(181,71,235,0.35)]"
  const btnDisabled =
    "bg-gradient-to-b from-[#ffffff] to-[#e1e0e2] text-white shadow-[0_8px_24px_rgba(0,0,0,0.12)] ring-1 ring-black/5"

  return (
    <div className="flex flex-col items-center">
      <div className={`${wide} mx-auto mt-8`}>
        <div className="h-1.5 rounded-full bg-gradient-to-r from-[#e6ccff]/70 via-white/60 to-white/40 relative overflow-hidden">
          <div className="absolute left-0 top-0 h-full w-[60%] bg-[#B547EB] rounded-full" />
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
              <p className="text-sm font-semibold text-gray-800">月に自由に使えるお金はいくらブヒ？</p>
            </SpeechBubble>
          </div>
        </div>

        <div className={`${wide} mx-auto space-y-3`}>
          {BUDGET_OPTIONS.map((option) => {
            const active = selected === option
            return (
              <button
                key={option}
                type="button"
                aria-pressed={active}
                onClick={() => select(option)}
                className={[
                  "w-full h-12 rounded-lg shadow-lg text-base font-medium transition-all",
                  "border border-black/10 bg-white text-gray-800",
                  "hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400",
                  "flex items-center justify-center",
                  active ? "bg-purple-100 text-purple-900 ring-2 ring-purple-400" : "",
                ].join(" ")}
              >
                {option}
              </button>
            )
          })}
        </div>

        <div className="w-full mt-12">
          <Button
            disabled={!canNext}
            onClick={() => {
              savePref("月の推し活予算", [selected])
              const to = nickname ? `/auth/preparation?name=${encodeURIComponent(nickname)}` : "/auth/preparation"
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
