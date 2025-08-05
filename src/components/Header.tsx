"use client"

import { usePathname, useRouter } from "next/navigation"
import { ArrowLeft, MoreHorizontal } from "lucide-react"
import { Cherry_Bomb_One } from "next/font/google"

const cherryBombOne = Cherry_Bomb_One({ subsets: ["latin"], weight: "400", display: "swap" })

interface HeaderProps {
  subtitle?: string;
}

export default function Header({ subtitle }: HeaderProps = {}) {
  const pathname = usePathname()
  const router = useRouter()
  const showBackButton = pathname === "/wallet"

  return (
    <header className="flex items-center justify-between p-4 sm:p-6 bg-[#B547EB] text-white rounded-b-3xl shadow-lg sticky top-0 z-20">
      {showBackButton ? (
        <button
          onClick={() => router.back()}
          className="p-2 rounded-full bg-white/20 hover:bg-white/40 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
      ) : (
        <div className="w-9 h-9"></div> // Placeholder for alignment
      )}
      <h1 className={`text-2xl font-bold ${cherryBombOne.className}`}>{subtitle || "たなぼた！"}</h1>
      <button className="p-2 rounded-full bg-white/20 hover:bg-white/40 transition-colors">
        <MoreHorizontal size={20} />
      </button>
    </header>
  )
}
