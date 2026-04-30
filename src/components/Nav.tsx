import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'

const NAV_ITEMS = [
  { to: '/', label: 'Home', icon: HomeIcon },
  { to: '/finance', label: 'Finance', icon: FinanceIcon },
  { to: '/budget', label: 'Budget', icon: BudgetIcon },
  { to: '/tasks', label: 'Tasks', icon: TasksIcon },
]

const MENU_ITEMS = [
  { to: '/', label: 'Command Center', icon: '⊞' },
  { to: '/accounts', label: 'Accounts', icon: '🏦' },
  { to: '/finance', label: 'Transactions', icon: '💳' },
  { to: '/import', label: 'Import', icon: '⬆' },
  { to: '/budget', label: 'Budget', icon: '◎' },
  { to: '/debts', label: 'Debts', icon: '↘' },
  { to: '/subscriptions', label: 'Subscriptions', icon: '↺' },
  { to: '/forecast', label: 'Forecast', icon: '📊' },
  { to: '/networth', label: 'Net Worth', icon: '↗' },
  { to: '/tasks', label: 'Tasks', icon: '☑' },
  { to: '/settings', label: 'Settings', icon: '⚙' },
]

export function BottomNav() {
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()

  return (
    <>
      {menuOpen && (
        <div className="fixed inset-0 z-40 flex">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMenuOpen(false)} />
          <div className="relative w-64 bg-card border-r border-border flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-2">
                <span className="text-accent-green font-bold text-lg">⚡</span>
                <div>
                  <div className="font-bold text-white text-sm">Hearth</div>
                  <div className="text-muted text-xs">Your finances, at home.</div>
                </div>
              </div>
              <button onClick={() => setMenuOpen(false)} className="text-muted hover:text-white text-lg leading-none">✕</button>
            </div>
            <nav className="flex-1 overflow-y-auto py-2">
              {MENU_ITEMS.map((item) => (
                <button
                  key={item.to}
                  onClick={() => { navigate(item.to); setMenuOpen(false) }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-white/5 text-sm transition-colors"
                >
                  <span className="w-5 text-center">{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
        </div>
      )}

      <nav className="fixed bottom-0 left-0 right-0 z-30 bg-black border-t border-border safe-area-bottom">
        <div className="flex items-center">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center gap-0.5 py-2 text-xs transition-colors ${
                  isActive ? 'text-white' : 'text-muted'
                }`
              }
            >
              <item.icon />
              {item.label}
            </NavLink>
          ))}
          <button
            onClick={() => setMenuOpen(true)}
            className="flex-1 flex flex-col items-center gap-0.5 py-2 text-xs text-muted hover:text-white transition-colors"
          >
            <MenuIcon />
            More
          </button>
        </div>
      </nav>
    </>
  )
}

function HomeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  )
}

function FinanceIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" />
    </svg>
  )
}

function BudgetIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function TasksIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <polyline points="9 11 12 14 22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  )
}

function MenuIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  )
}
