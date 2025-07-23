'use client'

import { useState, FormEvent, ChangeEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import axios from 'axios'

interface FormData {
  last_name: string
  first_name: string
  email: string
  birthdate: string
  postal_code: string
  address: string
  phone_number: string
  occupation: string
  company_name: string
  password: string
  password_confirm: string
}

export default function Register() {
  const [formData, setFormData] = useState<FormData>({
    last_name: '',
    first_name: '',
    email: '',
    birthdate: '',
    postal_code: '',
    address: '',
    phone_number: '',
    occupation: '',
    company_name: '',
    password: '',
    password_confirm: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    // 必須項目チェック
    if (!formData.last_name.trim()) newErrors.last_name = '姓は必須です'
    if (!formData.first_name.trim()) newErrors.first_name = '名は必須です'
    if (!formData.email.trim()) newErrors.email = 'メールアドレスは必須です'
    if (!formData.birthdate) newErrors.birthdate = '生年月日は必須です'
    if (!formData.postal_code.trim()) newErrors.postal_code = '郵便番号は必須です'
    if (!formData.address.trim()) newErrors.address = '住所は必須です'
    if (!formData.phone_number.trim()) newErrors.phone_number = '電話番号は必須です'
    if (!formData.occupation.trim()) newErrors.occupation = '職業は必須です'
    if (!formData.company_name.trim()) newErrors.company_name = '勤務先名は必須です'
    if (!formData.password) newErrors.password = 'パスワードは必須です'
    if (!formData.password_confirm) newErrors.password_confirm = 'パスワード確認は必須です'

    // メールアドレス形式チェック
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'メールアドレスの形式が正しくありません'
    }

    // パスワード長さチェック
    if (formData.password && formData.password.length < 8) {
      newErrors.password = 'パスワードは8文字以上で入力してください'
    }

    // パスワード確認チェック
    if (formData.password && formData.password_confirm && formData.password !== formData.password_confirm) {
      newErrors.password_confirm = 'パスワードが一致しません'
    }

    // 郵便番号形式チェック（123-4567）
    const postalCodeRegex = /^\d{3}-\d{4}$/
    if (formData.postal_code && !postalCodeRegex.test(formData.postal_code)) {
      newErrors.postal_code = '郵便番号は123-4567の形式で入力してください'
    }

    // 電話番号チェック（数字のみ10-11桁）
    const phoneDigits = formData.phone_number.replace(/\D/g, '')
    if (formData.phone_number && (phoneDigits.length < 10 || phoneDigits.length > 11)) {
      newErrors.phone_number = '電話番号は10-11桁の数字で入力してください'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'}/register`,
        formData
      )
      alert('登録が完了しました！ログインページに移動します。')
      router.push('/login')
    } catch (error: any) {
      const detail = error.response?.data?.detail
      if (typeof detail === 'string') {
        setErrors({ general: detail })
      } else if (Array.isArray(detail)) {
        const newErrors: Record<string, string> = {}
        detail.forEach((err: any) => {
          const field = err.loc?.[err.loc.length - 1]
          if (field) {
            newErrors[field] = err.msg
          }
        })
        setErrors(newErrors)
      } else {
        setErrors({ general: '登録に失敗しました' })
      }
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })
    
    // エラーをクリア
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      })
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-blue-600 mb-2">IRODORI</h1>
          <h2 className="text-xl font-semibold text-gray-900">新規登録</h2>
        </div>
        
        {errors.general && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">
                姓 *
              </label>
              <input
                type="text"
                id="last_name"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                  errors.last_name ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.last_name && <p className="mt-1 text-sm text-red-600">{errors.last_name}</p>}
            </div>

            <div>
              <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">
                名 *
              </label>
              <input
                type="text"
                id="first_name"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                  errors.first_name ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.first_name && <p className="mt-1 text-sm text-red-600">{errors.first_name}</p>}
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              メールアドレス *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                errors.email ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
          </div>

          <div>
            <label htmlFor="birthdate" className="block text-sm font-medium text-gray-700">
              生年月日 *
            </label>
            <input
              type="date"
              id="birthdate"
              name="birthdate"
              value={formData.birthdate}
              onChange={handleChange}
              className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                errors.birthdate ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.birthdate && <p className="mt-1 text-sm text-red-600">{errors.birthdate}</p>}
          </div>

          <div>
            <label htmlFor="postal_code" className="block text-sm font-medium text-gray-700">
              郵便番号 * (例: 123-4567)
            </label>
            <input
              type="text"
              id="postal_code"
              name="postal_code"
              placeholder="123-4567"
              value={formData.postal_code}
              onChange={handleChange}
              className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                errors.postal_code ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.postal_code && <p className="mt-1 text-sm text-red-600">{errors.postal_code}</p>}
          </div>

          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700">
              住所 *
            </label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                errors.address ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address}</p>}
          </div>

          <div>
            <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700">
              電話番号 * (10-11桁の数字)
            </label>
            <input
              type="tel"
              id="phone_number"
              name="phone_number"
              placeholder="09012345678"
              value={formData.phone_number}
              onChange={handleChange}
              className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                errors.phone_number ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.phone_number && <p className="mt-1 text-sm text-red-600">{errors.phone_number}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="occupation" className="block text-sm font-medium text-gray-700">
                職業 *
              </label>
              <input
                type="text"
                id="occupation"
                name="occupation"
                value={formData.occupation}
                onChange={handleChange}
                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                  errors.occupation ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.occupation && <p className="mt-1 text-sm text-red-600">{errors.occupation}</p>}
            </div>

            <div>
              <label htmlFor="company_name" className="block text-sm font-medium text-gray-700">
                勤務先名 *
              </label>
              <input
                type="text"
                id="company_name"
                name="company_name"
                value={formData.company_name}
                onChange={handleChange}
                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                  errors.company_name ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.company_name && <p className="mt-1 text-sm text-red-600">{errors.company_name}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                パスワード * (8文字以上)
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                  errors.password ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
            </div>

            <div>
              <label htmlFor="password_confirm" className="block text-sm font-medium text-gray-700">
                パスワード（確認用） *
              </label>
              <input
                type="password"
                id="password_confirm"
                name="password_confirm"
                value={formData.password_confirm}
                onChange={handleChange}
                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                  errors.password_confirm ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.password_confirm && <p className="mt-1 text-sm text-red-600">{errors.password_confirm}</p>}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {loading ? '登録中...' : '登録'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <Link href="/login" className="text-blue-600 hover:text-blue-800">
            ログインはこちら
          </Link>
        </div>
      </div>
    </div>
  )
}