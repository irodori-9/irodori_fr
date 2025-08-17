"use client"

import { useMemo, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useRouter } from "next/navigation"
import { Cherry_Bomb_One } from "next/font/google"
import { ChevronDown } from "lucide-react"
// axios 依存を避け、標準の fetch を使用

const cherry = Cherry_Bomb_One({ weight: "400", subsets: ["latin"], display: "swap" })

type BirthValue = { year?: string; month?: string; day?: string }

function BirthdatePicker({
  value,
  onChange,
  className = "",
}: {
  value: BirthValue
  onChange: (v: Required<BirthValue>) => void
  className?: string
}) {
  const [open, setOpen] = useState(false)
  const [temp, setTemp] = useState<BirthValue>(value)

  const currentYear = new Date().getFullYear()
  const years = useMemo(() => Array.from({ length: 100 }, (_, i) => String(currentYear - i)), [currentYear])
  const months = useMemo(() => Array.from({ length: 12 }, (_, i) => String(i + 1)), [])
  const days = useMemo(() => Array.from({ length: 31 }, (_, i) => String(i + 1)), [])

  // 生年月日・職業の選択欄は同じ高さを必ず共有
  const triggerH = "h-[50px]"
  const triggerBase =
    "relative w-full " +
    triggerH +
    " box-border rounded-2xl border border-black/10 bg-white/90 shadow px-4 pr-10 text-left leading-none flex items-center"
  const textClass = value.year && value.month && value.day ? "text-gray-900" : "text-gray-400"

  const fmt = (n?: string) => (n ? n.toString().padStart(2, "0") : "")
  const display =
    value.year && value.month && value.day ? `${value.year}/${fmt(value.month)}/${fmt(value.day)}` : "生年月日"

  const colBase = "h-60 overflow-y-auto scroll-py-3 snap-y pr-1 pl-1 rounded-md bg-white/80 ring-1 ring-black/5"
  const itemBase = "snap-start px-3 py-2 text-center rounded-md cursor-pointer select-none hover:bg-purple-100"
  const isComplete = Boolean(temp.year && temp.month && temp.day)

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v)
        if (v) setTemp(value)
      }}
    >
      <DialogTrigger asChild>
        <button type="button" className={`${triggerBase} ${className}`}>
          <span className={`text-[14px] ${textClass} truncate`}>{display}</span>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 opacity-60" />
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-sm rounded-2xl">
        <DialogTitle className="text-center">生年月日を選択</DialogTitle>
        <div className="grid grid-cols-3 gap-3 mt-2">
          <div className={colBase} role="listbox" aria-label="年を選択">
            {years.map((y) => (
              <div
                key={y}
                role="option"
                aria-selected={temp.year === y}
                className={`${itemBase} ${temp.year === y ? "bg-purple-100 font-semibold" : ""}`}
                onClick={() => setTemp((s) => ({ ...s, year: y }))}
              >
                {y}
              </div>
            ))}
          </div>
          <div className={colBase} role="listbox" aria-label="月を選択">
            {months.map((m) => (
              <div
                key={m}
                role="option"
                aria-selected={temp.month === m}
                className={`${itemBase} ${temp.month === m ? "bg-purple-100 font-semibold" : ""}`}
                onClick={() => setTemp((s) => ({ ...s, month: m }))}
              >
                {m}
              </div>
            ))}
          </div>
          <div className={colBase} role="listbox" aria-label="日を選択">
            {days.map((d) => (
              <div
                key={d}
                role="option"
                aria-selected={temp.day === d}
                className={`${itemBase} ${temp.day === d ? "bg-purple-100 font-semibold" : ""}`}
                onClick={() => setTemp((s) => ({ ...s, day: d }))}
              >
                {d}
              </div>
            ))}
          </div>
        </div>
        <DialogFooter className="mt-3">
          <Button variant="secondary" className="rounded-full" onClick={() => setOpen(false)}>
            キャンセル
          </Button>
          <Button
            disabled={!isComplete}
            className="rounded-full bg-[#B547EB] hover:bg-[#B547EB]/90"
            onClick={() => {
              if (temp.year && temp.month && temp.day) {
                onChange({ year: temp.year, month: temp.month, day: temp.day })
              }
              setOpen(false)
            }}
          >
            決定
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function OccupationPicker({
  value,
  onChange,
  className = "",
}: {
  value: string
  onChange: (v: string) => void
  className?: string
}) {
  const [open, setOpen] = useState(false)
  const [temp, setTemp] = useState(value)

  const occupations = [
    "経営者/役員",
    "会社員（総合職）",
    "会社員（一般職）",
    "契約社員・派遣社員",
    "パート・アルバイト",
    "公務員（教職員除く）",
    "教職員",
    "医療関係者",
    "自営業・自由業",
    "専業主婦・主夫",
    "大学生・大学院生",
    "専門学校生・短大生",
    "高校生",
    "士業（公認会計士・弁護士・税理士・司法書士）",
    "無職",
    "定年退職",
    "その他",
  ]

  const triggerH = "h-[50px]"
  const triggerBase =
    "relative w-full " +
    triggerH +
    " box-border rounded-2xl border border-black/10 bg-white/90 shadow px-4 pr-10 text-left leading-none flex items-center"
  const textClass = value ? "text-gray-900" : "text-gray-400"
  const display = value || "職業"

  const listBase = "h-80 overflow-y-auto scroll-py-3 snap-y pr-1 pl-1 rounded-md bg-white/80 ring-1 ring-black/5"
  const itemBase =
    "snap-start px-4 py-3 text-left rounded-md cursor-pointer select-none hover:bg-purple-100 border-b border-gray-100 last:border-b-0"
  const isComplete = Boolean(temp)

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v)
        if (v) setTemp(value)
      }}
    >
      <DialogTrigger asChild>
        <button type="button" className={`${triggerBase} ${className}`}>
          <span className={`text-[14px] ${textClass} truncate`}>{display}</span>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 opacity-60" />
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-sm rounded-2xl">
        <DialogTitle className="text-center">職業を選択</DialogTitle>
        <div className="mt-2">
          <div className={listBase} role="listbox" aria-label="職業を選択">
            {occupations.map((occupation) => (
              <div
                key={occupation}
                role="option"
                aria-selected={temp === occupation}
                className={`${itemBase} ${temp === occupation ? "bg-purple-100 font-semibold" : ""}`}
                onClick={() => setTemp(occupation)}
              >
                {occupation}
              </div>
            ))}
          </div>
        </div>
        <DialogFooter className="mt-3">
          <Button variant="secondary" className="rounded-full" onClick={() => setOpen(false)}>
            キャンセル
          </Button>
          <Button
            disabled={!isComplete}
            className="rounded-full bg-[#B547EB] hover:bg-[#B547EB]/90"
            onClick={() => {
              if (temp) {
                onChange(temp)
              }
              setOpen(false)
            }}
          >
            決定
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    last: "",
    first: "",
    birthdayYear: "",
    birthdayMonth: "",
    birthdayDay: "",
    job: "",
    email: "",
    password: "",
    passwordConfirm: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [triedSubmit, setTriedSubmit] = useState(false)

  

  const canNext =
    form.last &&
    form.first &&
    form.birthdayYear &&
    form.birthdayMonth &&
    form.birthdayDay &&
    form.job &&
    form.email &&
    form.password.length >= 8 &&
    form.password === form.passwordConfirm

  const set = (k: keyof typeof form) => (v: string) => setForm((s) => ({ ...s, [k]: v }))

  const inputClass =
    "w-full h-[49px] box-border rounded-2xl border border-black/10 bg-white/90 shadow px-4 text-base leading-none placeholder:text-gray-400"

  // 生年月日・職業の高さは必ず同じ（50px）に固定
  const triggerH = "h-[50px]"
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
    if (!form.birthdayYear || !form.birthdayMonth || !form.birthdayDay) errs.birthdate = "生年月日は必須です"
    if (!form.job.trim()) errs.job = "職業は必須です"
    if (!form.password) errs.password = "パスワードは必須です"
    if (!form.passwordConfirm) errs.passwordConfirm = "パスワード確認は必須です"

    // メールアドレス形式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (form.email && !emailRegex.test(form.email)) {
      errs.email = "メールアドレスの形式が正しくありません"
    }

    // パスワード長さ
    if (form.password && form.password.length < 8) {
      errs.password = "パスワードは8文字以上で入力してください"
    }

    // パスワード一致
    if (form.password && form.passwordConfirm && form.password !== form.passwordConfirm) {
      errs.passwordConfirm = "パスワードが一致しません"
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

        <div className="grid grid-cols-2 gap-3 items-stretch">
          {/* 生年月日（単一トリガー・選択式） */}
          <div className="flex flex-col gap-1">
            <BirthdatePicker
              value={{ year: form.birthdayYear, month: form.birthdayMonth, day: form.birthdayDay }}
              onChange={(v) => {
                set("birthdayYear")(v.year)
                set("birthdayMonth")(v.month)
                set("birthdayDay")(v.day)
                if (triedSubmit && fieldErrors.birthdate) setFieldErrors((s) => ({ ...s, birthdate: "" }))
              }}
              className={triggerH}
            />
            {triedSubmit && fieldErrors.birthdate ? (
              <p className="text-sm text-[#B547EB]">{fieldErrors.birthdate}</p>
            ) : null}
          </div>

          <div className="flex flex-col gap-1">
            <OccupationPicker
              value={form.job}
              onChange={(v) => {
                set("job")(v)
                if (triedSubmit && fieldErrors.job) setFieldErrors((s) => ({ ...s, job: "" }))
              }}
              className={triggerH}
            />
            {triedSubmit && fieldErrors.job ? (
              <p className="text-sm text-[#B547EB]">{fieldErrors.job}</p>
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
        <Input
          placeholder="パスワード（確認用）"
          type="password"
          value={form.passwordConfirm}
          onChange={(e) => {
            set("passwordConfirm")(e.target.value)
            if (triedSubmit && fieldErrors.passwordConfirm) setFieldErrors((s) => ({ ...s, passwordConfirm: "" }))
          }}
          className={inputClass}
        />
        {triedSubmit && fieldErrors.passwordConfirm ? (
          <p className="text-sm text-[#B547EB]">{fieldErrors.passwordConfirm}</p>
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
              // irodori_fr のバックエンド API と同等のペイロードにマップ
              const payload = {
                last_name: form.last,
                first_name: form.first,
                email: form.email,
                birthdate: `${form.birthdayYear}-${String(form.birthdayMonth).padStart(2, "0")}-${String(form.birthdayDay).padStart(2, "0")}`,
                occupation: form.job,
                company_name: "イロドリ株式会社", // 固定値
                password: form.password,
                password_confirm: form.passwordConfirm,
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
              alert("登録が完了しました！同意ページに移動します。")
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
