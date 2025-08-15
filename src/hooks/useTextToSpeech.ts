import { useState, useRef, useCallback } from 'react'
import axios from 'axios'

interface SpeechOptions {
  speaker?: number
  speedScale?: number
  pitchScale?: number
  intonationScale?: number
  volumeScale?: number
  prePhonemeLength?: number
  postPhonemeLength?: number
}

interface UseTextToSpeechReturn {
  isLoading: boolean
  isPlaying: boolean
  error: string | null
  speak: (text: string, options?: SpeechOptions) => Promise<void>
  stop: () => void
  clearError: () => void
}

export const useTextToSpeech = (): UseTextToSpeechReturn => {
  const [isLoading, setIsLoading] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const audioUrlRef = useRef<string | null>(null)

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      setIsPlaying(false)
    }
    
    // Blob URLのクリーンアップ
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current)
      audioUrlRef.current = null
    }
  }, [])

  const speak = useCallback(async (text: string, options: SpeechOptions = {}) => {
    if (!text.trim()) {
      setError('読み上げるテキストが空です')
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      
      // 既存の音声を停止
      stop()

      console.log('🔊 音声合成開始:', text)

      // デフォルトのオプションを設定
      const speechParams = {
        text: text.trim(),
        speaker: options.speaker ?? 3,
        speedScale: options.speedScale ?? 1,
        pitchScale: options.pitchScale ?? 0,
        intonationScale: options.intonationScale ?? 0,
        volumeScale: options.volumeScale ?? 0,
        prePhonemeLength: options.prePhonemeLength ?? 0,
        postPhonemeLength: options.postPhonemeLength ?? 0
      }

      // 音声合成APIを呼び出し
      const response = await axios.post('/api/speech', speechParams, {
        responseType: 'blob',
        timeout: 30000, // 30秒タイムアウト
        headers: {
          'Content-Type': 'application/json'
        }
      })

      console.log('✅ 音声合成完了:', response.data.size, 'bytes')

      // Blob URLを作成
      const audioBlob = new Blob([response.data], { type: 'audio/wav' })
      const audioUrl = URL.createObjectURL(audioBlob)
      audioUrlRef.current = audioUrl

      // Audio要素を作成して再生
      const audio = new Audio(audioUrl)
      audioRef.current = audio

      // 音声再生イベントハンドラー
      audio.onloadstart = () => {
        console.log('🎵 音声読み込み開始')
      }

      audio.oncanplay = () => {
        console.log('🎵 音声再生準備完了')
      }

      audio.onplay = () => {
        console.log('▶️ 音声再生開始')
        setIsPlaying(true)
        setIsLoading(false)
      }

      audio.onended = () => {
        console.log('⏹️ 音声再生完了')
        setIsPlaying(false)
        // Blob URLのクリーンアップ
        if (audioUrlRef.current) {
          URL.revokeObjectURL(audioUrlRef.current)
          audioUrlRef.current = null
        }
      }

      audio.onerror = (e) => {
        console.error('❌ 音声再生エラー:', e)
        setError('音声の再生に失敗しました')
        setIsPlaying(false)
        setIsLoading(false)
        // Blob URLのクリーンアップ
        if (audioUrlRef.current) {
          URL.revokeObjectURL(audioUrlRef.current)
          audioUrlRef.current = null
        }
      }

      audio.onpause = () => {
        console.log('⏸️ 音声再生一時停止')
        setIsPlaying(false)
      }

      // 音声を再生
      await audio.play()

    } catch (error: any) {
      console.error('🚫 音声合成エラー:', error)
      setIsLoading(false)
      setIsPlaying(false)

      // エラーメッセージの詳細化
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        setError('音声合成がタイムアウトしました。しばらく待ってからもう一度お試しください。')
      } else if (error.response?.status === 503) {
        setError('音声合成サービスが利用できません。しばらく待ってからもう一度お試しください。')
      } else if (error.response?.status === 400) {
        setError('音声合成のパラメーターが正しくありません。')
      } else if (error.response?.status >= 500) {
        setError('音声合成サービスでエラーが発生しました。')
      } else if (!navigator.onLine) {
        setError('インターネット接続を確認してください。')
      } else {
        const errorMessage = error.response?.data?.error || error.message || '音声合成に失敗しました'
        setError(`音声合成エラー: ${errorMessage}`)
      }

      // Blob URLのクリーンアップ
      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current)
        audioUrlRef.current = null
      }
    }
  }, [stop])

  return {
    isLoading,
    isPlaying,
    error,
    speak,
    stop,
    clearError
  }
}