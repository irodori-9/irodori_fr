"use client"

import { useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Cherry_Bomb_One } from "next/font/google"
import SpeechBubble from "@/components/speech-bubble"

const cherry = Cherry_Bomb_One({ weight: "400", subsets: ["latin"], display: "swap" })

const FAMILY_OPTIONS = [
  { label: "一人暮らし", image: "/images/family/single.png" },
  { label: "家族と同居（実家）", image: "/images/family/parents.png" },
  { label: "パートナーと同居（子供なし）", image: "/images/family/married-no-kids.png" },
  { label: "パートナーと同居（子供あり）", image: "/images/family/married-with-kids.png" },
]

export default function FamilyPage() {
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
          <div className="absolute left-0 top-0 h-full w-[70%] bg-[#B547EB] rounded-full" />
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
              <p className="text-sm font-semibold text-gray-800">家族構成を教えてブヒ！</p>
            </SpeechBubble>
          </div>
        </div>

        <div className={`${wide} mx-auto`}>
          <div className="grid grid-cols-2 gap-4">
            {FAMILY_OPTIONS.map((option) => {
              const active = selected === option.label
              const isSmallImage =
                option.label === "一人暮らし" ||
                option.label.includes("家族と同居") ||
                option.label.includes("パートナーと同居")
              const imagePadding = option.label === "一人暮らし" ? "p-8" : isSmallImage ? "p-6" : "p-2"
              const imagePosition = option.label === "一人暮らし" ? "object-center" : ""

              return (
                <button
                  key={option.label}
                  type="button"
                  aria-pressed={active}
                  onClick={() => select(option.label)}
                  className={[
                    "aspect-square rounded-xl shadow-lg text-sm font-medium transition-all",
                    "border border-black/10 bg-white text-gray-800",
                    "hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400",
                    "relative overflow-hidden",
                    active ? "bg-purple-100 text-purple-900 ring-2 ring-purple-400" : "",
                  ].join(" ")}
                >
                  <Image
                    src={option.image || "/placeholder.svg"}
                    alt={option.label}
                    fill
                    className={`object-contain ${imagePadding} ${imagePosition}`}
                  />
                  <div className="absolute bottom-2 left-2 right-2 bg-white/90 rounded-lg px-2 py-1 text-xs leading-tight text-center font-semibold">
                    {option.label}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        <div className="w-full mt-12">
          <Button
            disabled={!canNext}
            onClick={() => {
              router.push("/auth/preparation")
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
