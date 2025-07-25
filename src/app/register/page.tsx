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
    <Card maxWidth="2xl">
      <Header subtitle="新規登録" />
      
      {errors.general && <ErrorMessage message={errors.general} />}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            label="姓 *"
            type="text"
            id="last_name"
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
            error={errors.last_name}
          />
          
          <FormField
            label="名 *"
            type="text"
            id="first_name"
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
            error={errors.first_name}
          />
        </div>

        <FormField
          label="メールアドレス *"
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
        />

        <FormField
          label="生年月日 *"
          type="date"
          id="birthdate"
          name="birthdate"
          value={formData.birthdate}
          onChange={handleChange}
          error={errors.birthdate}
        />

        <FormField
          label="郵便番号 * (例: 123-4567)"
          type="text"
          id="postal_code"
          name="postal_code"
          placeholder="123-4567"
          value={formData.postal_code}
          onChange={handleChange}
          error={errors.postal_code}
        />

        <FormField
          label="住所 *"
          type="text"
          id="address"
          name="address"
          value={formData.address}
          onChange={handleChange}
          error={errors.address}
        />

        <FormField
          label="電話番号 * (10-11桁の数字)"
          type="tel"
          id="phone_number"
          name="phone_number"
          placeholder="09012345678"
          value={formData.phone_number}
          onChange={handleChange}
          error={errors.phone_number}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            label="職業 *"
            type="text"
            id="occupation"
            name="occupation"
            value={formData.occupation}
            onChange={handleChange}
            error={errors.occupation}
          />
          
          <FormField
            label="勤務先名 *"
            type="text"
            id="company_name"
            name="company_name"
            value={formData.company_name}
            onChange={handleChange}
            error={errors.company_name}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            label="パスワード * (8文字以上)"
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
          />
          
          <FormField
            label="パスワード（確認用） *"
            type="password"
            id="password_confirm"
            name="password_confirm"
            value={formData.password_confirm}
            onChange={handleChange}
            error={errors.password_confirm}
          />
        </div>

        <Button
          type="submit"
          loading={loading}
          className="w-full"
        >
          登録
        </Button>
      </form>

      <div className="mt-4 text-center">
        <Link href="/login" className="text-blue-600 hover:text-blue-800">
          ログインはこちら
        </Link>
      </div>
    </Card>
  )
}