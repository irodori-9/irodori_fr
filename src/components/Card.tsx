import { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  maxWidth?: 'sm' | 'md' | 'lg' | '2xl'
}

export default function Card({ children, className = '', maxWidth = 'md' }: CardProps) {
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    '2xl': 'max-w-2xl'
  }
  
  const classes = `${maxWidthClasses[maxWidth]} mx-auto bg-white shadow-md rounded-lg p-6 ${className}`
  
  return (
    <div className={classes}>
      {children}
    </div>
  )
}