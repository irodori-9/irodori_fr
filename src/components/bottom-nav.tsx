"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Wallet, Newspaper, BookOpen } from "lucide-react"

const navItems = [
  { href: "/home", label: "ホーム", icon: Home },
  { href: "/assets", label: "資産BOX", icon: Wallet },
  { href: "/news", label: "ニュース", icon: Newspaper },
  { href: "/recipes", label: "レシピ", icon: BookOpen },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <footer className="fixed bottom-0 left-0 right-0 max-w-md mx-auto z-20">
      <div className="m-4 p-3 bg-white/30 backdrop-blur-xl rounded-3xl border border-white/40 shadow-lg">
        <nav className="flex justify-around items-center">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href === "/assets" && pathname === "/wallet")
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1 transition-colors ${
                  isActive ? "text-purple-800" : "text-[#6B7280] hover:text-purple-800"
                }`}
              >
                <item.icon size={24} />
                <span className={`text-xs ${isActive ? "font-bold" : "font-medium"}`}>{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </div>
    </footer>
  )
}
