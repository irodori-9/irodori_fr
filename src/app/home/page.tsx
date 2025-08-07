"use client"

import { useState, useEffect } from "react"
import { Heart, Mic, User } from 'lucide-react'
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"

const summaryData = [
  { label: "貯金した額", value: "¥500,000" },
  { label: "投資した額", value: "¥1,000,000" },
  { label: "節約した額", value: "¥500,000" },
  { label: "いいね(今週)", value: "112", icon: Heart },
]

export default function HomePage() {
  const [isChatExpanded, setIsChatExpanded] = useState(false)
  const [showBotResponse, setShowBotResponse] = useState(false)
  const [isThinking, setIsThinking] = useState(false)
  const [isListening, setIsListening] = useState(false)

  useEffect(() => {
    if (isChatExpanded && !isListening) {
      // ユーザーメッセージ表示後すぐに考え中状態にする
      setIsThinking(true)
      
      const timer = setTimeout(() => {
        setIsThinking(false)
        setShowBotResponse(true)
      }, 5000) // 5秒後にボットの返事を表示

      return () => clearTimeout(timer)
    } else if (!isChatExpanded && !isListening) {
      // リスニング中でない場合のみリセット
      setShowBotResponse(false)
      setIsThinking(false)
    }
  }, [isChatExpanded, isListening])

  const handleSpeakButtonClick = () => {
    if (isListening) {
      // 聞いている状態を終了
      setIsListening(false)
      setIsChatExpanded(true)
    } else {
      // 聞いている状態を開始
      setIsListening(true)
      setIsChatExpanded(false)
      setShowBotResponse(false)
      setIsThinking(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Chatbot Card */}
      <motion.div
        layout
        className="p-4 bg-purple-200/60 rounded-3xl shadow-lg overflow-hidden"
        transition={{ duration: 0.5, type: "spring" }}
      >
        <div className="flex items-center gap-2">
          <div className="flex-shrink-0">
            <Image src="/piggy-bank.png" alt="Piggy bank character" width={80} height={80} />
          </div>
          <div className="relative flex-1">
            <div className="bg-white text-gray-800 p-4 rounded-xl shadow-sm">
              <p className="font-bold text-sm leading-relaxed">今日もお仕事お疲れ様プイ！</p>
              <p className="text-sm leading-relaxed">お金のことで困ったことがあれば聞かせてほしいプイ！</p>
            </div>
            {/* Speech bubble tail */}
            <div className="absolute top-1/2 -left-2 -translate-y-1/2 w-0 h-0 border-t-8 border-t-transparent border-r-8 border-r-white border-b-8 border-b-transparent" />
          </div>
        </div>

        <AnimatePresence>
          {isChatExpanded && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="mt-4"
            >
              <div className="flex items-center justify-end gap-2">
                <div className="relative flex-1">
                  <div className="bg-purple-500 text-white p-4 rounded-xl shadow-sm">
                    <p className="text-sm leading-relaxed">
                      「推しかつ」にお金を使いすぎて他の趣味、生活費が削られて後悔しないか心配。自分にとっての最適なバランスを知りたい。
                    </p>
                  </div>
                  {/* Speech bubble tail */}
                  <div className="absolute top-1/2 -right-2 -translate-y-1/2 w-0 h-0 border-t-8 border-t-transparent border-l-8 border-l-purple-500 border-b-8 border-b-transparent" />
                </div>
                <div className="flex-shrink-0 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                  <User size={24} className="text-gray-400" />
                </div>
              </div>
              
              {/* Thinking indicator */}
              {isThinking && !showBotResponse && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="mt-4 flex items-center gap-2"
                >
                  <div className="flex-shrink-0">
                    <Image src="/piggy-bank-walking.png" alt="TANABUTA thinking" width={48} height={48} className="animate-pulse" />
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
              
              {/* Chatbot response */}
              {showBotResponse && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-4 flex items-center gap-2"
                >
                  <div className="flex-shrink-0">
                    <Image src="/piggy-bank.png" alt="Piggy bank character" width={48} height={48} />
                  </div>
                  <div className="relative flex-1">
                    <div className="bg-white text-gray-800 p-4 rounded-xl shadow-sm">
                      <p className="text-sm leading-relaxed">
                        推しかつにお金を使いすぎると、他のことができなくなって後悔しちゃうブヒよね。だから、推しかつ用のお金を毎月決めて、その中で楽しむのがコツブヒ！無理せずバランスよく楽しもうブヒ！
                      </p>
                    </div>
                    {/* Speech bubble tail */}
                    <div className="absolute top-1/2 -left-2 -translate-y-1/2 w-0 h-0 border-t-8 border-t-transparent border-r-8 border-r-white border-b-8 border-b-transparent" />
                  </div>
                </motion.div>
              )}
              
            </motion.div>
          )}
        </AnimatePresence>

        {/* Listening UI */}
        {isListening && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="mt-4 flex items-center gap-2"
          >
            <div className="flex-shrink-0">
              <Image src="/piggy-bank-walking.png" alt="TANABUTA listening" width={48} height={48} className="animate-pulse" />
            </div>
            <div className="relative flex-1">
              <div className="bg-blue-100 text-blue-800 p-4 rounded-xl shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="flex space-x-1">
                    <div className="w-3 h-3 bg-blue-500 rounded-full animate-ping"></div>
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-ping" style={{ animationDelay: '200ms' }}></div>
                    <div className="w-2 h-2 bg-blue-300 rounded-full animate-ping" style={{ animationDelay: '400ms' }}></div>
                  </div>
                  <span className="text-sm font-medium">TANABUTAちゃんが聞いています...</span>
                </div>
              </div>
              {/* Speech bubble tail */}
              <div className="absolute top-1/2 -left-2 -translate-y-1/2 w-0 h-0 border-t-8 border-t-transparent border-r-8 border-r-blue-100 border-b-8 border-b-transparent" />
            </div>
          </motion.div>
        )}

        <button
          onClick={handleSpeakButtonClick}
          className={`mt-4 w-full py-3 text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg hover:opacity-90 transition-opacity ${
            isListening 
              ? 'bg-gradient-to-r from-red-500 to-pink-500' 
              : 'bg-gradient-to-r from-purple-500 to-fuchsia-500'
          }`}
        >
          <Mic size={20} />
          {isListening ? '終了' : 'はなす'}
        </button>
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
  )
}
