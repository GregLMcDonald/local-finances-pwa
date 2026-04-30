import { useState } from 'react'
import { Layout } from '@/components/Layout'
import { Card } from '@/components/Card'
import { Button } from '@/components/Button'
import { Modal } from '@/components/Modal'
import { Input, Select } from '@/components/Input'
import { EmptyState } from '@/components/EmptyState'
import { useAppData } from '@/context/AppDataContext'
import { fmt, today } from '@/lib/format'
import type { Subscription, BillingPeriod } from '@/lib/types'

function toMonthly(amount: number, period: BillingPeriod): number {
  if (period === 'monthly') return amount
  if (period === 'yearly') return amount / 12
  return amount * 4.33
}

function blank(): Omit<Subscription, 'id'> {
  return { name: '', amount: 0, billingPeriod: 'monthly', category: 'Entertainment', nextBillingDate: today(), active: true, cancelCandidate: false }
}

const CATEGORIES = ['Entertainment', 'Software', 'Health', 'Food', 'Utilities', 'Education', 'Other'].map((c) => ({ value: c, label: c }))
const BILLING_PERIODS: { value: BillingPeriod; label: string }[] = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
  { value: 'weekly', label: 'Weekly' },
]

export function Subscriptions() {
  const { data, setSubscriptions } = useAppData()
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState<Subscription | null>(null)
  const [form, setForm] = useState(blank())

  const active = data.subscriptions.filter((s) => s.active)
  const monthlyTotal = active.reduce((s, sub) => s + toMonthly(sub.amount, sub.billingPeriod), 0)
  const cancelCandidates = active.filter((s) => s.cancelCandidate)
  const potentialSavings = cancelCandidates.reduce((s, sub) => s + toMonthly(sub.amount, sub.billingPeriod), 0)

  const openAdd = () => { setForm(blank()); setEditing(null); setModal(true) }
  const openEdit = (s: Subscription) => {
    setForm({ name: s.name, amount: s.amount, billingPeriod: s.billingPeriod, category: s.category, nextBillingDate: s.nextBillingDate, active: s.active, cancelCandidate: s.cancelCandidate })
    setEditing(s)
    setModal(true)
  }

  const save = () => {
    if (!form.name.trim()) return
    if (editing) {
      setSubscriptions(data.subscriptions.map((s) => s.id === editing.id ? { ...s, ...form } : s))
    } else {
      setSubscriptions([...data.subscriptions, { ...form, id: crypto.randomUUID() }])
    }
    setModal(false)
  }

  const remove = (id: string) => setSubscriptions(data.subscriptions.filter((s) => s.id !== id))

  return (
    <Layout
      title="Subscriptions"
      subtitle={`${data.subscriptions.length} subscription${data.subscriptions.length !== 1 ? 's' : ''} tracked`}
      action={<Button onClick={openAdd} size="sm">+ Add Subscription</Button>}
    >
      <div className="space-y-3">
        <Card>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-accent-purple text-lg">$</span>
            <span className="text-sm text-muted">Monthly Cost</span>
          </div>
          <div className="text-2xl font-bold text-white">{fmt(monthlyTotal)}</div>
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-accent-yellow text-lg">⚠</span>
            <span className="text-sm text-muted">Cancel Candidates</span>
          </div>
          <div className="text-2xl font-bold text-white">{cancelCandidates.length}</div>
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-accent-green text-lg">↺</span>
            <span className="text-sm text-muted">Potential Savings</span>
          </div>
          <div className="text-2xl font-bold text-accent-green">{fmt(potentialSavings)}/mo</div>
        </Card>

        {data.subscriptions.length === 0
          ? <EmptyState message="No subscriptions tracked yet." />
          : data.subscriptions.map((s) => (
            <Card key={s.id} onClick={() => openEdit(s)}>
              <div className="flex items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-white">{s.name}</span>
                    {!s.active && <span className="text-xs text-muted border border-border px-1.5 py-0.5 rounded">Inactive</span>}
                    {s.cancelCandidate && <span className="text-xs text-accent-yellow border border-yellow-800 px-1.5 py-0.5 rounded">Cancel?</span>}
                  </div>
                  <div className="text-xs text-muted mt-0.5 capitalize">{s.category} · {s.billingPeriod}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white">{fmt(s.amount)}/{s.billingPeriod === 'monthly' ? 'mo' : s.billingPeriod === 'yearly' ? 'yr' : 'wk'}</span>
                  <button onClick={(e) => { e.stopPropagation(); remove(s.id) }} className="text-muted hover:text-accent-red text-sm">✕</button>
                </div>
              </div>
            </Card>
          ))
        }
      </div>

      {modal && (
        <Modal
          title={editing ? 'Edit Subscription' : 'Add Subscription'}
          onClose={() => setModal(false)}
          footer={
            <>
              <Button variant="ghost" onClick={() => setModal(false)}>Cancel</Button>
              <Button onClick={save}>Save</Button>
            </>
          }
        >
          <div className="space-y-3">
            <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Netflix" />
            <Input label="Amount" type="number" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: parseFloat(e.target.value) || 0 })} />
            <Select label="Billing Period" value={form.billingPeriod} onChange={(e) => setForm({ ...form, billingPeriod: e.target.value as BillingPeriod })} options={BILLING_PERIODS} />
            <Select label="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} options={CATEGORIES} />
            <Input label="Next Billing Date" type="date" value={form.nextBillingDate} onChange={(e) => setForm({ ...form, nextBillingDate: e.target.value })} />
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.cancelCandidate} onChange={(e) => setForm({ ...form, cancelCandidate: e.target.checked })} className="accent-accent-yellow" />
              <span className="text-sm text-white">Flag as cancel candidate</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} className="accent-accent-green" />
              <span className="text-sm text-white">Active</span>
            </label>
          </div>
        </Modal>
      )}
    </Layout>
  )
}
