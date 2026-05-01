export type AccountType = 'checking' | 'savings' | 'credit' | 'investment' | 'loan' | 'other'

export interface Account {
  id: string
  name: string
  type: AccountType
  balance: number
  currency: string
  createdAt: string
  reconciliationId?: string
}

export type TransactionType = 'income' | 'expense'

export interface Transaction {
  id: string
  accountId: string
  date: string
  description: string
  amount: number
  type: TransactionType
  category: string
  notes?: string
}

export interface Budget {
  id: string
  category: string
  type: 'income' | 'expense'
  limit: number
  period: 'monthly' | 'yearly'
  color?: string
}

export type DebtType = 'credit_card' | 'loan' | 'mortgage' | 'other'

export interface Debt {
  id: string
  name: string
  type: DebtType
  balance: number
  interestRate: number
  minimumPayment: number
  dueDate?: string
}

export type BillingPeriod = 'monthly' | 'yearly' | 'weekly'

export interface Subscription {
  id: string
  name: string
  amount: number
  billingPeriod: BillingPeriod
  category: string
  nextBillingDate: string
  active: boolean
  cancelCandidate: boolean
}

export type TaskStatus = 'todo' | 'in_progress' | 'done'
export type TaskPriority = 'low' | 'medium' | 'high'

export interface Task {
  id: string
  title: string
  description?: string
  status: TaskStatus
  priority: TaskPriority
  dueDate?: string
  createdAt: string
}

export interface ForecastSettings {
  currentAge: number
  retirementAge: number
  annualReturn: number
  inflation: number
}

export interface AppSettings {
  forecast: ForecastSettings
}

export interface AppData {
  accounts: Account[]
  transactions: Transaction[]
  budgets: Budget[]
  debts: Debt[]
  subscriptions: Subscription[]
  tasks: Task[]
  settings: AppSettings
}
