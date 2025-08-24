"use client"

import Image from "next/image"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Cherry_Bomb_One } from "next/font/google"
import { useAuth } from "@/contexts/AuthContext"
// axios 依存を避け、標準の fetch を使用

const cherry = Cherry_Bomb_One({ weight: "400", subsets: ["latin"], display: "swap" })

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const { login } = useAuth()

  const canSubmit = email.length > 0 && password.length >= 6
  const btnWidth = "w-[84%] sm:w-[80%]" // 両ボタン共通の幅

  const handleLogin = async () => {
    if (!canSubmit || loading) return
    setLoading(true)
    setError("")
    try {
      const base = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000"
      console.log('🔍 Login - Attempting login with:', { email, base })
      
      const res = await fetch(`${base}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      })
      
      console.log('🔍 Login - Response received:', { 
        ok: res.ok, 
        status: res.status,
        statusText: res.statusText
      })
      
      if (!res.ok) {
        const fallbackMsg = "とうろくしたメールアドレス or パスワードがまちがっています..."
        try {
          const errorData = await res.json()
          console.log('🔍 Login - Error response:', errorData)
        } catch {}
        throw new Error(fallbackMsg)
      }
      
      // ログイン成功時の応答を確認
      const loginResponse = await res.json()
      console.log('🔍 Login - Login response:', loginResponse)

      // バックエンドが返した正しいユーザーIDを保存
      const userId = loginResponse?.id
      const nickname = loginResponse?.nickname
      const userObj = {
        id: userId,
        nickname,
        email: email,
        isAuthenticated: true
      }
      console.log('🔍 Login - Calling login() with:', userObj)
      login(userObj)
      
      console.log('🔍 Login - Redirecting to /home')
      router.push("/home")
    } catch (e: any) {
      console.log('🔍 Login - Error occurred:', e)
      setError(e?.message || "ログインに失敗しました")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100svh-3rem)] gap-6">
      <div className="flex flex-col items-center text-center gap-3">
        <Image
          src="/images/mascot/pig.png"
          alt="たなぼたの豚キャラクター"
          width={160}
          height={160}
          className="drop-shadow-md"
        />
        {/* 見出しは細め＋やや広い字間 */}
        <h1 className={`text-4xl sm:text-5xl font-normal tracking-[0.03em] leading-tight ${cherry.className}`}>
          たなぼた！
        </h1>
        <p className="text-sm text-gray-700">「好き！」を応援する新しい銀行アプリ</p>
      </div>

      <div className="w-full space-y-3 flex flex-col items-center">
        <Input
          placeholder="メールアドレス"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-12 rounded-2xl bg-white/90 shadow-md w-full"
        />
        <Input
          placeholder="パスワード"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="h-12 rounded-2xl bg-white/90 shadow-md w-full"
        />

        {error ? (
          <p className={`text-[1.05rem] w-full text-center ${cherry.className} text-[#B547EB]`}>{error}</p>
        ) : null}

        {/* ログインボタン：色統一 + 中央揃え + disabledでも色を薄くしない */}
        <Button
          disabled={!canSubmit || loading}
          onClick={handleLogin}
          className={`${btnWidth} mx-auto h-14 rounded-full text-lg shadow-lg mt-2 sm:mt-3 ${
            canSubmit
              ? "bg-[#B547EB] hover:bg-[#B547EB]/90 text-white shadow-[0_10px_24px_rgba(181,71,235,0.35)]"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          <span className={`${cherry.className} font-normal tracking-[0.06em] text-[1.22rem] leading-none`}>
            {loading ? "送信中..." : "ログイン"}
          </span>
        </Button>

        {/* とうろくボタン：ログインと完全同幅・同色・中央揃え */}
        <Link href="/auth/register" className={`block ${btnWidth} mx-auto`}>
          <Button className="w-full h-14 rounded-full text-lg shadow-[0_10px_24px_rgba(181,71,235,0.35)] bg-[#B547EB] hover:bg-[#B547EB]/90 text-white">
            <span className={`${cherry.className} font-normal tracking-[0.06em] text-[1.22rem] leading-none`}>
              とうろく
            </span>
          </Button>
        </Link>
      </div>
    </div>
  )
}
