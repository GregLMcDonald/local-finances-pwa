import { useState } from 'react'
import { Layout } from '@/components/Layout'
import { Card } from '@/components/Card'
import { Button } from '@/components/Button'
import { Modal } from '@/components/Modal'
import { Input, Select } from '@/components/Input'
import { EmptyState } from '@/components/EmptyState'
import { useAppData } from '@/context/AppDataContext'
import { fmt } from '@/lib/format'
import type { Account, AccountType } from '@/lib/types'

const ACCOUNT_TYPES: { value: AccountType; label: string }[] = [
  { value: 'checking', label: 'Checking' },
  { value: 'savings', label: 'Savings' },
  { value: 'credit', label: 'Credit Card' },
  { value: 'investment', label: 'Investment' },
  { value: 'loan', label: 'Loan' },
  { value: 'other', label: 'Other' },
]

const TYPE_COLORS: Record<AccountType, string> = {
  checking: 'text-accent-blue',
  savings: 'text-accent-green',
  credit: 'text-accent-orange',
  investment: 'text-accent-purple',
  loan: 'text-accent-red',
  other: 'text-muted',
}

function blank(): Omit<Account, 'id' | 'createdAt'> {
  return { name: '', type: 'checking', balance: 0, currency: 'USD', reconciliationId: '' }
}

export function Accounts() {
  const { data, setAccounts } = useAppData()
  const [modal, setModal] = useState<'add' | 'edit' | null>(null)
  const [editing, setEditing] = useState<Account | null>(null)
  const [form, setForm] = useState(blank())

  const openAdd = () => { setForm(blank()); setEditing(null); setModal('add') }
  const openEdit = (a: Account) => { setForm({ name: a.name, type: a.type, balance: a.balance, currency: a.currency, reconciliationId: a.reconciliationId ?? '' }); setEditing(a); setModal('edit') }
  const close = () => setModal(null)

  const save = () => {
    if (!form.name.trim()) return
    if (editing) {
      setAccounts(data.accounts.map((a) => a.id === editing.id ? { ...a, ...form } : a))
    } else {
      const now = new Date().toISOString()
      setAccounts([...data.accounts, { ...form, id: crypto.randomUUID(), createdAt: now }])
    }
    close()
  }

  const remove = (id: string) => {
    setAccounts(data.accounts.filter((a) => a.id !== id))
  }

  const totalAssets = data.accounts.filter(a => a.type !== 'credit' && a.type !== 'loan').reduce((s, a) => s + a.balance, 0)
  const totalLiabilities = data.accounts.filter(a => a.type === 'credit' || a.type === 'loan').reduce((s, a) => s + a.balance, 0)

  return (
    <Layout
      title="Accounts"
      subtitle={`${data.accounts.length} account${data.accounts.length !== 1 ? 's' : ''}`}
      action={<Button onClick={openAdd} size="sm">+ Add Account</Button>}
    >
      <div className="space-y-3">
        {data.accounts.length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            <Card>
              <div className="text-xs text-muted mb-1">Total Assets</div>
              <div className="text-xl font-bold text-accent-green">{fmt(totalAssets)}</div>
            </Card>
            <Card>
              <div className="text-xs text-muted mb-1">Total Liabilities</div>
              <div className="text-xl font-bold text-accent-red">{fmt(totalLiabilities)}</div>
            </Card>
          </div>
        )}

        {data.accounts.length === 0
          ? <EmptyState message="No accounts yet. Add your first account." />
          : data.accounts.map((a) => (
            <Card key={a.id} onClick={() => openEdit(a)}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-white">{a.name}</div>
                  <div className={`text-xs mt-0.5 capitalize ${TYPE_COLORS[a.type]}`}>{a.type.replace('_', ' ')}</div>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`font-semibold ${a.balance >= 0 ? 'text-white' : 'text-accent-red'}`}>{fmt(a.balance)}</div>
                  <button
                    onClick={(e) => { e.stopPropagation(); remove(a.id) }}
                    className="text-muted hover:text-accent-red text-sm transition-colors"
                  >✕</button>
                </div>
              </div>
            </Card>
          ))
        }
      </div>

      {modal && (
        <Modal
          title={modal === 'add' ? 'Add Account' : 'Edit Account'}
          onClose={close}
          footer={
            <>
              <Button variant="ghost" onClick={close}>Cancel</Button>
              <Button onClick={save}>Save</Button>
            </>
          }
        >
          <div className="space-y-3">
            <Input label="Account Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Desjardins Chequing" />
            <Select label="Type" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as AccountType })} options={ACCOUNT_TYPES} />
            <Input label="Balance" type="number" step="0.01" value={form.balance} onChange={(e) => setForm({ ...form, balance: parseFloat(e.target.value) || 0 })} />
            <Input
              label="Reconciliation ID (optional)"
              value={form.reconciliationId ?? ''}
              onChange={(e) => setForm({ ...form, reconciliationId: e.target.value })}
              placeholder="e.g. 815-10101-0773335-PCA"
            />
            <p className="text-xs text-muted -mt-1">Paste the ACCTID from your bank's OFX/QFX file. Used to auto-match accounts on import.</p>
          </div>
        </Modal>
      )}
    </Layout>
  )
}
