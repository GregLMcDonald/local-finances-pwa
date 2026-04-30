import { createContext, useContext, useReducer, useEffect, useCallback, type ReactNode } from 'react'
import type { AppData, Account, Transaction, Budget, Debt, Subscription, Task, AppSettings } from '@/lib/types'
import { storage } from '@/lib/storage'

type Action =
  | { type: 'SET_ALL'; payload: AppData }
  | { type: 'SET_ACCOUNTS'; payload: Account[] }
  | { type: 'SET_TRANSACTIONS'; payload: Transaction[] }
  | { type: 'SET_BUDGETS'; payload: Budget[] }
  | { type: 'SET_DEBTS'; payload: Debt[] }
  | { type: 'SET_SUBSCRIPTIONS'; payload: Subscription[] }
  | { type: 'SET_TASKS'; payload: Task[] }
  | { type: 'SET_SETTINGS'; payload: AppSettings }

function reducer(state: AppData, action: Action): AppData {
  switch (action.type) {
    case 'SET_ALL':
      return action.payload
    case 'SET_ACCOUNTS':
      return { ...state, accounts: action.payload }
    case 'SET_TRANSACTIONS':
      return { ...state, transactions: action.payload }
    case 'SET_BUDGETS':
      return { ...state, budgets: action.payload }
    case 'SET_DEBTS':
      return { ...state, debts: action.payload }
    case 'SET_SUBSCRIPTIONS':
      return { ...state, subscriptions: action.payload }
    case 'SET_TASKS':
      return { ...state, tasks: action.payload }
    case 'SET_SETTINGS':
      return { ...state, settings: action.payload }
  }
}

function loadInitial(): AppData {
  return {
    accounts: storage.accounts.get(),
    transactions: storage.transactions.get(),
    budgets: storage.budgets.get(),
    debts: storage.debts.get(),
    subscriptions: storage.subscriptions.get(),
    tasks: storage.tasks.get(),
    settings: storage.settings.get(),
  }
}

interface AppDataContextValue {
  data: AppData
  setAccounts: (v: Account[]) => void
  setTransactions: (v: Transaction[]) => void
  setBudgets: (v: Budget[]) => void
  setDebts: (v: Debt[]) => void
  setSubscriptions: (v: Subscription[]) => void
  setTasks: (v: Task[]) => void
  setSettings: (v: AppSettings) => void
  restoreAll: (v: AppData) => void
}

const AppDataContext = createContext<AppDataContextValue | null>(null)

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [data, dispatch] = useReducer(reducer, null, loadInitial)

  const setAccounts = useCallback((v: Account[]) => {
    storage.accounts.set(v)
    dispatch({ type: 'SET_ACCOUNTS', payload: v })
  }, [])

  const setTransactions = useCallback((v: Transaction[]) => {
    storage.transactions.set(v)
    dispatch({ type: 'SET_TRANSACTIONS', payload: v })
  }, [])

  const setBudgets = useCallback((v: Budget[]) => {
    storage.budgets.set(v)
    dispatch({ type: 'SET_BUDGETS', payload: v })
  }, [])

  const setDebts = useCallback((v: Debt[]) => {
    storage.debts.set(v)
    dispatch({ type: 'SET_DEBTS', payload: v })
  }, [])

  const setSubscriptions = useCallback((v: Subscription[]) => {
    storage.subscriptions.set(v)
    dispatch({ type: 'SET_SUBSCRIPTIONS', payload: v })
  }, [])

  const setTasks = useCallback((v: Task[]) => {
    storage.tasks.set(v)
    dispatch({ type: 'SET_TASKS', payload: v })
  }, [])

  const setSettings = useCallback((v: AppSettings) => {
    storage.settings.set(v)
    dispatch({ type: 'SET_SETTINGS', payload: v })
  }, [])

  const restoreAll = useCallback((v: AppData) => {
    storage.accounts.set(v.accounts)
    storage.transactions.set(v.transactions)
    storage.budgets.set(v.budgets)
    storage.debts.set(v.debts)
    storage.subscriptions.set(v.subscriptions)
    storage.tasks.set(v.tasks)
    storage.settings.set(v.settings)
    dispatch({ type: 'SET_ALL', payload: v })
  }, [])

  // keep storage in sync when another tab writes
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key?.startsWith('hearth_')) {
        dispatch({ type: 'SET_ALL', payload: loadInitial() })
      }
    }
    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  }, [])

  return (
    <AppDataContext.Provider
      value={{ data, setAccounts, setTransactions, setBudgets, setDebts, setSubscriptions, setTasks, setSettings, restoreAll }}
    >
      {children}
    </AppDataContext.Provider>
  )
}

export function useAppData() {
  const ctx = useContext(AppDataContext)
  if (!ctx) throw new Error('useAppData must be used inside AppDataProvider')
  return ctx
}
