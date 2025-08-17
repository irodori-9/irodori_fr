"use client"

import { useEffect, useMemo, useState } from "react"
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

const CARD_OPTIONS_FALLBACK = ["三友カード", "サゾンカード"]
const BANK_OPTIONS_FALLBACK = ["三友銀行"]

export default function ConnectionsPage() {
  const router = useRouter()
  const params = useSearchParams()
  const nickname = useMemo(() => decodeURIComponent(params.get("name") || ""), [params])
  const [selectedCard, setSelectedCard] = useState<string>("")
  const [selectedBank, setSelectedBank] = useState<string>("")
  const [cards, setCards] = useState<string[]>(CARD_OPTIONS_FALLBACK)
  const [banks, setBanks] = useState<string[]>(BANK_OPTIONS_FALLBACK)
  const [question, setQuestion] = useState<string>("いま支払いに使っているカードと銀行を教えてブヒ！")

  useEffect(() => {
    const load = async () => {
      try {
        const base = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000"
        const res = await fetch(`${base}/onboarding/financial-providers`, { credentials: "include" })
        if (!res.ok) throw new Error("候補の取得に失敗しました")
        const data = await res.json()
        if (Array.isArray(data?.cards) && data.cards.length > 0) setCards(data.cards)
        if (Array.isArray(data?.banks) && data.banks.length > 0) setBanks(data.banks)
        if (typeof data?.question === "string" && data.question) setQuestion(data.question)
      } catch {}
    }
    load()
  }, [])

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
              <p className="text-sm font-semibold text-gray-800">{question}</p>
            </SpeechBubble>
          </div>
        </div>

        <div className={`${wide} mx-auto space-y-3`}>
          {cards.map((option) => {
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

          {banks.map((option) => {
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
            onClick={async () => {
              try {
                // 直前2問を保存
                savePref("連携カード", [selectedCard])
                savePref("連携銀行", [selectedBank])
                // 一括送信（未ログインでも user_id を付与して保存可能に）
                const base = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000"
                const payload = loadPrefs()
                const uid = typeof window !== "undefined" ? localStorage.getItem("registered_user_id") : null
                const qs = uid ? `?user_id=${encodeURIComponent(uid)}` : ""
                const res = await fetch(`${base}/onboarding/preferences${qs}`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  credentials: "include",
                  body: JSON.stringify(payload),
                })
                if (!res.ok) throw new Error("回答の保存に失敗しました")
                // 送信成功でクリア
                sessionStorage.removeItem(STORAGE_KEY)
                const to = nickname ? `/auth/analyzing?name=${encodeURIComponent(nickname)}` : "/auth/analyzing"
                router.push(to)
              } catch (e) {
                alert((e as Error).message)
              }
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
