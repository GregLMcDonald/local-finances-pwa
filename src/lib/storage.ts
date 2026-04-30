import type { AppData, AppSettings } from './types'

const KEYS = {
  accounts: 'hearth_accounts',
  transactions: 'hearth_transactions',
  budgets: 'hearth_budgets',
  debts: 'hearth_debts',
  subscriptions: 'hearth_subscriptions',
  tasks: 'hearth_tasks',
  settings: 'hearth_settings',
} as const

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function write(key: string, value: unknown): void {
  localStorage.setItem(key, JSON.stringify(value))
}

const defaultSettings: AppSettings = {
  forecast: {
    currentAge: 30,
    retirementAge: 65,
    annualReturn: 7,
    inflation: 2.5,
  },
}

export const storage = {
  accounts: {
    get: () => read(KEYS.accounts, []),
    set: (v: AppData['accounts']) => write(KEYS.accounts, v),
  },
  transactions: {
    get: () => read(KEYS.transactions, []),
    set: (v: AppData['transactions']) => write(KEYS.transactions, v),
  },
  budgets: {
    get: () => read(KEYS.budgets, []),
    set: (v: AppData['budgets']) => write(KEYS.budgets, v),
  },
  debts: {
    get: () => read(KEYS.debts, []),
    set: (v: AppData['debts']) => write(KEYS.debts, v),
  },
  subscriptions: {
    get: () => read(KEYS.subscriptions, []),
    set: (v: AppData['subscriptions']) => write(KEYS.subscriptions, v),
  },
  tasks: {
    get: () => read(KEYS.tasks, []),
    set: (v: AppData['tasks']) => write(KEYS.tasks, v),
  },
  settings: {
    get: (): AppSettings => read(KEYS.settings, defaultSettings),
    set: (v: AppSettings) => write(KEYS.settings, v),
  },
}

export function exportAll(): AppData {
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

export function importAll(data: AppData): void {
  storage.accounts.set(data.accounts ?? [])
  storage.transactions.set(data.transactions ?? [])
  storage.budgets.set(data.budgets ?? [])
  storage.debts.set(data.debts ?? [])
  storage.subscriptions.set(data.subscriptions ?? [])
  storage.tasks.set(data.tasks ?? [])
  storage.settings.set(data.settings ?? defaultSettings)
}
