"use client"

import { useEffect, useRef, useState } from "react"
import { Camera, AlertCircle, Image as ImageIcon, Upload } from "lucide-react"
import jsQR from "jsqr"

export type QrScannerProps = { onScan: (result: string) => void }

// （任意）ブラウザ内蔵 BarcodeDetector を使える場合は先に試す
type BarcodeDetectorLike = {
  detect: (source: CanvasImageSource) => Promise<Array<{ rawValue: string; format?: string }>>
}

export default function QrScanner({ onScan }: QrScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string>("")
  const [stream, setStream] = useState<MediaStream | null>(null)

  const rafIdRef = useRef<number | null>(null)
  const lastScanTsRef = useRef<number>(0)
  const barcodeRef = useRef<BarcodeDetectorLike | null>(null)
  const failTimeoutRef = useRef<number | null>(null)

  useEffect(() => {
    startCamera()
    return () => {
      stopLoop()
      stopCamera()
      if (failTimeoutRef.current) { clearTimeout(failTimeoutRef.current); failTimeoutRef.current = null }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const waitLoadedMetadata = async (video: HTMLVideoElement) =>
    await new Promise<void>((resolve) => {
      const done = () => { video.removeEventListener("loadedmetadata", done); resolve() }
      if (video.readyState >= video.HAVE_METADATA) resolve()
      else video.addEventListener("loadedmetadata", done)
    })

  const startCamera = async () => {
    try {
      setIsLoading(true)
      setError("")

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      })
      setStream(mediaStream)

      const video = videoRef.current
      if (video) {
        video.setAttribute("playsinline", "true")
        video.muted = true
        ;(video as any).srcObject = mediaStream
        await waitLoadedMetadata(video)
        await video.play()
      }

      if ("BarcodeDetector" in window) {
        try {
          const Fmts = (window as any).BarcodeDetector.getSupportedFormats
            ? await (window as any).BarcodeDetector.getSupportedFormats()
            : ["qr_code"]
          if (!Fmts || Fmts.includes("qr_code")) {
            barcodeRef.current = new (window as any).BarcodeDetector({ formats: ["qr_code"] })
          }
        } catch { /* ignore */ }
      }

      setIsLoading(false)
      startLoop()
    } catch (err) {
      console.error("Camera access error:", err)
      setError("カメラにアクセスできません。許可設定を確認するか、画像から読み取ってください。")
      setIsLoading(false)
    }
  }

  const stopCamera = () => {
    if (stream) {
      try { stream.getTracks().forEach((t) => t.stop()) } catch {}
      setStream(null)
    }
    const video = videoRef.current
    if (video) {
      try { video.pause() } catch {}
      try { (video as any).srcObject = null } catch {}
      video.removeAttribute("src")
      video.load()
    }
  }

  const stopLoop = () => {
    if (rafIdRef.current) { cancelAnimationFrame(rafIdRef.current); rafIdRef.current = null }
  }

  const startLoop = () => {
    stopLoop()
    if (failTimeoutRef.current) { clearTimeout(failTimeoutRef.current); failTimeoutRef.current = null }

    const scanIntervalMs = 140
    const tick = async (now: number) => {
      rafIdRef.current = requestAnimationFrame(tick)

      if (!videoRef.current || !canvasRef.current) return
      const video = videoRef.current

      if (video.readyState < video.HAVE_ENOUGH_DATA || !video.videoWidth || !video.videoHeight) return
      if (now - lastScanTsRef.current < scanIntervalMs) return
      lastScanTsRef.current = now

      // 1) BarcodeDetector（速い）
      if (barcodeRef.current) {
        try {
          const results = await barcodeRef.current.detect(video)
          const hit = results?.find(r => !!r.rawValue)
          if (hit?.rawValue) {
            onDetect(hit.rawValue)
            return
          }
        } catch { /* fallback to jsQR */ }
      }

      // 2) jsQR（確実）
      const canvas = canvasRef.current
      const ctx = canvas.getContext("2d", { willReadFrequently: true } as any) as CanvasRenderingContext2D | null
      if (!ctx) return

      const targetW = Math.min(800, video.videoWidth)
      const scale = targetW / video.videoWidth
      const targetH = Math.floor(video.videoHeight * scale)

      canvas.width = targetW
      canvas.height = targetH
      ctx.drawImage(video, 0, 0, targetW, targetH)

      const imageData = ctx.getImageData(0, 0, targetW, targetH)
      const code = jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: "attemptBoth" })
      if (code?.data) {
        onDetect(code.data)
        return
      }
    }

    rafIdRef.current = requestAnimationFrame(tick)

    // 12秒でタイムアウト → 画像読み取り案内
    failTimeoutRef.current = window.setTimeout(() => {
      stopLoop()
      setError("QRコードを検出できませんでした。明るさやピントを調整するか、画像から読み取ってください。")
    }, 12000)
  }

  const onDetect = (value: string) => {
    onScan(value)
    stopLoop()
    stopCamera()
    if (failTimeoutRef.current) { clearTimeout(failTimeoutRef.current); failTimeoutRef.current = null }
  }

  // 画像ファイル fallback
  const triggerFileSelect = () => fileInputRef.current?.click()
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return
    decodeFromFile(file); e.currentTarget.value = ""
  }

  const decodeFromFile = (file: File) => {
    setError("")
    stopLoop()
    stopCamera()

    const img = new Image()
    const objectUrl = URL.createObjectURL(file)
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas")
        canvas.width = img.width; canvas.height = img.height
        const ctx = canvas.getContext("2d", { willReadFrequently: true } as any) as CanvasRenderingContext2D | null
        if (!ctx) { setError("画像の読み込みに失敗しました。別の画像でお試しください。"); return }
        ctx.drawImage(img, 0, 0)
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const code = jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: "attemptBoth" })
        if (code?.data) onScan(code.data)
        else setError("画像からQRを検出できませんでした。別の角度・解像度でお試しください。")
      } finally {
        URL.revokeObjectURL(objectUrl)
      }
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
          <button onClick={triggerFileSelect}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors flex items-center gap-2">
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
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-48 h-48 border-2 border-white rounded-lg relative">
            <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-purple-500 rounded-tl-lg" />
            <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-purple-500 rounded-tr-lg" />
            <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-purple-500 rounded-bl-lg" />
            <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-purple-500 rounded-br-lg" />
          </div>
        </div>
        {/* スキャンライン */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-48 h-1 opacity-75 animate-pulse bg-purple-500"></div>
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />

      {/* 画像から読み取り（常時） */}
      <div className="mt-4 flex flex-col items-center">
        <button onClick={triggerFileSelect}
          className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors flex items-center gap-2 text-sm">
          <ImageIcon size={16} />
          画像から読み取る
        </button>
        <input ref={fileInputRef} type="file" accept="image/*" capture="environment" onChange={handleFileChange} className="hidden" />
        <p className="text-center text-sm text-gray-600 mt-3">QRコードをカメラに向けてください</p>
      </div>
    </div>
  )
}
