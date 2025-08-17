"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Image from "next/image"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { Cherry_Bomb_One } from "next/font/google"
import SpeechBubble from "@/components/speech-bubble"

const cherry = Cherry_Bomb_One({ weight: "400", subsets: ["latin"], display: "swap" })

export default function NicknamePage() {
  const router = useRouter()
  const params = useSearchParams()
  const [nickname, setNickname] = useState("")
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    // URLクエリ優先、なければlocalStorage
    const q = params.get("id")
    if (q) {
      setUserId(q)
      try { localStorage.setItem("registered_user_id", q) } catch {}
      return
    }
    try {
      const uid = localStorage.getItem("registered_user_id")
      if (uid) setUserId(uid)
    } catch {}
  }, [params])

  const canNext = nickname.trim().length > 0
  const wide = "w-[84%] sm:w-[80%]"
  const btnBase = `${wide} mx-auto block h-14 rounded-full text-lg font-normal transition-all duration-200`
  const btnEnabled = "bg-[#B547EB] hover:bg-[#B547EB]/90 text-white shadow-[0_10px_24px_rgba(181,71,235,0.35)]"
  const btnDisabled =
    "bg-gradient-to-b from-[#ffffff] to-[#e1e0e2] text-white shadow-[0_8px_24px_rgba(0,0,0,0.12)] ring-1 ring-black/5"

  return (
    <div className="flex min-h-[100svh] flex-col items-center">
      {/* 上部プログレスバー（上部に固定、中央ブロックの外） */}
      <div className={`${wide} mx-auto mt-8`}>
        <div className="h-1.5 rounded-full bg-gradient-to-r from-[#e6ccff]/70 via-white/60 to-white/40 relative overflow-hidden">
          <div className="absolute left-0 top-0 h-full w-[18%] bg-[#B547EB] rounded-full" />
        </div>
      </div>

      {/* 画面中央ブロック（ブタ＋吹き出し／入力欄／ボタン） */}
      <div className="flex-1 flex items-center w-full">
        <div className="w-full flex flex-col items-center gap-6">
          {/* ブタ + 吹き出し */}
          <div className={`${wide} mx-auto`}>
            <div className="flex items-start gap-3">
              <Image
                src="/images/mascot/pig.png"
                alt="たなぼたキャラクター"
                width={96}
                height={96}
                className="shrink-0"
                priority
              />
              <SpeechBubble>
                <p className="text-sm font-semibold text-gray-800">あなたのニックネームを教えてブヒ！</p>
              </SpeechBubble>
            </div>
          </div>

          {/* 入力フィールド + つぎへボタン */}
          <div className={`${wide} mx-auto space-y-6`}>
            <Input
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="ニックネーム"
              aria-label="ニックネーム"
              className="h-12 rounded-2xl bg-white/90 shadow-md w-full"
            />

            <Button
              disabled={!canNext}
              onClick={async () => {
                const nn = nickname.trim()
                if (!nn) return
                try {
                  const base = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000"
                  // 直前の登録で作成された一時ユーザーIDをlocalStorageから取得（登録時にセット済み想定）
                  const tmpUserId = userId || localStorage.getItem("registered_user_id")
                  if (!tmpUserId) throw new Error("ユーザーの登録情報が見つかりません。はじめからやり直してください。")
                  const res = await fetch(`${base}/onboarding/nickname`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ user_id: Number(tmpUserId), nickname: nn }),
                  })
                  if (!res.ok) {
                    let msg = "ニックネームの設定に失敗しました"
                    try {
                      const data = await res.json()
                      if (typeof data?.detail === "string") msg = data.detail
                    } catch {}
                    throw new Error(msg)
                  }
                  const name = encodeURIComponent(nn)
                  const to = name ? `/auth/fandoms?name=${name}` : "/auth/fandoms"
                  router.push(to)
                } catch (e: any) {
                  alert(e?.message || "ニックネームの設定に失敗しました")
                }
              }}
              className={`${btnBase} ${canNext ? btnEnabled : btnDisabled}`}
            >
              <span className={`${cherry.className} tracking-[0.06em]`}>つぎへ</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
