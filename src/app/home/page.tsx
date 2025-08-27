"use client"

import { useState, useEffect, useRef } from "react"
import { Heart, Mic, User, Volume2, VolumeX } from 'lucide-react'
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import axios from 'axios'
import { useTextToSpeech } from '@/hooks/useTextToSpeech'
import { useAuth } from '@/contexts/AuthContext'
import { AuthGuard } from '@/components/AuthGuard'

const summaryData = [
  { label: "貯金した額", value: "¥43,200" },
  { label: "投資した額", value: "¥13,000" },
  { label: "節約した額", value: "¥34,000" },
  { label: "いいね(今週)", value: "112", icon: Heart },
]

export default function HomePage() {
  const [isListening, setIsListening] = useState(false)
  const [isThinking, setIsThinking] = useState(false)
  const [messages, setMessages] = useState<{type: 'user' | 'bot', text: string}[]>([])
  const [error, setError] = useState('')
  const [recordingTime, setRecordingTime] = useState(0)
  const [speechEnabled, setSpeechEnabled] = useState(true)
  const [sessionId, setSessionId] = useState<string | null>(null)
  
  // 認証フック
  const { user } = useAuth()
  
  
  // 音声合成フック
  const { 
    isLoading: isSynthesizing, 
    isPlaying: isSpeaking, 
    error: speechError, 
    requiresManualPlay,
    audioReady,
    speak, 
    playManually,
    stop: stopSpeech, 
    clearError: clearSpeechError 
  } = useTextToSpeech()
  
  // 音声録音用の ref と state
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null)
  
  // 録音時間の上限（秒）
  const MAX_RECORDING_TIME = 30

  // 音声録音を開始する関数
  const startRecording = async () => {
    console.log('🎤 startRecording called')
    try {
      setError('')
      setRecordingTime(0)
      
      console.log('🔍 Browser support check...')
      // ブラウザサポートチェック
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.error('❌ Browser does not support audio recording')
        throw new Error('このブラウザは音声録音をサポートしていません')
      }
      
      console.log('✅ Browser supports audio recording')
      
      console.log('🎧 Requesting microphone permission...')
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        }
      })
      console.log('✅ Microphone permission granted, stream obtained')
      streamRef.current = stream
      
      // m4a形式をサポートするように修正
      let mimeType = 'audio/mp4'
      if (MediaRecorder.isTypeSupported('audio/mp4; codecs=mp4a.40.2')) {
        mimeType = 'audio/mp4; codecs=mp4a.40.2' // AAC codec for m4a-like quality
      } else if (MediaRecorder.isTypeSupported('audio/webm; codecs=opus')) {
        mimeType = 'audio/webm; codecs=opus'
      } else if (MediaRecorder.isTypeSupported('audio/webm')) {
        mimeType = 'audio/webm'
      }
      
      const mediaRecorder = new MediaRecorder(stream, { mimeType })
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }
      
      mediaRecorder.onstop = () => {
        processAudioData()
      }
      
      mediaRecorder.onerror = (event) => {
        console.error('Recording error:', event)
        setError('録音中にエラーが発生しました')
        stopRecording()
      }
      
      mediaRecorder.start()
      setIsListening(true)
      
      // 録音時間をカウント
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= MAX_RECORDING_TIME) {
            stopRecording()
            return prev
          }
          return prev + 1
        })
      }, 1000)
      
      // 最大録音時間で自動停止
      setTimeout(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          stopRecording()
        }
      }, MAX_RECORDING_TIME * 1000)
      
    } catch (error: any) {
      console.error('❌ Error starting recording:', error)
      console.error('Error name:', error.name)
      console.error('Error message:', error.message)
      console.error('Full error:', error)
      
      if (error.name === 'NotAllowedError') {
        console.log('🚫 Microphone permission denied')
        setError('マイクの使用を許可してください。ブラウザの設定でマイクへのアクセスを有効にしてください。')
      } else if (error.name === 'NotFoundError') {
        console.log('🔍 Microphone not found')
        setError('マイクが見つかりません。マイクが接続されているか確認してください。')
      } else {
        console.log('⚠️ Unknown error:', error.message)
        setError(error.message || '音声録音の開始に失敗しました')
      }
    }
  }
  
  // 音声録音を停止する関数
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop()
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current)
      recordingTimerRef.current = null
    }
    
    setIsListening(false)
    setRecordingTime(0)
  }
  
  // 音声データを処理してAPIに送信する関数（要件定義書通り）
  const processAudioData = async () => {
    try {
      setIsThinking(true)
      
      // 音声データの検証
      if (audioChunksRef.current.length === 0) {
        throw new Error('音声データが記録されていません')
      }
      
      const mimeType = mediaRecorderRef.current?.mimeType || 'audio/webm'
      const audioBlob = new Blob(audioChunksRef.current, { type: mimeType })
      
      // ファイルサイズチェック (5MB制限)
      if (audioBlob.size > 5 * 1024 * 1024) {
        throw new Error('音声ファイルが大きすぎます。録音時間を短くしてください。')
      }
      
      const formData = new FormData()
      // m4a形式に対応したファイル名生成
      let fileName = 'recording.m4a'
      if (mimeType.includes('webm')) {
        fileName = 'recording.webm'
      } else if (mimeType.includes('mp4')) {
        fileName = 'recording.m4a'
      }
      formData.append('file', audioBlob, fileName)
      
      console.log('音声データの詳細:', {
        size: audioBlob.size,
        type: audioBlob.type,
        fileName: fileName,
        mimeType: mimeType
      })
      
      // 文字起こしAPI呼び出し（Next.js rewriteを使用してCORSを回避）
      console.log('📡 Calling transcribe API via Next.js rewrite...')
      const transcribeResponse = await axios.post(
        `/api/transcribe`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          withCredentials: true,
          timeout: 30000 // 30秒タイムアウト
        }
      )
      
      console.log('文字起こしAPI応答:', transcribeResponse.data)
      
      // 文字起こし結果を取得（複数の形式に対応）
      const transcribedText = transcribeResponse.data.text || 
                             transcribeResponse.data.transcription || 
                             transcribeResponse.data.result || 
                             transcribeResponse.data
      
      if (!transcribedText || transcribedText.trim() === '') {
        throw new Error('音声を認識できませんでした。もう一度はっきりと話してください。')
      }
      
      console.log('文字起こし結果:', transcribedText)
      
      // ステップ7: 文字起こし結果をユーザーメッセージとして表示
      setMessages(prev => [...prev, { type: 'user', text: transcribedText }])
      
      // 少し待機してからフィードバックAPIを呼び出す
      await new Promise(resolve => setTimeout(resolve, 500))
      
      console.log('フィードバックAPI呼び出し開始:', transcribedText)
      console.log('現在のsession_id:', sessionId)
      
      // 認証状態チェック
      if (!user?.id) {
        throw new Error('チャットボット機能を利用するにはログインが必要です。ログインしてから再度お試しください。')
      }
      
      // フィードバックAPIのリクエストボディを構築
      const feedbackRequestBody: any = {
        text: transcribedText,
        user_id: user.id // 認証済みユーザーID
      }
      
      // session_idがある場合は含める（2回目以降）
      if (sessionId) {
        feedbackRequestBody.session_id = sessionId
      }
      
      console.log('フィードバックAPIリクエスト:', feedbackRequestBody)
      
      // ステップ8: フィードバックAPI呼び出し（Next.js rewriteを使用してCORSを回避）
      const feedbackResponse = await axios.post(
        `/api/feedback`,
        feedbackRequestBody,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          withCredentials: true,
          timeout: 15000 // 15秒タイムアウト
        }
      )
      
      console.log('フィードバックAPI応答:', feedbackResponse.data)
      
      // レスポンス構造に応じて適切にデータを取得
      const responseData = feedbackResponse.data.result || feedbackResponse.data
      const botResponse = responseData.message || responseData.feedback
      
      // session_idが返された場合は保存（初回応答）
      if (responseData.session_id && !sessionId) {
        console.log('新しいsession_idを保存:', responseData.session_id)
        setSessionId(responseData.session_id)
      }
      
      if (!botResponse || botResponse.trim() === '') {
        throw new Error('TANABUTAちゃんからの応答を取得できませんでした')
      }
      
      console.log('Bot応答:', botResponse)
      
      // ステップ9: 音声合成が有効な場合は音声を生成してから表示・再生
      if (speechEnabled) {
        try {
          console.log('🔊 音声合成開始:', botResponse)
          // 音声合成を実行（音声準備完了まで待機）
          await speak(botResponse)
          console.log('✅ 音声合成完了、メッセージ表示')
          // 音声準備完了後にメッセージを表示（音声は自動再生される）
          setMessages(prev => [...prev, { type: 'bot', text: botResponse }])
        } catch (speechErr) {
          console.warn('⚠️ 音声合成に失敗、テキストのみ表示:', speechErr)
          // 音声合成に失敗してもテキストは表示
          setMessages(prev => [...prev, { type: 'bot', text: botResponse }])
        }
      } else {
        // 音声無効時はテキストのみ表示
        setMessages(prev => [...prev, { type: 'bot', text: botResponse }])
      }
      
    } catch (error: any) {
      console.error('Error processing audio:', error)
      
      // APIレスポンスの詳細エラー情報を確認
      const errorDetail = error.response?.data?.detail || error.response?.data?.message || error.response?.data
      const errorMessage = typeof errorDetail === 'string' ? errorDetail : JSON.stringify(errorDetail)
      
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        setError('通信がタイムアウトしました。インターネット接続を確認してもう一度お試しください。')
      } else if (error.response?.status === 401) {
        setError('認証が必要です。ログインしてください。')
      } else if (error.response?.status >= 500) {
        // Azure backend特有のエラーをチェック
        if (errorMessage && errorMessage.includes('RecipeWithUserAndRulesWithTriggerAndAction')) {
          setError('現在サーバー側で技術的な問題が発生しています。開発チームが修正中です。しばらくしてからもう一度お試しください。')
        } else {
          setError('サーバーエラーが発生しました。しばらく待ってからもう一度お試しください。')
        }
      } else if (errorMessage && errorMessage.includes('unsupported_country_region_territory')) {
        setError('申し訳ございません。現在この地域からはAI機能をご利用いただけません。開発チームが対応中です。')
      } else if (errorMessage && errorMessage.includes('Country, region, or territory not supported')) {
        setError('申し訳ございません。現在この地域からはAI機能をご利用いただけません。開発チームが対応中です。')
      } else if (error.response?.status === 403) {
        setError('アクセスが制限されています。しばらく時間をおいてからお試しください。')
      } else if (!navigator.onLine) {
        setError('インターネット接続を確認してください。')
      } else {
        // デバッグ用の詳細なエラー情報を含む
        const detailedError = errorMessage && errorMessage !== 'undefined' 
          ? `音声の処理に失敗しました。詳細: ${errorMessage}` 
          : error.message || '音声の処理に失敗しました。もう一度お試しください。'
        setError(detailedError)
      }
    } finally {
      setIsThinking(false)
    }
  }
  
  const handleSpeakButtonClick = () => {
    console.log('👆 Speak button clicked, isListening:', isListening)
    if (isListening) {
      console.log('🛑 Stopping recording...')
      stopRecording()
    } else {
      console.log('▶️ Starting recording...')
      startRecording()
    }
  }
  
  // クリーンアップ
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current)
      }
    }
  }, [])


  return (
    <AuthGuard>
      <div className="space-y-6">
      {/* Chatbot Card */}
      <motion.div
        layout
        className="p-4 bg-purple-200/60 rounded-3xl shadow-lg overflow-hidden"
        transition={{ duration: 0.5, type: "spring" }}
      >
        <div className="flex items-center gap-2">
          <div className="flex-shrink-0">
            <Image src="/images/mascot/pig.png" alt="Piggy bank character" width={80} height={80} />
          </div>
          <div className="relative flex-1">
            <div className="bg-white text-gray-800 p-4 rounded-xl shadow-sm">
              <p className="font-bold text-sm leading-relaxed">今日もお仕事お疲れ様ブヒ！</p>
              <p className="text-sm leading-relaxed">お金のことで困ったことがあれば聞かせてほしいブヒ！</p>
            </div>
            {/* Speech bubble tail */}
            <div className="absolute top-1/2 -left-2 -translate-y-1/2 w-0 h-0 border-t-8 border-t-transparent border-r-8 border-r-white border-b-8 border-b-transparent" />
          </div>
        </div>

        {/* Error Messages */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-4 bg-red-100 border border-red-300 rounded-xl"
          >
            <p className="text-red-700 text-sm">{error}</p>
            <button
              onClick={() => setError('')}
              className="mt-2 text-red-600 underline text-sm"
            >
              閉じる
            </button>
          </motion.div>
        )}
        
        {/* Speech Error Message */}
        {speechError && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-4 bg-yellow-100 border border-yellow-300 rounded-xl"
          >
            <p className="text-yellow-700 text-sm">🔊 {speechError}</p>
            <button
              onClick={clearSpeechError}
              className="mt-2 text-yellow-600 underline text-sm"
            >
              閉じる
            </button>
          </motion.div>
        )}
        
        {/* Speech Controls */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">音声読み上げ:</span>
            <button
              onClick={() => setSpeechEnabled(!speechEnabled)}
              className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                speechEnabled 
                  ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              {speechEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
              {speechEnabled ? 'ON' : 'OFF'}
            </button>
          </div>
          
          {/* Stop Speech Button */}
          {isSpeaking && (
            <button
              onClick={stopSpeech}
              className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium hover:bg-red-200 transition-colors"
            >
              ⏹️ 停止
            </button>
          )}
        </div>

        <AnimatePresence>
          {(messages.length > 0 || isThinking) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="mt-4"
            >
              {/* Messages */}
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <div key={index} className={`flex items-center gap-2 ${
                    message.type === 'user' ? 'justify-end' : 'justify-start'
                  }`}>
                    {message.type === 'bot' && (
                      <div className="flex-shrink-0 relative">
                        <Image src="/images/mascot/pig.png" alt="TANABUTA" width={48} height={48} />
                        {/* Speaking indicator */}
                        {isSpeaking && index === messages.length - 1 && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
                          </div>
                        )}
                      </div>
                    )}
                    <div className="relative flex-1 max-w-xs">
                      <div className={`p-4 rounded-xl shadow-sm ${
                        message.type === 'user' 
                          ? 'bg-purple-500 text-white' 
                          : 'bg-white text-gray-800'
                      }`}>
                        <div className="space-y-2">
                          <p className="text-sm leading-relaxed">{message.text}</p>
                          {/* Manual play button for bot messages */}
                          {message.type === 'bot' && speechEnabled && index === messages.length - 1 && (
                            <div className="flex items-center gap-2">
                              {requiresManualPlay && audioReady ? (
                                <button
                                  onClick={playManually}
                                  className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium hover:bg-blue-200 transition-colors"
                                >
                                  <Volume2 size={14} />
                                  <span>音声を聞く</span>
                                </button>
                              ) : isSpeaking ? (
                                <div className="flex items-center gap-1 text-green-600">
                                  <Volume2 size={14} className="animate-pulse" />
                                  <span className="text-xs">再生中</span>
                                </div>
                              ) : isSynthesizing ? (
                                <div className="flex items-center gap-1 text-gray-500">
                                  <Volume2 size={14} className="animate-pulse" />
                                  <span className="text-xs">音声準備中...</span>
                                </div>
                              ) : (
                                <Volume2 size={14} className="text-gray-400" />
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      {/* Speech bubble tail */}
                      <div className={`absolute top-1/2 -translate-y-1/2 w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent ${
                        message.type === 'user' 
                          ? '-right-2 border-l-8 border-l-purple-500' 
                          : '-left-2 border-r-8 border-r-white'
                      }`} />
                    </div>
                    {message.type === 'user' && (
                      <div className="flex-shrink-0 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                        <User size={24} className="text-gray-400" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              {/* Thinking indicator */}
              {isThinking && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="mt-4 flex items-center gap-2"
                >
                  <div className="flex-shrink-0">
                    <Image src="/images/mascot/pig-analyzing.png" alt="TANABUTA thinking" width={48} height={48} className="animate-pulse" />
                  </div>
                  <div className="relative flex-1">
                    <div className="bg-gray-100 text-gray-600 p-4 rounded-xl shadow-sm">
                      <div className="flex items-center gap-2">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                        <span className="text-sm">TANABUTAちゃんが考え中...</span>
                      </div>
                    </div>
                    {/* Speech bubble tail */}
                    <div className="absolute top-1/2 -left-2 -translate-y-1/2 w-0 h-0 border-t-8 border-t-transparent border-r-8 border-r-gray-100 border-b-8 border-b-transparent" />
                  </div>
                </motion.div>
              )}
              
              {/* Speech Synthesis indicator */}
              {isSynthesizing && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="mt-4 flex items-center gap-2"
                >
                  <div className="flex-shrink-0">
                    <Image src="/images/mascot/pig-analyzing.png" alt="TANABUTA synthesizing speech" width={48} height={48} className="animate-pulse" />
                  </div>
                  <div className="relative flex-1">
                    <div className="bg-blue-100 text-blue-600 p-4 rounded-xl shadow-sm">
                      <div className="flex items-center gap-2">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping"></div>
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-ping" style={{ animationDelay: '200ms' }}></div>
                          <div className="w-2 h-2 bg-blue-300 rounded-full animate-ping" style={{ animationDelay: '400ms' }}></div>
                        </div>
                        <span className="text-sm">🔊 音声を準備中...</span>
                      </div>
                    </div>
                    {/* Speech bubble tail */}
                    <div className="absolute top-1/2 -left-2 -translate-y-1/2 w-0 h-0 border-t-8 border-t-transparent border-r-8 border-r-blue-100 border-b-8 border-b-transparent" />
                  </div>
                </motion.div>
              )}
              
              
            </motion.div>
          )}
        </AnimatePresence>

        {/* Listening UI */}
        <AnimatePresence>
          {isListening && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="mt-4 flex items-center gap-2"
            >
              <div className="flex-shrink-0">
                <Image src="/images/mascot/pig-analyzing.png" alt="TANABUTA listening" width={48} height={48} className="animate-pulse" />
              </div>
              <div className="relative flex-1">
                <div className="bg-blue-100 text-blue-800 p-4 rounded-xl shadow-sm">
                  <div className="flex items-center gap-2">
                    <div className="flex space-x-1">
                      <div className="w-3 h-3 bg-blue-500 rounded-full animate-ping"></div>
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-ping" style={{ animationDelay: '200ms' }}></div>
                      <div className="w-2 h-2 bg-blue-300 rounded-full animate-ping" style={{ animationDelay: '400ms' }}></div>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">TANABUTAちゃんが聞いています...</span>
                      <span className="text-xs text-blue-600 mt-1">{recordingTime}s / {MAX_RECORDING_TIME}s</span>
                    </div>
                  </div>
                </div>
                {/* Speech bubble tail */}
                <div className="absolute top-1/2 -left-2 -translate-y-1/2 w-0 h-0 border-t-8 border-t-transparent border-r-8 border-r-blue-100 border-b-8 border-b-transparent" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 認証状態に基づくボタン表示 */}
        {user?.id ? (
          <button
            onClick={handleSpeakButtonClick}
            disabled={isThinking}
            className={`mt-4 w-full py-3 text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg transition-all ${
              isThinking 
                ? 'bg-gray-400 cursor-not-allowed' 
                : isListening 
                ? 'bg-gradient-to-r from-red-500 to-pink-500 hover:opacity-90' 
                : 'bg-gradient-to-r from-purple-500 to-fuchsia-500 hover:opacity-90'
            }`}
          >
            <Mic size={20} />
            {isThinking ? '処理中...' : isListening ? '終了' : 'はなす'}
          </button>
        ) : (
          <div className="mt-4 text-center">
            <div className="bg-amber-100 border border-amber-300 rounded-2xl p-4 mb-3">
              <p className="text-amber-800 text-sm font-medium">
                🔒 チャットボット機能を利用するにはログインが必要です
              </p>
            </div>
            <a 
              href="/auth/login"
              className="inline-block w-full py-3 bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white font-bold rounded-2xl hover:opacity-90 transition-opacity"
            >
              ログインページへ
            </a>
          </div>
        )}
      </motion.div>

      {/* Monthly Summary */}
      <div>
        <h2 className="font-bold text-lg mb-3 text-center text-gray-700">マンスリーサマリー</h2>
        <div className="grid grid-cols-2 gap-4">
          {summaryData.map((item, index) => (
            <div key={index} className="p-4 bg-purple-100/70 rounded-2xl text-center shadow-sm">
              <p className="text-sm text-purple-800/80 font-medium">{item.label}</p>
              <div className="flex items-center justify-center gap-1 mt-1">
                {item.icon && <item.icon className="text-red-500 fill-current" size={20} />}
                <p className="text-xl font-bold text-purple-900">{item.value}</p>
              </div>
            </div>
          ))}
        </div>
        </div>
      </div>
    </AuthGuard>
  )
}