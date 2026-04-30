import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Layout } from '@/components/Layout'
import { Card } from '@/components/Card'
import { useAppData } from '@/context/AppDataContext'
import { fmt, yesterday, currentMonthRange } from '@/lib/format'

export function CommandCenter() {
  const { data } = useAppData()
  const navigate = useNavigate()

  const stats = useMemo(() => {
    const yd = yesterday()
    const { start, end } = currentMonthRange()

    const spentYesterday = data.transactions
      .filter((t) => t.date === yd && t.type === 'expense')
      .reduce((s, t) => s + t.amount, 0)

    const monthExpenses = data.transactions
      .filter((t) => t.date >= start && t.date <= end && t.type === 'expense')
      .reduce((s, t) => s + t.amount, 0)

    const monthIncome = data.transactions
      .filter((t) => t.date >= start && t.date <= end && t.type === 'income')
      .reduce((s, t) => s + t.amount, 0)

    const totalBudget = data.budgets.reduce((s, b) => s + (b.period === 'monthly' ? b.limit : b.limit / 12), 0)
    const budgetRemaining = totalBudget - monthExpenses
    const budgetStatus = totalBudget === 0
      ? 'No budget set'
      : budgetRemaining >= 0
      ? `On track - ${fmt(budgetRemaining)} remaining`
      : `Over budget by ${fmt(Math.abs(budgetRemaining))}`

    const assets = data.accounts
      .filter((a) => a.type !== 'credit' && a.type !== 'loan')
      .reduce((s, a) => s + a.balance, 0)
    const liabilities = data.accounts
      .filter((a) => a.type === 'credit' || a.type === 'loan')
      .reduce((s, a) => s + a.balance, 0)
    const netWorth = assets - liabilities

    const cashflow = monthIncome - monthExpenses

    const runway = monthExpenses > 0 ? assets / monthExpenses : Infinity

    return { spentYesterday, budgetStatus, runway, netWorth, cashflow }
  }, [data])

  const alerts = useMemo(() => {
    const list: { type: 'warning' | 'info'; message: string }[] = []
    const cancelCount = data.subscriptions.filter((s) => s.cancelCandidate && s.active).length
    if (cancelCount > 0) {
      list.push({ type: 'warning', message: `${cancelCount} subscription${cancelCount > 1 ? 's' : ''} flagged as cancel candidates` })
    }
    const overdueDebts = data.debts.filter((d) => d.dueDate && d.dueDate < new Date().toISOString().split('T')[0])
    if (overdueDebts.length > 0) {
      list.push({ type: 'warning', message: `${overdueDebts.length} debt payment${overdueDebts.length > 1 ? 's' : ''} past due` })
    }
    return list
  }, [data])

  return (
    <Layout title="Command Center" subtitle="Your financial intelligence at a glance.">
      <div className="space-y-3">
        {alerts.map((a, i) => (
          <div key={i} className="flex gap-2 items-start bg-red-950/50 border border-red-800 rounded-xl p-3 text-sm text-red-300">
            <span>⚠</span>
            <span>{a.message}</span>
          </div>
        ))}

        <Card>
          <h2 className="font-semibold text-white mb-3">Daily Brief</h2>
          <div className="space-y-2 text-sm">
            <Row label="Spent Yesterday" value={fmt(stats.spentYesterday)} />
            <Row label="Budget Status" value={stats.budgetStatus} />
            <Row label="Runway" value={stats.runway === Infinity ? '∞' : `${stats.runway.toFixed(1)} mo`} />
            <Row label="Recommended Action" value="Review budget categories" />
          </div>
        </Card>

        <Card onClick={() => navigate('/networth')}>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted">Net Worth</span>
            <span className="text-accent-green text-xs">↗</span>
          </div>
          <div className={`text-2xl font-bold mt-1 ${stats.netWorth >= 0 ? 'text-accent-green' : 'text-accent-red'}`}>
            {fmt(stats.netWorth)}
          </div>
        </Card>

        <Card onClick={() => navigate('/finance')}>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted">Monthly Cashflow</span>
            <span className="text-accent-green text-xs">↗</span>
          </div>
          <div className={`text-2xl font-bold mt-1 ${stats.cashflow >= 0 ? 'text-accent-green' : 'text-accent-red'}`}>
            {fmt(stats.cashflow)}
          </div>
        </Card>

        <Card onClick={() => navigate('/subscriptions')}>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted">Monthly Subscriptions</span>
          </div>
          <div className="text-2xl font-bold text-white mt-1">
            {fmt(data.subscriptions.filter((s) => s.active).reduce((sum, s) => sum + (s.billingPeriod === 'monthly' ? s.amount : s.billingPeriod === 'yearly' ? s.amount / 12 : s.amount * 4.33), 0))}
          </div>
        </Card>

        <Card onClick={() => navigate('/tasks')}>
          <div className="text-sm text-muted mb-1">Open Tasks</div>
          <div className="text-2xl font-bold text-white">
            {data.tasks.filter((t) => t.status !== 'done').length}
          </div>
        </Card>
      </div>
    </Layout>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-muted">{label}</span>
      <span className="text-white font-medium text-right">{value}</span>
    </div>
  )
}
