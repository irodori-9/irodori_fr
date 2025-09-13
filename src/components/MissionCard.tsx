"use client"

import { useState } from "react"
import Image from "next/image"
import { motion } from "framer-motion"

export interface Mission {
  id: number
  title: string
  subtitle: string
  reward: number
  button_text: string
  image_path: string
  status: string
  category: string
}

interface MissionCardProps {
  mission: Mission
  onComplete: (missionId: number) => void
  isCompleted: boolean
}

export default function MissionCard({ mission, onComplete, isCompleted }: MissionCardProps) {
  const [isImageError, setIsImageError] = useState(false)

  const handleButtonClick = () => {
    if (!isCompleted) {
      onComplete(mission.id)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`bg-white rounded-xl shadow-sm p-4 ${
        isCompleted ? 'opacity-60' : ''
      }`}
    >
{mission.image_path && !isImageError ? (
        // 画像がある場合のレイアウト
        <div className="flex gap-4">
          <div className="flex-1">
            <h3 className="font-bold text-sm text-gray-800 mb-2">
              {mission.title}
            </h3>
            
            {mission.subtitle && (
              <p className="text-xs text-gray-600 mb-3 leading-relaxed">
                {mission.subtitle}
              </p>
            )}

            <div className="flex items-center">
              <span className="text-lg font-bold text-purple-900">
                ¥{mission.reward.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="flex-shrink-0 flex flex-col items-center gap-2">
            <div className="w-20 h-20 relative overflow-hidden rounded-lg">
              <Image
                src={mission.image_path}
                alt={mission.title}
                fill
                className="object-cover"
                onError={() => setIsImageError(true)}
                sizes="80px"
              />
            </div>
            
            <button
              onClick={handleButtonClick}
              disabled={isCompleted}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                isCompleted
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white hover:opacity-90 shadow-sm'
              }`}
            >
              {isCompleted ? '完了済み' : mission.button_text}
            </button>
          </div>
        </div>
      ) : (
        // 画像がない場合のレイアウト
        <div>
          <h3 className="font-bold text-sm text-gray-800 mb-2">
            {mission.title}
          </h3>
          
          {mission.subtitle && (
            <p className="text-xs text-gray-600 mb-3 leading-relaxed">
              {mission.subtitle}
            </p>
          )}

          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-purple-900">
              ¥{mission.reward.toLocaleString()}
            </span>
            
            <button
              onClick={handleButtonClick}
              disabled={isCompleted}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                isCompleted
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white hover:opacity-90 shadow-sm'
              }`}
            >
              {isCompleted ? '完了済み' : mission.button_text}
            </button>
          </div>
        </div>
      )}
    </motion.div>
  )
}