import { cn } from "@/lib/utils"
import type { PropsWithChildren } from "react"

/**
 * 左向きの「三角しっぽ」付き吹き出し。
 * - 本体は白・角丸・影
 * - しっぽは三角形（borderトリック）＋下側に薄い影
 */
export default function SpeechBubble({
  children,
  className,
  bubbleClassName,
}: PropsWithChildren<{ className?: string; bubbleClassName?: string }>) {
  return (
    <div className={cn("relative inline-block", className)}>
      {/* 吹き出し本体 */}
      <div
        className={cn(
          "relative z-10 bg-white rounded-xl shadow-[0_10px_24px_rgba(0,0,0,0.12)] px-4 py-3",
          bubbleClassName,
        )}
      >
        {children}
      </div>

      {/* 三角のしっぽ（左向き） */}
      <div className="pointer-events-none absolute left-[-12px] top-1/2 -translate-y-1/2" aria-hidden="true">
        {/* 本体の白い三角 */}
        <div className="relative z-10 w-0 h-0 border-t-[10px] border-t-transparent border-r-[18px] border-r-white border-b-[10px] border-b-transparent" />
        {/* しっぽの影（薄いグレーを少し下にずらしてぼかす） */}
        <div className="absolute left-[4px] top-[9px] w-0 h-0 border-t-[10px] border-t-transparent border-r-[18px] border-r-black/5 border-b-[10px] border-b-transparent" />
      </div>
    </div>
  )
}
