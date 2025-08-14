"use client"

import { usePathname, useRouter } from "next/navigation"
import { ArrowLeft, MoreHorizontal } from "lucide-react"

export default function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const showBackButton = pathname === "/wallet"

  return (
    <header className="flex items-center justify-between p-4 sm:p-6 bg-[#B547EB] text-white rounded-b-3xl shadow-lg sticky top-0 z-20">
      {showBackButton ? (
        <button
          onClick={() => router.back()}
          className="p-2 rounded-full bg-white/20 hover:bg-white/40 transition-colors"
          aria-label="戻る"
        >
          <ArrowLeft size={20} />
        </button>
      ) : (
        <div className="w-9 h-9" aria-hidden="true"></div>
      )}
      <h1 className="text-lg font-bold">たなぼた！</h1>
      <button className="p-2 rounded-full bg-white/20 hover:bg-white/40 transition-colors" aria-label="メニュー">
        <MoreHorizontal size={20} />
      </button>
    </header>
  )
}
