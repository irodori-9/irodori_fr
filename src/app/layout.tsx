import type React from "react"
import type { Metadata } from "next"
import { Inter, Cherry_Bomb_One } from "next/font/google"
import "./globals.css"
import AppShell from "@/components/app-shell"

const inter = Inter({ subsets: ["latin"], display: "swap" })
const cherryBombOne = Cherry_Bomb_One({ subsets: ["latin"], weight: "400", display: "swap" })

export const metadata: Metadata = {
  title: "たなぼた！",
  description: "A modern banking interface with cute piggy bank",
  manifest: "/manifest.json",
  generator: 'v0.app'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ja">
      <body className={inter.className}>
        {/* 最背面のグラデーション背景（全ページ共通） */}
        <div
          className="fixed inset-0 -z-50 pointer-events-none bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50"
          aria-hidden="true"
        />
        {/* 画面部分（max-w-md）とコンテンツ。背景より常に前面に出る */}
        <AppShell>{children}</AppShell>
      </body>
    </html>
  )
}
