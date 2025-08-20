"use client"

import { usePathname } from "next/navigation"
import Header from "@/components/Header"
import BottomNav from "@/components/bottom-nav"
import type { PropsWithChildren } from "react"
import Image from "next/image"

export default function AppShell({ children }: PropsWithChildren) {
  const pathname = usePathname()
  const isAuth = pathname?.startsWith("/auth")

  return (
    // 画面部分: スマホ最適化 (max-w-md), 最小高さ: デバイス高
    // ルール: 背景(グラデ/画像)は absolute/fixed + pointer-events-none。コンテンツは relative z-[2] 以上に固定。
    <div className="relative mx-auto max-w-md w-full min-h-svh flex flex-col isolation-isolate">
      {/* auth配下のみ、グラデーションの上に重なる画面部分の背景画像 */}
      {isAuth && (
        <div
          className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 h-svh w-full max-w-md z-0"
          aria-hidden="true"
        >
          <Image
            src="/images/background/image.png"
            alt=""
            fill
            priority
            sizes="(max-width: 480px) 100vw, 480px"
            style={{ objectFit: "cover", objectPosition: "top center" }}
          />
        </div>
      )}

      {/* 非authは画面部分を白にする（背景画像はなし） */}
      {!isAuth && <div className="absolute inset-0 z-0 bg-white" aria-hidden="true" />}

      {/* コンテンツ（必ず背景より前面） */}
      {!isAuth && <Header />}
      <main className={`relative z-[2] ${!isAuth ? "pb-32 pt-6" : "pt-6"} p-4 sm:p-6`}>{children}</main>
      {!isAuth && <BottomNav />}
    </div>
  )
}
