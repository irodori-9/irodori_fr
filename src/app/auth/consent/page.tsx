"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { useRouter } from "next/navigation"
import { Cherry_Bomb_One } from "next/font/google"

const cherry = Cherry_Bomb_One({ weight: "400", subsets: ["latin"], display: "swap" })

export default function ConsentPage() {
  const [agreed, setAgreed] = useState(false)
  const router = useRouter()

  // /login の「とうろく」ボタンと同じ幅・色
  const wide = "w-[84%] sm:w-[80%]"
  const btnBase = `${wide} mx-auto block h-14 rounded-full text-lg font-normal transition-all duration-200`
  const btnEnabled = "bg-[#B547EB] hover:bg-[#B547EB]/90 text-white shadow-[0_10px_24px_rgba(181,71,235,0.35)]"
  const btnDisabled =
    "bg-gradient-to-b from-[#ffffff] to-[#e1e0e2] text-white shadow-[0_8px_24px_rgba(0,0,0,0.12)] ring-1 ring-black/5"

  return (
    <div className="space-y-6 mt-8 sm:mt-12">
      {/* 見出し（Cherry Bomb One） */}
      <h1 className={`text-center text-3xl sm:text-4xl font-normal tracking-[0.03em] ${cherry.className}`}>
        たなぼたへようこそ！
      </h1>

      {/* 中央配置の同意セクション（内容はversion43と同じ） */}
      <section className="space-y-3">
        <div className={`${wide} mx-auto space-y-3`}>
          <p className="font-semibold text-gray-700 text-center">利用に関する同意事項</p>

          <div className="rounded-2xl bg-white/90 shadow-md p-4">
            <dl className="space-y-4 text-sm text-gray-700">
              <div>
                <dt className="font-semibold">利用規約について</dt>
                <dd className="text-gray-600">〇〇〇〇〇〇〇〇〇〇〇〇〇〇〇〇〇〇〇〇〇〇〇〇〇</dd>
              </div>
              <div>
                <dt className="font-semibold">プライバシーポリシーについて</dt>
                <dd className="text-gray-600">〇〇〇〇〇〇〇〇〇〇〇〇〇〇〇〇〇〇〇〇〇〇〇〇〇</dd>
              </div>
              <div>
                <dt className="font-semibold">データ収集と利用について</dt>
                <dd className="text-gray-600">〇〇〇〇〇〇〇〇〇〇〇〇〇〇〇〇〇〇〇〇〇〇〇〇〇</dd>
              </div>
            </dl>
          </div>

          <label className="flex items-center justify-center gap-3 pt-2">
            <Checkbox
              id="agree"
              checked={agreed}
              onCheckedChange={(v) => setAgreed(Boolean(v))}
              className="w-5 h-5 border-2 border-[#8C8C8C] data-[state=checked]:border-[#8C8C8C]"
            />
            <span className="font-semibold text-gray-700">上記事項に同意する</span>
          </label>
        </div>
      </section>

      {/* つぎへ（未同意=グレーグラデ、有効=紫） */}
      <div className="pt-2">
        <Button
          disabled={!agreed}
          onClick={() => {
            let to = "/auth/nickname"
            try {
              const uid = typeof window !== "undefined" ? localStorage.getItem("registered_user_id") : null
              if (uid) to = `/auth/nickname?id=${encodeURIComponent(uid)}`
            } catch {}
            router.push(to)
          }}
          className={`${btnBase} ${agreed ? btnEnabled : btnDisabled}`}
        >
          <span className={`${cherry.className} tracking-[0.06em]`}>つぎへ</span>
        </Button>
      </div>
    </div>
  )
}
