"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { Cherry_Bomb_One } from "next/font/google"
// axios 依存を避け、標準の fetch を使用

const cherry = Cherry_Bomb_One({ weight: "400", subsets: ["latin"], display: "swap" })



export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    last: "",
    first: "",
    email: "",
    password: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [triedSubmit, setTriedSubmit] = useState(false)

  

  const canNext =
    form.last &&
    form.first &&
    form.email &&
    form.password.length >= 8

  const set = (k: keyof typeof form) => (v: string) => setForm((s) => ({ ...s, [k]: v }))

  const inputClass =
    "w-full h-[49px] box-border rounded-2xl border border-black/10 bg-white/90 shadow px-4 text-base leading-none placeholder:text-gray-400"

  // つぎへボタンのスタイル（/auth/nickname の未入力時と同じ無効色を使用）
  const wide = "w-[84%] sm:w-[80%]"
  const btnBase = `${wide} mx-auto block h-14 rounded-full text-lg font-normal transition-all duration-200`
  const btnEnabled =
    "bg-[#B547EB] hover:bg-[#B547EB]/90 text-white shadow-[0_10px_24px_rgba(181,71,235,0.35)]"
  const btnDisabled =
    "bg-gradient-to-b from-[#ffffff] to-[#e1e0e2] text-white shadow-[0_8px_24px_rgba(0,0,0,0.12)] ring-1 ring-black/5"

  const validateForm = (): boolean => {
    const errs: Record<string, string> = {}

    // 必須項目
    if (!form.last.trim()) errs.last = "姓は必須です"
    if (!form.first.trim()) errs.first = "名は必須です"
    if (!form.email.trim()) errs.email = "メールアドレスは必須です"
    if (!form.password) errs.password = "パスワードは必須です"

    // メールアドレス形式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (form.email && !emailRegex.test(form.email)) {
      errs.email = "メールアドレスの形式が正しくありません"
    }

    // パスワード長さ
    if (form.password && form.password.length < 8) {
      errs.password = "パスワードは8文字以上で入力してください"
    }

    

    setFieldErrors(errs)
    return Object.keys(errs).length === 0
  }

  return (
    <div className="space-y-6 mt-8 sm:mt-12">
      <h1
        className={`text-center text-3xl sm:text-4xl font-normal tracking-[0.03em] leading-tight ${cherry.className}`}
      >
        とうろくがめん
      </h1>

      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <Input
              placeholder="姓"
              value={form.last}
              onChange={(e) => {
                set("last")(e.target.value)
                if (triedSubmit && fieldErrors.last) setFieldErrors((s) => ({ ...s, last: "" }))
              }}
              className={inputClass}
            />
            {triedSubmit && fieldErrors.last ? (
              <p className="text-sm text-[#B547EB]">{fieldErrors.last}</p>
            ) : null}
          </div>
          <div className="flex flex-col gap-1">
            <Input
              placeholder="名"
              value={form.first}
              onChange={(e) => {
                set("first")(e.target.value)
                if (triedSubmit && fieldErrors.first) setFieldErrors((s) => ({ ...s, first: "" }))
              }}
              className={inputClass}
            />
            {triedSubmit && fieldErrors.first ? (
              <p className="text-sm text-[#B547EB]">{fieldErrors.first}</p>
            ) : null}
          </div>
        </div>

        

        
        <Input
          placeholder="メールアドレス"
          type="email"
          value={form.email}
          onChange={(e) => {
            set("email")(e.target.value)
            if (triedSubmit && fieldErrors.email) setFieldErrors((s) => ({ ...s, email: "" }))
          }}
          className={inputClass}
        />
        {triedSubmit && fieldErrors.email ? (
          <p className="text-sm text-[#B547EB]">{fieldErrors.email}</p>
        ) : null}
        
        <Input
          placeholder="パスワード（8文字以上）"
          type="password"
          value={form.password}
          onChange={(e) => {
            set("password")(e.target.value)
            if (triedSubmit && fieldErrors.password) setFieldErrors((s) => ({ ...s, password: "" }))
          }}
          className={inputClass}
        />
        {triedSubmit && fieldErrors.password ? (
          <p className="text-sm text-[#B547EB]">{fieldErrors.password}</p>
        ) : null}
        
      </div>

      {error ? (
        <p className="text-sm text-red-600 text-center">{error}</p>
      ) : null}

      <div className="pt-4">
        <Button
          disabled={loading}
          onClick={async () => {
            setTriedSubmit(true)
            if (!validateForm()) return
            setLoading(true)
            setError(null)
            try {
              // バックエンド必須フィールドは固定値で補完
              const payload = {
                last_name: form.last,
                first_name: form.first,
                email: form.email,
                birthdate: `2000-01-01`,
                occupation: "その他",
                company_name: "イロドリ株式会社", // 固定値
                password: form.password,
                password_confirm: form.password,
              }
              const base = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000"
              const res = await fetch(`${base}/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
              })
              if (!res.ok) {
                let msg = "登録に失敗しました"
                try {
                  const data = await res.json()
                  const detail = data?.detail
                  if (typeof detail === "string") msg = detail
                  else if (Array.isArray(detail)) msg = detail.map((d: any) => d?.msg).filter(Boolean).join("\n")
                } catch {}
                throw new Error(msg)
              }
              // 作成されたユーザーIDを保存
              const created = await res.json()
              if (created?.id) {
                try { localStorage.setItem("registered_user_id", String(created.id)) } catch {}
              }
              // 完了後は同意画面へ遷移
              router.push("/auth/consent")
            } catch (e: any) {
              setError(e?.message || "登録に失敗しました")
            } finally {
              setLoading(false)
            }
          }}
          className={`${btnBase} ${canNext ? btnEnabled : btnDisabled}`}
        >
          <span className={`${cherry.className} tracking-[0.06em]`}>
            {loading ? "送信中..." : "つぎへ"}
          </span>
        </Button>
      </div>
    </div>
  )
}
