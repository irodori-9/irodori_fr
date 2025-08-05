import type React from "react"
import type { Metadata } from "next"
import { Inter, Cherry_Bomb_One } from "next/font/google"
import "./globals.css"
import Header from "@/components/Header"
import BottomNav from "@/components/bottom-nav"

const inter = Inter({ subsets: ["latin"], display: "swap" })
const cherryBombOne = Cherry_Bomb_One({ subsets: ["latin"], weight: "400", display: "swap" })

export const metadata: Metadata = {
  title: "たなぼた！",
  description: "A modern banking interface with cute piggy bank",
  manifest: "/manifest.json",
  themeColor: "#B547EB",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "たなぼた！",
  },
  icons: {
    icon: [
      { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icon-152x152.png", sizes: "152x152", type: "image/png" },
    ],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ja">
      <body className={inter.className}>
        <div className="relative min-h-screen w-full bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 font-sans">
          <div className="mx-auto max-w-md bg-gray-50/80 shadow-2xl flex flex-col" style={{ minHeight: "100vh" }}>
            <Header />
            <main className="flex-grow p-4 sm:p-6 pt-6 pb-32 text-[#1F2937]">{children}</main>
            <BottomNav />
          </div>
        </div>
      </body>
    </html>
  )
}
