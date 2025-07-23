'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import Button from '../components/Button'

interface User {
  id: number
  last_name: string
  first_name: string
  email: string
  birth_date: string
  postal_code: string
  address: string
  phone_number: string
  occupation: string
  company_name: string
}

export default function Home() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'}/me`, {
        withCredentials: true
      })
      setUser(response.data)
    } catch (error) {
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'}/logout`, {
        withCredentials: true
      })
      router.push('/login')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  if (loading) {
    return <div className="text-center">Loading...</div>
  }

  if (!user) {
    return <div className="text-center">Redirecting to login...</div>
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-blue-600 mb-2">IRODORI</h1>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">ログイン済み</h2>
          <p className="text-gray-600">こんにちは、{user.first_name} {user.last_name}さん</p>
        </div>

        <Button
          variant="danger"
          onClick={handleLogout}
          className="w-full"
          size="lg"
        >
          ログアウト
        </Button>
      </div>
    </div>
  )
}