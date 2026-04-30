import { createHashRouter } from 'react-router-dom'
import { CommandCenter } from '@/features/home/CommandCenter'
import { Accounts } from '@/features/accounts/Accounts'
import { Transactions } from '@/features/transactions/Transactions'
import { Import } from '@/features/import/Import'
import { BudgetPage } from '@/features/budget/Budget'
import { Debts } from '@/features/debts/Debts'
import { Subscriptions } from '@/features/subscriptions/Subscriptions'
import { Forecast } from '@/features/forecast/Forecast'
import { NetWorth } from '@/features/networth/NetWorth'
import { Tasks } from '@/features/tasks/Tasks'
import { Settings } from '@/features/settings/Settings'

export const router = createHashRouter([
  { path: '/', element: <CommandCenter /> },
  { path: '/accounts', element: <Accounts /> },
  { path: '/finance', element: <Transactions /> },
  { path: '/import', element: <Import /> },
  { path: '/budget', element: <BudgetPage /> },
  { path: '/debts', element: <Debts /> },
  { path: '/subscriptions', element: <Subscriptions /> },
  { path: '/forecast', element: <Forecast /> },
  { path: '/networth', element: <NetWorth /> },
  { path: '/tasks', element: <Tasks /> },
  { path: '/settings', element: <Settings /> },
])
