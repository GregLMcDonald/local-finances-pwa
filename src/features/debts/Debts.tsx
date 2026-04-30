import { useState } from 'react'
import { Layout } from '@/components/Layout'
import { Card } from '@/components/Card'
import { Button } from '@/components/Button'
import { Modal } from '@/components/Modal'
import { Input, Select } from '@/components/Input'
import { EmptyState } from '@/components/EmptyState'
import { useAppData } from '@/context/AppDataContext'
import { fmt } from '@/lib/format'
import type { Debt, DebtType } from '@/lib/types'

const DEBT_TYPES: { value: DebtType; label: string }[] = [
  { value: 'credit_card', label: 'Credit Card' },
  { value: 'loan', label: 'Personal Loan' },
  { value: 'mortgage', label: 'Mortgage' },
  { value: 'other', label: 'Other' },
]

function blank(): Omit<Debt, 'id'> {
  return { name: '', type: 'credit_card', balance: 0, interestRate: 0, minimumPayment: 0, dueDate: '' }
}

export function Debts() {
  const { data, setDebts } = useAppData()
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState<Debt | null>(null)
  const [form, setForm] = useState(blank())

  const totalDebt = data.debts.reduce((s, d) => s + d.balance, 0)
  const totalMinPayment = data.debts.reduce((s, d) => s + d.minimumPayment, 0)

  const openAdd = () => { setForm(blank()); setEditing(null); setModal(true) }
  const openEdit = (d: Debt) => { setForm({ name: d.name, type: d.type, balance: d.balance, interestRate: d.interestRate, minimumPayment: d.minimumPayment, dueDate: d.dueDate ?? '' }); setEditing(d); setModal(true) }

  const save = () => {
    if (!form.name.trim()) return
    if (editing) {
      setDebts(data.debts.map((d) => d.id === editing.id ? { ...d, ...form } : d))
    } else {
      setDebts([...data.debts, { ...form, id: crypto.randomUUID() }])
    }
    setModal(false)
  }

  const remove = (id: string) => setDebts(data.debts.filter((d) => d.id !== id))

  return (
    <Layout
      title="Debts"
      subtitle={`${data.debts.length} debt${data.debts.length !== 1 ? 's' : ''} tracked`}
      action={<Button onClick={openAdd} size="sm">+ Add Debt</Button>}
    >
      <div className="space-y-3">
        {data.debts.length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            <Card>
              <div className="text-xs text-muted mb-1">Total Debt</div>
              <div className="text-xl font-bold text-accent-red">{fmt(totalDebt)}</div>
            </Card>
            <Card>
              <div className="text-xs text-muted mb-1">Min. Payments/mo</div>
              <div className="text-xl font-bold text-accent-orange">{fmt(totalMinPayment)}</div>
            </Card>
          </div>
        )}

        {data.debts.length === 0
          ? <EmptyState message="No debts tracked yet." />
          : data.debts.map((d) => (
            <Card key={d.id} onClick={() => openEdit(d)}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-medium text-white">{d.name}</div>
                  <div className="text-xs text-muted capitalize mt-0.5">{d.type.replace('_', ' ')} · {d.interestRate}% APR</div>
                  {d.dueDate && <div className="text-xs text-muted mt-0.5">Due: {d.dueDate}</div>}
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <div className="font-semibold text-accent-red">{fmt(d.balance)}</div>
                    <div className="text-xs text-muted">min {fmt(d.minimumPayment)}/mo</div>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); remove(d.id) }} className="text-muted hover:text-accent-red text-sm">✕</button>
                </div>
              </div>
            </Card>
          ))
        }
      </div>

      {modal && (
        <Modal
          title={editing ? 'Edit Debt' : 'Add Debt'}
          onClose={() => setModal(false)}
          footer={
            <>
              <Button variant="ghost" onClick={() => setModal(false)}>Cancel</Button>
              <Button onClick={save}>Save</Button>
            </>
          }
        >
          <div className="space-y-3">
            <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Chase Sapphire" />
            <Select label="Type" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as DebtType })} options={DEBT_TYPES} />
            <Input label="Balance" type="number" step="0.01" value={form.balance} onChange={(e) => setForm({ ...form, balance: parseFloat(e.target.value) || 0 })} />
            <Input label="Interest Rate (%)" type="number" step="0.01" value={form.interestRate} onChange={(e) => setForm({ ...form, interestRate: parseFloat(e.target.value) || 0 })} />
            <Input label="Minimum Payment/mo" type="number" step="0.01" value={form.minimumPayment} onChange={(e) => setForm({ ...form, minimumPayment: parseFloat(e.target.value) || 0 })} />
            <Input label="Due Date (optional)" type="date" value={form.dueDate ?? ''} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
          </div>
        </Modal>
      )}
    </Layout>
  )
}
