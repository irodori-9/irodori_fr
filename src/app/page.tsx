import { redirect } from "next/navigation"

export default function RootPage() {
  // 初期表示はログイン画面へ
  redirect("/auth/login")
}
