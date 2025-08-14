import type React from "react"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  // 背景はAppShell内で「画面部分」にのみ敷くため、ここではchildrenのみを返す
  return <>{children}</>
}
