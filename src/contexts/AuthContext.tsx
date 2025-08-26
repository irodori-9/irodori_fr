"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export interface User {
  id: number
  nickname?: string
  email?: string
  isAuthenticated: boolean
}

interface AuthContextType {
  user: User | null
  login: (userData: User) => void
  logout: () => void
  updateUser: (userData: Partial<User>) => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // 初期化時にユーザーセッションを確認
    checkUserSession()
  }, [])

  const checkUserSession = async () => {
    try {
      // localStorage から user_id を確認
      const storedUserId = localStorage.getItem('registered_user_id')
      console.log('🔍 AuthContext - checkUserSession:', { storedUserId })
      
      if (!storedUserId) {
        console.log('🔍 AuthContext - No stored user ID found')
        setIsLoading(false)
        return
      }
      const base = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'
      console.log('🔍 AuthContext - Calling backend /me')
      const response = await fetch(`${base}/me`, {
        method: 'GET',
        credentials: 'include',
      })

      console.log('🔍 AuthContext - /me response:', {
        ok: response.ok,
        status: response.status,
        statusText: response.statusText,
      })

      if (response.ok) {
        const userData = await response.json()
        console.log('🔍 AuthContext - /me data received:', userData)
        const userObj = {
          id: userData.user_id ?? parseInt(storedUserId),
          nickname: userData.nickname,
          email: userData.email,
          isAuthenticated: true,
        }
        console.log('🔍 AuthContext - Setting user from /me:', userObj)
        setUser(userObj)
      } else {
        // セッション無効でも localStorage は保持（QR用途のID維持）
        console.log('🔍 AuthContext - /me invalid; keeping localStorage, not setting user')
      }
    } catch (error) {
      console.error('🔍 AuthContext - ユーザーセッション確認エラー:', error)
    } finally {
      console.log('🔍 AuthContext - Setting isLoading to false')
      setIsLoading(false)
    }
  }

  const login = (userData: User) => {
    console.log('🔍 AuthContext - login called with:', userData)
    setUser(userData)
    if (userData.id) {
      localStorage.setItem('registered_user_id', userData.id.toString())
      console.log('🔍 AuthContext - Stored user_id in localStorage:', userData.id.toString())
    }
    console.log('🔍 AuthContext - Login completed, user set to:', userData)
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('registered_user_id')
  }

  const updateUser = (userData: Partial<User>) => {
    setUser(prev => prev ? { ...prev, ...userData } : null)
  }

  const value: AuthContextType = {
    user,
    login,
    logout,
    updateUser,
    isLoading,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}