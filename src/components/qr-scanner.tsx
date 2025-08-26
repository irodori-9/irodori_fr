"use client"

import { useEffect, useRef, useState } from "react"
import { Camera, AlertCircle, Image as ImageIcon, Upload } from "lucide-react"
import jsQR from "jsqr"

export type QrScannerProps = { onScan: (result: string) => void }

const SCAN_INTERVAL_MS = 180
const TIMEOUT_MS = 12_000
const MAX_SAMPLE_W = 900 // 近距離で画素が太り過ぎるのを防ぐために縮小

export default function QrScanner({ onScan }: QrScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string>("")
  const [stream, setStream] = useState<MediaStream | null>(null)

  const scanTimerRef = useRef<number | null>(null)
  const failTimeoutRef = useRef<number | null>(null)

  useEffect(() => {
    startCamera()
    const onVis = () => { document.hidden ? stopScanning() : (error ? null : startScanning()) }
    document.addEventListener("visibilitychange", onVis)
    return () => {
      document.removeEventListener("visibilitychange", onVis)
      stopScanning()
      stopCamera()
      if (failTimeoutRef.current) { clearTimeout(failTimeoutRef.current); failTimeoutRef.current = null }
    }
  }, [])

  const startCamera = async () => {
    try {
      setIsLoading(true); setError("")
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" }, width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      })
      setStream(mediaStream)

      const v = videoRef.current
      if (v) {
        v.setAttribute("playsinline", "true") // iOS対策
        v.muted = true
        ;(v as any).srcObject = mediaStream
        await v.play()
      }

      setIsLoading(false)
      startScanning()
    } catch (err) {
      console.error("Camera access error:", err)
      setError("カメラにアクセスできません。許可設定を確認するか、画像から読み取ってください。")
      setIsLoading(false)
    }
  }

  const stopCamera = () => {
    if (stream) {
      try { stream.getTracks().forEach(t => t.stop()) } catch {}
      setStream(null)
    }
  }

  const startScanning = () => {
    stopScanning()
    const tick = () => {
      if (!videoRef.current || !canvasRef.current) return
      const video = videoRef.current
      const canvas = canvasRef.current
      const ctx = canvas.getContext("2d", { willReadFrequently: true } as any) as CanvasRenderingContext2D | null
      if (!ctx) return

      if (video.readyState === video.HAVE_ENOUGH_DATA && video.videoWidth && video.videoHeight) {
        const vw = video.videoWidth
        const vh = video.videoHeight

        // 近距離でQRが太りすぎた場合のエイリアス抑制：縮小して解析
        const targetW = Math.min(MAX_SAMPLE_W, vw)
        const scale = targetW / vw
        const targetH = Math.floor(vh * scale)

        canvas.width = targetW
        canvas.height = targetH

        ctx.imageSmoothingEnabled = false
        ctx.drawImage(video, 0, 0, targetW, targetH)

        const imageData = ctx.getImageData(0, 0, targetW, targetH)
        // 黒地/白地どちらも試す（環境依存で白黒反転があり得る）
        const codeA = jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: "attemptBoth" })
        const code = codeA // （不要に複雑化しない）

        if (code?.data) {
          onScan(code.data)
          stopScanning()
          stopCamera()
          if (failTimeoutRef.current) { clearTimeout(failTimeoutRef.current); failTimeoutRef.current = null }
          return
        }
      }
      scanTimerRef.current = window.setTimeout(tick, SCAN_INTERVAL_MS)
    }
    tick()

    // 12秒で一旦案内
    failTimeoutRef.current = window.setTimeout(() => {
      if (scanTimerRef.current) {
        stopScanning()
        setError("QRコードを検出できませんでした。明るさやピントを調整するか、画像から読み取ってください。")
      }
    }, TIMEOUT_MS)
  }

  const stopScanning = () => {
    if (scanTimerRef.current) { clearTimeout(scanTimerRef.current); scanTimerRef.current = null }
  }

  // 画像ファイル Fallback
  const triggerFileSelect = () => fileInputRef.current?.click()
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return
    decodeFromFile(file); e.currentTarget.value = ""
  }
  const decodeFromFile = (file: File) => {
    setError(""); stopScanning(); stopCamera()
    const img = new Image()
    const objectUrl = URL.createObjectURL(file)
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas")
        canvas.width = img.width; canvas.height = img.height
        const ctx = canvas.getContext("2d", { willReadFrequently: true } as any) as CanvasRenderingContext2D | null
        if (!ctx) { setError("画像の読み込みに失敗しました。別の画像でお試しください。"); return }
        ctx.imageSmoothingEnabled = false
        ctx.drawImage(img, 0, 0)
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const code = jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: "attemptBoth" })
        if (code?.data) onScan(code.data)
        else setError("画像からQRを検出できませんでした。別の角度・解像度でお試しください。")
      } finally { URL.revokeObjectURL(objectUrl) }
    }
    img.onerror = () => { URL.revokeObjectURL(objectUrl); setError("画像の読み込みに失敗しました。") }
    img.src = objectUrl
  }

  if (error && !isLoading) {
    return (
      <div className="text-center py-6">
        <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
        <p className="text-red-600 text-sm mb-4">{error}</p>
        <div className="flex items-center justify-center gap-3">
          <button onClick={startCamera} className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors">
            再試行（カメラ）
          </button>
          <button onClick={triggerFileSelect} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors flex items-center gap-2">
            <Upload size={18} />
            画像から読み取る
          </button>
        </div>
        <input ref={fileInputRef} type="file" accept="image/*" capture="environment" onChange={handleFileChange} className="hidden" />
      </div>
    )
  }

  return (
    <div className="relative">
      {isLoading && (
        <div className="absolute inset-0 bg-gray-100 rounded-xl flex items-center justify-center z-10">
          <div className="text-center">
            <Camera size={48} className="text-gray-400 mx-auto mb-4 animate-pulse" />
            <p className="text-gray-600 text-sm">カメラを起動中...</p>
          </div>
        </div>
      )}

      <div className="relative bg-black rounded-xl overflow-hidden">
        <video ref={videoRef} className="w-full h-64 object-cover" playsInline muted />
        {/* ガイド枠 */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-48 h-48 border-2 border-white rounded-lg relative">
            <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-purple-500 rounded-tl-lg" />
            <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-purple-500 rounded-tr-lg" />
            <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-purple-500 rounded-bl-lg" />
            <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-purple-500 rounded-br-lg" />
          </div>
        </div>
        {/* スキャンライン */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-48 h-1 opacity-75 animate-pulse bg-purple-500"></div>
        </div>
      </div>

      {/* デコード用 Canvas（非表示） */}
      <canvas ref={canvasRef} className="hidden" />

      {/* 画像から読み取り（常時） */}
      <div className="mt-4 flex flex-col items-center">
        <button onClick={triggerFileSelect} className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors flex items-center gap-2 text-sm">
          <ImageIcon size={16} />
          画像から読み取る
        </button>
        <input ref={fileInputRef} type="file" accept="image/*" capture="environment" onChange={handleFileChange} className="hidden" />
        <p className="text-center text-sm text-gray-600 mt-3">QRコードをカメラに向けてください</p>
      </div>
    </div>
  )
}
