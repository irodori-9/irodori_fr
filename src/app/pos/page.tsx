"use client"

import { useState, useMemo, useEffect } from "react"
import { Camera, X, Check } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import QrScanner from "@/components/qr-scanner"

// ▼ このページ表示中だけフッター（下部ツールバー）を非表示
function HideGlobalFooter() {
  useEffect(() => {
    const selectors = [
      "#app-footer",
      "[data-bottom-nav]",
      "[data-role='bottom-nav']",
      ".bottom-nav",
      ".mobile-tabbar",
      "footer",
    ]
    const els: HTMLElement[] = []
    selectors.forEach((sel) => els.push(...Array.from(document.querySelectorAll<HTMLElement>(sel))))

    const prev = new Map<HTMLElement, string>()
    els.forEach((el) => {
      prev.set(el, el.style.display)
      el.style.display = "none"
    })

    return () => els.forEach((el) => (el.style.display = prev.get(el) ?? ""))
  }, [])
  return null
}
// ▲ フッター非表示

type ExecuteResponse = {
  transaction_id: number
  amount_paid: number
  tanabota_total: number
  executions: Array<{
    rule_id: number
    action_id: number
    action_type: string
    tanabota_amount: number
  }>
}

const joinUrl = (base: string, path: string) => {
  const b = base.replace(/\/+$/, "")
  const p = path.replace(/^\/+/, "")
  return `${b}/${p}`
}

export default function POSApp() {
  // ---- すべて初期化状態で開始（退避なし）----
  const [isScanning, setIsScanning] = useState(false)
  const [scanSession, setScanSession] = useState(0) // 再マウント用 key
  const [scannedUserId, setScannedUserId] = useState<string>("")
  const [amount, setAmount] = useState<string>("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentComplete, setPaymentComplete] = useState(false)

  // 画面には出さないデバッグ用（console出力のみ）
  const [lastTriedUrl, setLastTriedUrl] = useState<string>("")
  const [error, setError] = useState<string>("")

  const baseUrl = useMemo(() => process.env.NEXT_PUBLIC_API_BASE_URL || "", [])

  // QR読み取り結果（退避しない）
  const handleQRScan = (result: string) => {
    setScannedUserId(result)
    setIsScanning(false)
    setError("")
  }

  // 支払い完了後に完全初期化（次のQRに備える）
  const resetAfterPayment = (autoRescan = false) => {
    setPaymentComplete(false)
    setError("")
    setAmount("")
    setScannedUserId("")
    if (autoRescan) {
      setScanSession((s) => s + 1)
      setIsScanning(true)
    }
  }

  const handlePayment = async () => {
    if (!scannedUserId || !amount) {
      setError("ユーザーIDと金額を入力してください")
      return
    }
    if (isNaN(Number(amount)) || Number(amount) <= 0) {
      setError("正しい金額を入力してください")
      return
    }
    if (!baseUrl) {
      setError("APIのベースURLが設定されていません（NEXT_PUBLIC_API_BASE_URL）")
      return
    }

    setIsProcessing(true)
    setError("")

    try {
      const url = joinUrl(baseUrl, "/pos/execute") // ← サーバ実装に合わせ固定
      setLastTriedUrl(url)

      const payload = { user_id: scannedUserId, amount: Number(amount) }
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const maybeJson = await res.json().catch(() => ({ detail: `HTTP ${res.status}` }))
        const message =
          (maybeJson && (maybeJson.detail || maybeJson.message)) ||
          `支払い処理に失敗しました (HTTP ${res.status})`
        throw new Error(message)
      }

      const data: ExecuteResponse = await res.json()
      console.log("ExecuteResponse:", data)

      setPaymentComplete(true)

      // 完了アニメ表示後に初期化（次のQR読み取りに備える）
      setTimeout(() => {
        resetAfterPayment(/* autoRescan */ false) // true にすると完了後に自動でスキャン開始
      }, 1500)
    } catch (err: any) {
      console.error("POS payment failed:", err?.message || err, "tried:", lastTriedUrl)
      // 画面には赤枠などを出さない方針：保持のみ
      setError("支払い処理に失敗しました")
    } finally {
      setIsProcessing(false)
    }
  }

  // 手動リセット
  const resetForm = () => {
    setScannedUserId("")
    setAmount("")
    setError("")
    setPaymentComplete(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-300 via-pink-200 to-blue-200 px-4 py-6">
      <HideGlobalFooter />
      <div className="max-w-sm mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-1">たなぼた!</h1>
        </div>

        <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-5 shadow-xl">
          {/* QR Scanner Modal */}
          <AnimatePresence>
            {isScanning && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="bg-white rounded-2xl p-6 w-full max-w-sm"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-gray-800">QRコードをスキャン</h3>
                    <button
                      onClick={() => setIsScanning(false)}
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <X size={20} className="text-gray-600" />
                    </button>
                  </div>
                  {/* ★ 強制再マウントのための key */}
                  <QrScanner key={scanSession} onScan={handleQRScan} />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 支払い完了アニメ */}
          <AnimatePresence>
            {paymentComplete && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
              >
                <motion.div
                  initial={{ y: 50 }}
                  animate={{ y: 0 }}
                  className="bg-white rounded-3xl p-8 text-center max-w-sm w-full"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.05, type: "spring", stiffness: 200 }}
                    className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4"
                  >
                    <Check size={40} className="text-white" />
                  </motion.div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">支払い完了！</h3>
                  <p className="text-gray-600 mb-2">¥{Number(amount).toLocaleString()}</p>
                  <p className="text-sm text-gray-500">ありがとうございました</p>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 実行UI */}
          <button
            onClick={() => { setScanSession((s) => s + 1); setIsScanning(true) }}
            disabled={isProcessing}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-4 rounded-2xl mb-5 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transition-all disabled:opacity-50 text-lg"
          >
            <Camera size={24} />
            QRをスキャン
          </button>

          {/* 読み取ったユーザーID */}
          {scannedUserId && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-green-100 border border-green-300 rounded-2xl p-4 mb-5"
            >
              <p className="text-green-700 text-sm text-center">
                <span className="font-medium">ユーザーID:</span> {scannedUserId}
              </p>
            </motion.div>
          )}

          {/* 金額入力（テキスト¥） */}
          <div className="mb-5">
            <label className="block text-gray-700 text-sm font-medium mb-2">金額を入力</label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg font-semibold">
                ¥
              </div>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="金額を入力してください"
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border-0 rounded-2xl text-lg font-medium text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all"
                disabled={isProcessing}
                inputMode="numeric"
                min={0}
              />
            </div>
          </div>

          {/* 実行ボタン */}
          <button
            onClick={handlePayment}
            disabled={!scannedUserId || !amount || isProcessing}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg"
          >
            {isProcessing ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                処理中...
              </>
            ) : (
              <>
                <Check size={20} />
                OK（たなぼた、実行！）
              </>
            )}
          </button>

          {/* 手動リセット */}
          {(scannedUserId || amount) && !isProcessing && (
            <button
              onClick={resetForm}
              className="w-full mt-4 bg-gray-200 text-gray-700 font-medium py-3 rounded-2xl hover:bg-gray-300 transition-colors"
            >
              リセット
            </button>
          )}
        </div>

        <div className="text-center mt-6 text-gray-600 text-xs">
          <p>© 2025 たなぼた POS System</p>
        </div>
      </div>
    </div>
  )
}
