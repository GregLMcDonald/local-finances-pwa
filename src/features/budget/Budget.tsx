import { useState, useMemo } from 'react'
import { Layout } from '@/components/Layout'
import { Card } from '@/components/Card'
import { Button } from '@/components/Button'
import { Modal } from '@/components/Modal'
import { Input, Select } from '@/components/Input'
import { EmptyState } from '@/components/EmptyState'
import { useAppData } from '@/context/AppDataContext'
import { fmt } from '@/lib/format'
import type { Budget } from '@/lib/types'

const COLORS = ['#22c55e', '#3b82f6', '#f97316', '#a855f7', '#eab308', '#ef4444', '#06b6d4']

type ViewPeriod = 'month' | 'year'

function blank(): Omit<Budget, 'id'> {
  return { category: '', type: 'expense', limit: 0, period: 'monthly', color: COLORS[0] }
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

export function BudgetPage() {
  const { data, setBudgets } = useAppData()
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState<Budget | null>(null)
  const [form, setForm] = useState(blank())
  const [viewPeriod, setViewPeriod] = useState<ViewPeriod>('month')

  const now = new Date()
  const [viewYear, setViewYear] = useState(now.getFullYear())
  const [viewMonth, setViewMonth] = useState(now.getMonth())

  const range = useMemo(() => {
    if (viewPeriod === 'month') {
      const y = viewYear
      const m = String(viewMonth + 1).padStart(2, '0')
      const last = String(daysInMonth(viewYear, viewMonth)).padStart(2, '0')
      return { start: `${y}-${m}-01`, end: `${y}-${m}-${last}` }
    }
    return { start: `${viewYear}-01-01`, end: `${viewYear}-12-31` }
  }, [viewPeriod, viewYear, viewMonth])

  const periodLabel = viewPeriod === 'month'
    ? new Date(viewYear, viewMonth, 1).toLocaleString('default', { month: 'long', year: 'numeric' })
    : String(viewYear)

  const navigate = (dir: -1 | 1) => {
    if (viewPeriod === 'month') {
      const d = new Date(viewYear, viewMonth + dir, 1)
      setViewYear(d.getFullYear())
      setViewMonth(d.getMonth())
    } else {
      setViewYear((y) => y + dir)
    }
  }

  const amountByCategory = useMemo(() => {
    const map: Record<string, number> = {}
    data.transactions
      .filter((t) => t.date >= range.start && t.date <= range.end)
      .forEach((t) => {
        const key = `${t.type}:${t.category}`
        map[key] = (map[key] ?? 0) + t.amount
      })
    return map
  }, [data.transactions, range.start, range.end])

  const periodLimit = (b: Budget) => {
    const monthly = b.period === 'monthly' ? b.limit : b.limit / 12
    return viewPeriod === 'month' ? monthly : monthly * 12
  }

  const btype = (b: Budget) => b.type ?? 'expense'

  const expenseBudgets = data.budgets.filter((b) => btype(b) === 'expense')
  const incomeBudgets = data.budgets.filter((b) => btype(b) === 'income')

  const totalExpenseLimit = expenseBudgets.reduce((s, b) => s + periodLimit(b), 0)
  const totalExpenseSpent = expenseBudgets.reduce((s, b) => s + (amountByCategory[`expense:${b.category}`] ?? 0), 0)
  const totalIncomeLimit = incomeBudgets.reduce((s, b) => s + periodLimit(b), 0)
  const totalIncomeReceived = incomeBudgets.reduce((s, b) => s + (amountByCategory[`income:${b.category}`] ?? 0), 0)

  const openAdd = () => { setForm(blank()); setEditing(null); setModal(true) }
  const openEdit = (b: Budget) => {
    setForm({ category: b.category, type: b.type ?? 'expense', limit: b.limit, period: b.period, color: b.color })
    setEditing(b)
    setModal(true)
  }

  const save = () => {
    if (!form.category.trim()) return
    if (editing) {
      setBudgets(data.budgets.map((b) => b.id === editing.id ? { ...b, ...form } : b))
    } else {
      setBudgets([...data.budgets, { ...form, id: crypto.randomUUID() }])
    }
    setModal(false)
  }

  const remove = (id: string) => setBudgets(data.budgets.filter((b) => b.id !== id))

  const BudgetCard = ({ b }: { b: Budget }) => {
    const limit = periodLimit(b)
    const actual = amountByCategory[`${btype(b)}:${b.category}`] ?? 0
    const pct = limit > 0 ? Math.min((actual / limit) * 100, 100) : 0
    const isOver = actual > limit && limit > 0
    const isIncome = b.type === 'income'
    const underOver = isIncome
      ? actual >= limit ? 'text-accent-green' : 'text-accent-yellow'
      : isOver ? 'text-accent-red' : 'text-white'

    return (
      <Card onClick={() => openEdit(b)}>
        <div className="flex justify-between items-start mb-2">
          <div>
            <div className="font-medium text-white">{b.category}</div>
            <div className="text-xs text-muted capitalize">{b.period} limit</div>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-right">
              <div className={`font-semibold ${underOver}`}>{fmt(actual)}</div>
              <div className="text-xs text-muted">of {fmt(limit)}</div>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); remove(b.id) }}
              className="text-muted hover:text-accent-red text-sm"
            >✕</button>
          </div>
        </div>
        <div className="h-1.5 bg-border rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${pct}%`, backgroundColor: isOver ? '#ef4444' : (b.color ?? '#22c55e') }}
          />
        </div>
      </Card>
    )
  }

  return (
    <Layout
      title="Budget"
      subtitle="Set limits for spending categories"
      action={<Button onClick={openAdd} size="sm">+ Add Category</Button>}
    >
      <div className="space-y-4">
        {/* Period controls */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {(['month', 'year'] as ViewPeriod[]).map((p) => (
              <button
                key={p}
                onClick={() => setViewPeriod(p)}
                className={`px-3 py-1.5 rounded-lg text-sm border transition-colors capitalize ${
                  viewPeriod === p ? 'border-white text-white' : 'border-border text-muted hover:text-white'
                }`}
              >
                {p === 'month' ? 'Month' : 'Year'}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => navigate(-1)} className="text-muted hover:text-white w-7 h-7 flex items-center justify-center rounded-lg hover:bg-surface transition-colors text-lg">‹</button>
            <span className="text-white text-sm font-medium min-w-[110px] text-center">{periodLabel}</span>
            <button onClick={() => navigate(1)} className="text-muted hover:text-white w-7 h-7 flex items-center justify-center rounded-lg hover:bg-surface transition-colors text-lg">›</button>
          </div>
        </div>

        {data.budgets.length === 0 ? (
          <EmptyState message="No categories yet. Add your first budget category above." />
        ) : (
          <>
            {/* Income section */}
            {incomeBudgets.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold text-accent-green">Income</div>
                  <div className="text-xs text-muted">
                    <span className="text-accent-green font-medium">{fmt(totalIncomeReceived)}</span>
                    <span> of </span>
                    <span>{fmt(totalIncomeLimit)}</span>
                    <span> budgeted</span>
                  </div>
                </div>
                {incomeBudgets.map((b) => <BudgetCard key={b.id} b={b} />)}
              </div>
            )}

            {/* Expense section */}
            {expenseBudgets.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold text-accent-orange">Expenses</div>
                  <div className="text-xs text-muted">
                    <span className={`font-medium ${totalExpenseSpent > totalExpenseLimit && totalExpenseLimit > 0 ? 'text-accent-red' : 'text-accent-orange'}`}>
                      {fmt(totalExpenseSpent)}
                    </span>
                    <span> of </span>
                    <span>{fmt(totalExpenseLimit)}</span>
                    <span> budgeted</span>
                  </div>
                </div>
                {expenseBudgets.map((b) => <BudgetCard key={b.id} b={b} />)}
              </div>
            )}

            {/* Net summary */}
            {incomeBudgets.length > 0 && expenseBudgets.length > 0 && (
              <div className="grid grid-cols-2 gap-3 pt-1">
                <Card>
                  <div className="text-xs text-muted mb-1">Net Budgeted</div>
                  <div className={`text-lg font-bold ${totalIncomeLimit - totalExpenseLimit >= 0 ? 'text-accent-green' : 'text-accent-red'}`}>
                    {fmt(totalIncomeLimit - totalExpenseLimit)}
                  </div>
                </Card>
                <Card>
                  <div className="text-xs text-muted mb-1">Net Actual</div>
                  <div className={`text-lg font-bold ${totalIncomeReceived - totalExpenseSpent >= 0 ? 'text-accent-green' : 'text-accent-red'}`}>
                    {fmt(totalIncomeReceived - totalExpenseSpent)}
                  </div>
                </Card>
              </div>
            )}
          </>
        )}
      </div>

      {modal && (
        <Modal
          title={editing ? 'Edit Category' : 'Add Category'}
          onClose={() => setModal(false)}
          footer={
            <>
              <Button variant="ghost" onClick={() => setModal(false)}>Cancel</Button>
              <Button onClick={save}>Save</Button>
            </>
          }
        >
          <div className="space-y-3">
            <Input label="Name" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="e.g. Food & Dining" />
            <Select label="Type" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as Budget['type'] })} options={[{ value: 'expense', label: 'Expense' }, { value: 'income', label: 'Income' }]} />
            <Input label="Limit" type="number" step="0.01" value={form.limit} onChange={(e) => setForm({ ...form, limit: parseFloat(e.target.value) || 0 })} />
            <Select label="Period" value={form.period} onChange={(e) => setForm({ ...form, period: e.target.value as Budget['period'] })} options={[{ value: 'monthly', label: 'Monthly' }, { value: 'yearly', label: 'Yearly' }]} />
            <div className="flex flex-col gap-1">
              <label className="text-sm text-muted">Color</label>
              <div className="flex gap-2 flex-wrap">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setForm({ ...form, color: c })}
                    className={`w-7 h-7 rounded-full border-2 transition-all ${form.color === c ? 'border-white scale-110' : 'border-transparent'}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </Layout>
  )
}
