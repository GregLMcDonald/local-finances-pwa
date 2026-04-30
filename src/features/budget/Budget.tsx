import { useState, useMemo } from 'react'
import { Layout } from '@/components/Layout'
import { Card } from '@/components/Card'
import { Button } from '@/components/Button'
import { Modal } from '@/components/Modal'
import { Input, Select } from '@/components/Input'
import { EmptyState } from '@/components/EmptyState'
import { useAppData } from '@/context/AppDataContext'
import { fmt, currentMonthRange } from '@/lib/format'
import type { Budget } from '@/lib/types'

const COLORS = ['#22c55e', '#3b82f6', '#f97316', '#a855f7', '#eab308', '#ef4444', '#06b6d4']

function blank(): Omit<Budget, 'id'> {
  return { category: '', limit: 0, period: 'monthly', color: COLORS[0] }
}

export function BudgetPage() {
  const { data, setBudgets } = useAppData()
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState<Budget | null>(null)
  const [form, setForm] = useState(blank())

  const { start, end } = currentMonthRange()

  const spentByCategory = useMemo(() => {
    const map: Record<string, number> = {}
    data.transactions
      .filter((t) => t.date >= start && t.date <= end && t.type === 'expense')
      .forEach((t) => { map[t.category] = (map[t.category] ?? 0) + t.amount })
    return map
  }, [data.transactions, start, end])

  const totalBudget = data.budgets.reduce((s, b) => s + (b.period === 'monthly' ? b.limit : b.limit / 12), 0)
  const totalSpent = data.budgets.reduce((s, b) => s + (spentByCategory[b.category] ?? 0), 0)

  const openAdd = () => { setForm(blank()); setEditing(null); setModal(true) }
  const openEdit = (b: Budget) => { setForm({ category: b.category, limit: b.limit, period: b.period, color: b.color }); setEditing(b); setModal(true) }

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

  return (
    <Layout
      title="Budget"
      subtitle="Track spending against your budget"
      action={<Button onClick={openAdd} size="sm">+ Add Budget</Button>}
    >
      <div className="space-y-3">
        <div className="grid grid-cols-1 gap-3">
          <Card><div className="text-sm text-muted">Total Budget</div><div className="text-2xl font-bold text-white mt-1">{fmt(totalBudget)}</div></Card>
          <Card><div className="text-sm text-muted">Total Spent</div><div className={`text-2xl font-bold mt-1 ${totalSpent > totalBudget && totalBudget > 0 ? 'text-accent-red' : 'text-accent-orange'}`}>{fmt(totalSpent)}</div></Card>
          <Card><div className="text-sm text-muted">Remaining</div><div className={`text-2xl font-bold mt-1 ${totalBudget - totalSpent >= 0 ? 'text-accent-green' : 'text-accent-red'}`}>{fmt(totalBudget - totalSpent)}</div></Card>
        </div>

        {data.budgets.length === 0
          ? <EmptyState message="No budgets set. Add your first budget above." />
          : data.budgets.map((b) => {
            const monthly = b.period === 'monthly' ? b.limit : b.limit / 12
            const spent = spentByCategory[b.category] ?? 0
            const pct = monthly > 0 ? Math.min((spent / monthly) * 100, 100) : 0
            const over = spent > monthly

            return (
              <Card key={b.id} onClick={() => openEdit(b)}>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="font-medium text-white">{b.category}</div>
                    <div className="text-xs text-muted capitalize">{b.period}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <div className={`font-semibold ${over ? 'text-accent-red' : 'text-white'}`}>{fmt(spent)}</div>
                      <div className="text-xs text-muted">of {fmt(monthly)}</div>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); remove(b.id) }} className="text-muted hover:text-accent-red text-sm">✕</button>
                  </div>
                </div>
                <div className="h-1.5 bg-border rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${pct}%`, backgroundColor: over ? '#ef4444' : (b.color ?? '#22c55e') }}
                  />
                </div>
              </Card>
            )
          })
        }
      </div>

      {modal && (
        <Modal
          title={editing ? 'Edit Budget' : 'Add Budget'}
          onClose={() => setModal(false)}
          footer={
            <>
              <Button variant="ghost" onClick={() => setModal(false)}>Cancel</Button>
              <Button onClick={save}>Save</Button>
            </>
          }
        >
          <div className="space-y-3">
            <Input label="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="e.g. Food & Dining" />
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
