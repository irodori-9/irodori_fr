"use client"

import { useState, useRef, useEffect } from "react"
import { LogOut, User, Settings, X } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"

interface HeaderMenuProps {
  isOpen: boolean
  onClose: () => void
}

export default function HeaderMenu({ isOpen, onClose }: HeaderMenuProps) {
  const { user, logout } = useAuth()
  const router = useRouter()
  const menuRef = useRef<HTMLDivElement>(null)

  // メニュー外クリックで閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      return () => {
        document.removeEventListener("mousedown", handleClickOutside)
      }
    }
  }, [isOpen, onClose])

  // ESCキーでメニューを閉じる
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscKey)
      return () => {
        document.removeEventListener("keydown", handleEscKey)
      }
    }
  }, [isOpen, onClose])

  const handleLogout = () => {
    logout()
    onClose()
    router.push("/auth/login")
  }

  const handleProfileClick = () => {
    // プロフィール機能は未実装のため、現在は何もしない
    onClose()
  }

  const handleSettingsClick = () => {
    // 設定機能は未実装のため、現在は何もしない
    onClose()
  }

  if (!isOpen) return null

  return (
    <>
      {/* オーバーレイ */}
      <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />
      
      {/* メニュー */}
      <div
        ref={menuRef}
        className="fixed top-4 right-4 w-64 bg-white rounded-2xl shadow-lg border border-gray-200 z-50 animate-in slide-in-from-top-2 duration-200"
      >
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">メニュー</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="閉じる"
          >
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        {/* ユーザー情報 */}
        {user && (
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <User size={20} className="text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">
                  {user.nickname || "ユーザー"}
                </p>
                <p className="text-sm text-gray-500 truncate">
                  {user.email}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* メニューアイテム */}
        <div className="py-2">
          <button
            onClick={handleProfileClick}
            className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center gap-3 text-gray-700"
          >
            <User size={18} />
            <span>プロフィール</span>
          </button>

          <button
            onClick={handleSettingsClick}
            className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center gap-3 text-gray-700"
          >
            <Settings size={18} />
            <span>設定</span>
          </button>

          <hr className="my-2" />

          <button
            onClick={handleLogout}
            className="w-full px-4 py-3 text-left hover:bg-red-50 transition-colors flex items-center gap-3 text-red-600"
          >
            <LogOut size={18} />
            <span>ログアウト</span>
          </button>
        </div>
      </div>
    </>
  )
}