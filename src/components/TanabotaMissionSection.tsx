"use client"

import { useState, useEffect } from "react"
import Papa from 'papaparse'
import MissionCard, { Mission } from './MissionCard'
import { motion, AnimatePresence } from "framer-motion"
import { Cherry_Bomb_One } from "next/font/google"

const cherry = Cherry_Bomb_One({ weight: "400", subsets: ["latin"], display: "swap" })

export default function TanabotaMissionSection() {
  const [missions, setMissions] = useState<Mission[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [completedMissions, setCompletedMissions] = useState<number[]>([])

  // ローカルストレージから完了済みミッションを読み込み
  useEffect(() => {
    const savedCompleted = localStorage.getItem('completed_missions')
    if (savedCompleted) {
      try {
        const parsed = JSON.parse(savedCompleted)
        setCompletedMissions(Array.isArray(parsed) ? parsed : [])
      } catch (e) {
        console.warn('Failed to parse completed missions from localStorage')
        setCompletedMissions([])
      }
    }
  }, [])

  // CSVファイルからミッションデータを読み込み
  useEffect(() => {
    const fetchMissions = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch(`/api/missions?t=${Date.now()}`)
        if (!response.ok) {
          throw new Error(`Failed to fetch missions: ${response.status}`)
        }
        
        const csvText = await response.text()
        
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          transform: (value: string, field: string) => {
            // 数値フィールドの変換
            if (field === 'id' || field === 'reward') {
              const num = parseInt(value, 10)
              return isNaN(num) ? value : num
            }
            return value.trim()
          },
          complete: (results) => {
            if (results.errors.length > 0) {
              console.warn('CSV parsing errors:', results.errors)
            }
            
            const validMissions = results.data
              .filter((row: any) => row.id && row.title && row.status === 'active')
              .map((row: any) => ({
                id: typeof row.id === 'number' ? row.id : parseInt(row.id, 10),
                title: row.title || '',
                subtitle: row.subtitle || '',
                reward: typeof row.reward === 'number' ? row.reward : parseInt(row.reward, 10) || 0,
                button_text: row.button_text || 'アクション',
                image_path: row.image_path || '',
                status: row.status || 'inactive',
                category: row.category || 'general'
              })) as Mission[]
            
            setMissions(validMissions)
          },
          error: (error: any) => {
            throw new Error(`CSV parsing failed: ${error.message}`)
          }
        })
      } catch (err) {
        console.error('Error fetching missions:', err)
        setError(err instanceof Error ? err.message : 'ミッションの読み込みに失敗しました')
      } finally {
        setLoading(false)
      }
    }

    fetchMissions()
  }, [])

  // ミッション完了ハンドラー
  const handleMissionComplete = (missionId: number) => {
    if (!completedMissions.includes(missionId)) {
      const newCompleted = [...completedMissions, missionId]
      setCompletedMissions(newCompleted)
      localStorage.setItem('completed_missions', JSON.stringify(newCompleted))
    }
  }

  // ローディング状態
  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className={`text-2xl mb-3 text-center text-gray-700 ${cherry.className}`}>
          たなぼたミッション！
        </h2>
        <div className="flex items-center justify-center py-8">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
          <span className="ml-3 text-sm text-gray-600">ミッションを読み込み中...</span>
        </div>
      </div>
    )
  }

  // エラー状態
  if (error) {
    return (
      <div className="space-y-4">
        <h2 className={`text-2xl mb-3 text-center text-gray-700 ${cherry.className}`}>
          たなぼたミッション！
        </h2>
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-red-700 text-sm text-center">
            {error}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-3 w-full px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors"
          >
            再読み込み
          </button>
        </div>
      </div>
    )
  }

  // ミッションが存在しない場合
  if (missions.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className={`text-2xl mb-3 text-center text-gray-700 ${cherry.className}`}>
          たなぼたミッション！
        </h2>
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
          <p className="text-gray-600 text-sm text-center">
            現在利用可能なミッションはありません
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className={`text-2xl mb-3 text-center text-gray-700 ${cherry.className}`}>
        たなぼたミッション！
      </h2>
      
      <div className="space-y-4">
        <AnimatePresence>
          {missions.map((mission) => (
            <MissionCard
              key={mission.id}
              mission={mission}
              onComplete={handleMissionComplete}
              isCompleted={completedMissions.includes(mission.id)}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}