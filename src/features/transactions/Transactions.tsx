import { useState, useMemo } from 'react'
import { Layout } from '@/components/Layout'
import { Card } from '@/components/Card'
import { Button } from '@/components/Button'
import { Modal } from '@/components/Modal'
import { Input, Select } from '@/components/Input'
import { EmptyState } from '@/components/EmptyState'
import { useAppData } from '@/context/AppDataContext'
import { fmt, fmtDate, today } from '@/lib/format'
import type { Transaction, TransactionType } from '@/lib/types'

type Filter = 'all' | 'income' | 'expense'

const CATEGORIES = [
  'Uncategorized', 'Food & Dining', 'Transport', 'Housing', 'Utilities',
  'Entertainment', 'Health', 'Shopping', 'Travel', 'Income', 'Other',
].map((c) => ({ value: c, label: c }))

function blank(accounts: { id: string; name: string }[]): Omit<Transaction, 'id'> {
  return {
    accountId: accounts[0]?.id ?? '',
    date: today(),
    description: '',
    amount: 0,
    type: 'expense',
    category: 'Uncategorized',
    notes: '',
  }
}

export function Transactions() {
  const { data, setTransactions } = useAppData()
  const [filter, setFilter] = useState<Filter>('all')
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState<Transaction | null>(null)
  const [form, setForm] = useState<Omit<Transaction, 'id'>>(() => blank(data.accounts))

  const accountOptions = data.accounts.map((a) => ({ value: a.id, label: a.name }))

  const visible = useMemo(() => {
    const base = filter === 'all' ? data.transactions : data.transactions.filter((t) => t.type === filter)
    return [...base].sort((a, b) => b.date.localeCompare(a.date))
  }, [data.transactions, filter])

  const openAdd = () => {
    setForm(blank(data.accounts))
    setEditing(null)
    setModal(true)
  }

  const openEdit = (t: Transaction) => {
    setForm({ accountId: t.accountId, date: t.date, description: t.description, amount: t.amount, type: t.type, category: t.category, notes: t.notes })
    setEditing(t)
    setModal(true)
  }

  const close = () => setModal(false)

  const save = () => {
    if (!form.description.trim()) return
    if (editing) {
      setTransactions(data.transactions.map((t) => t.id === editing.id ? { ...form, id: editing.id } : t))
    } else {
      setTransactions([...data.transactions, { ...form, id: crypto.randomUUID() }])
    }
    close()
  }

  const remove = (id: string) => setTransactions(data.transactions.filter((t) => t.id !== id))

  const accountName = (id: string) => data.accounts.find((a) => a.id === id)?.name ?? '—'

  return (
    <Layout
      title="Transactions"
      subtitle={`${data.transactions.length} transaction${data.transactions.length !== 1 ? 's' : ''}`}
      action={<Button onClick={openAdd} size="sm">+ Add Transaction</Button>}
    >
      <div className="space-y-3">
        <div className="flex gap-2">
          {(['all', 'income', 'expense'] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-sm border transition-colors capitalize ${
                filter === f ? 'border-white text-white' : 'border-border text-muted hover:text-white'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {visible.length === 0
          ? <EmptyState message="No transactions yet." />
          : visible.map((t) => (
            <Card key={t.id} onClick={() => openEdit(t)}>
              <div className="flex items-center justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-white truncate">{t.description}</div>
                  <div className="text-xs text-muted mt-0.5">{fmtDate(t.date)} · {t.category} · {accountName(t.accountId)}</div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`font-semibold ${t.type === 'income' ? 'text-accent-green' : 'text-white'}`}>
                    {t.type === 'income' ? '+' : '-'}{fmt(t.amount)}
                  </span>
                  <button onClick={(e) => { e.stopPropagation(); remove(t.id) }} className="text-muted hover:text-accent-red text-sm">✕</button>
                </div>
              </div>
            </Card>
          ))
        }
      </div>

      {modal && (
        <Modal
          title={editing ? 'Edit Transaction' : 'Add Transaction'}
          onClose={close}
          footer={
            <>
              <Button variant="ghost" onClick={close}>Cancel</Button>
              <Button onClick={save}>Save</Button>
            </>
          }
        >
          <div className="space-y-3">
            <Input label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="e.g. Grocery store" />
            <Input label="Amount" type="number" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: parseFloat(e.target.value) || 0 })} />
            <Select label="Type" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as TransactionType })} options={[{ value: 'expense', label: 'Expense' }, { value: 'income', label: 'Income' }]} />
            <Input label="Date" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            <Select label="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} options={CATEGORIES} />
            {accountOptions.length > 0 && (
              <Select label="Account" value={form.accountId} onChange={(e) => setForm({ ...form, accountId: e.target.value })} options={accountOptions} />
            )}
            <Input label="Notes (optional)" value={form.notes ?? ''} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>
        </Modal>
      )}
    </Layout>
  )
}
