import type { ButtonHTMLAttributes, ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'danger'
  size?: 'sm' | 'md'
  children: ReactNode
}

export function Button({ variant = 'primary', size = 'md', className = '', children, ...props }: ButtonProps) {
  const base = 'inline-flex items-center justify-center gap-1.5 font-medium rounded-lg transition-colors disabled:opacity-50'
  const variants = {
    primary: 'bg-accent-green text-black hover:bg-green-400',
    ghost: 'text-gray-300 hover:text-white hover:bg-white/10',
    danger: 'bg-accent-red text-white hover:bg-red-400',
  }
  const sizes = {
    sm: 'px-2.5 py-1 text-sm',
    md: 'px-4 py-2 text-sm',
  }
  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {children}
    </button>
  )
}
