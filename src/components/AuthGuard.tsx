"use client"

import { useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Image from "next/image"

interface AuthGuardProps {
  children: ReactNode
  redirectTo?: string
}

export function AuthGuard({ children, redirectTo = '/auth/login' }: AuthGuardProps) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && (!user || !user.isAuthenticated)) {
      console.log('🔒 AuthGuard - Redirecting to login:', { user, isLoading })
      router.replace(redirectTo)
    }
  }, [user, isLoading, router, redirectTo])

  // ローディング中の表示
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="p-4 bg-purple-200/60 rounded-3xl shadow-lg overflow-hidden">
          <div className="flex items-center gap-2">
            <div className="flex-shrink-0">
              <Image src="/piggy-bank.png" alt="Piggy bank character" width={80} height={80} />
            </div>
            <div className="relative flex-1">
              <div className="bg-white text-gray-800 p-4 rounded-xl shadow-sm">
                <p className="font-bold text-sm leading-relaxed">認証情報を確認中プイ...</p>
                <p className="text-sm leading-relaxed">少々お待ちください。</p>
              </div>
              <div className="absolute top-1/2 -left-2 -translate-y-1/2 w-0 h-0 border-t-8 border-t-transparent border-r-8 border-r-white border-b-8 border-b-transparent" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 認証されていない場合は何も表示しない（リダイレクト処理中）
  if (!user || !user.isAuthenticated) {
    return null
  }

  // 認証されている場合は子コンポーネントを表示
  return <>{children}</>
}