import { ReactNode } from 'react'

interface HeaderProps {
  title?: string
  subtitle?: ReactNode
}

export default function Header({ title = "IRODORI", subtitle }: HeaderProps) {
  return (
    <div className="text-center mb-6">
      <h1 className="text-3xl font-bold text-blue-600 mb-2">{title}</h1>
      {subtitle && (
        <h2 className="text-xl font-semibold text-gray-900">{subtitle}</h2>
      )}
    </div>
  )
}