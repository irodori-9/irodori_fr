'use client'

import { useRouter } from 'next/navigation'
import axios from 'axios'
import Button from '../components/Button'

export default function Home() {
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'}/logout`, {
        withCredentials: true
      })
    } catch (error) {
      // ログアウトエラーでも、ログイン画面に遷移
      console.log('Logout completed')
    } finally {
      router.push('/login')
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-blue-600 mb-2">IRODORI</h1>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">ダッシュボード</h2>
          <p className="text-gray-600">ログインが完了しました</p>
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