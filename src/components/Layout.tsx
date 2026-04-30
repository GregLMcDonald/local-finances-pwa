import type { ReactNode } from 'react'
import { BottomNav } from './Nav'

interface LayoutProps {
  title: string
  subtitle?: string
  action?: ReactNode
  children: ReactNode
}

export function Layout({ title, subtitle, action, children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-surface text-white flex flex-col">
      <header className="px-4 pt-6 pb-4">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">{title}</h1>
            {subtitle && <p className="text-muted text-sm mt-0.5">{subtitle}</p>}
          </div>
          {action && <div className="pt-1">{action}</div>}
        </div>
      </header>
      <main className="flex-1 px-4 pb-28 overflow-y-auto">{children}</main>
      <BottomNav />
    </div>
  )
}
