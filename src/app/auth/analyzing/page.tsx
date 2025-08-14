"use client"

import { useEffect, useState, useMemo } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Cherry_Bomb_One } from "next/font/google"

const cherry = Cherry_Bomb_One({ weight: "400", subsets: ["latin"], display: "swap" })

export default function AnalyzingPage() {
  const router = useRouter()
  const params = useSearchParams()
  const nickname = useMemo(() => decodeURIComponent(params.get("name") || ""), [params])
  const [canNext, setCanNext] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setCanNext(true)
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  const btnBase = "w-[80%] mx-auto block h-14 rounded-full text-lg font-normal transition-all duration-200"
  const btnEnabled = "bg-[#B547EB] hover:bg-[#B547EB]/90 text-white shadow-[0_10px_24px_rgba(181,71,235,0.35)]"
  const btnDisabled =
    "bg-gradient-to-b from-[#ffffff] to-[#e1e0e2] text-white shadow-[0_8px_24px_rgba(0,0,0,0.12)] ring-1 ring-black/5"

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6">
      <div className="flex flex-col items-center space-y-6 mb-16">
        <Image
          src="/images/mascot/pig-analyzing.png"
          alt="分析中のブタキャラクター"
          width={150}
          height={150}
          className="shrink-0"
        />
        <p className={`${cherry.className} text-2xl text-gray-800 tracking-wider`}>Analyzing....</p>
      </div>

      <div className="w-full">
        <Button
          disabled={!canNext}
          onClick={() => {
            const to = nickname ? `/auth/report?name=${encodeURIComponent(nickname)}` : "/auth/report"
            router.push(to)
          }}
          className={`${btnBase} ${canNext ? btnEnabled : btnDisabled}`}
        >
          <span className={`${cherry.className} tracking-[0.06em]`}>つぎへ</span>
        </Button>
      </div>
    </div>
  )
}
