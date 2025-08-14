'use client'

import { useState, FormEvent, ChangeEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import axios from 'axios'
import Header from '../../components/Header'
import Card from '../../components/Card'
import FormField from '../../components/FormField'
import Button from '../../components/Button'
import ErrorMessage from '../../components/ErrorMessage'

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'}/login`,
        formData,
        { withCredentials: true }
      )
      router.push('/')
    } catch (error: any) {
      setError(error.response?.data?.detail || 'ログインに失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <Card maxWidth="md">
      <Header subtitle="ログイン" />
      
      {error && <ErrorMessage message={error} />}

      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField
          label="メールアドレス"
          type="email"
          id="email"
          name="email"
          required
          value={formData.email}
          onChange={handleChange}
        />

        <FormField
          label="パスワード"
          type="password"
          id="password"
          name="password"
          required
          value={formData.password}
          onChange={handleChange}
        />

        <Button
          type="submit"
          loading={loading}
          className="w-full"
        >
          ログイン
        </Button>
      </form>

      <div className="mt-4 text-center">
        <Link href="/register" className="text-blue-600 hover:text-blue-800">
          新規登録はこちら
        </Link>
      </div>
    </Card>
  )
}