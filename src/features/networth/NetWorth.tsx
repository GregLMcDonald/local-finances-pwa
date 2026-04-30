import { Layout } from '@/components/Layout'
import { Card } from '@/components/Card'
import { useAppData } from '@/context/AppDataContext'
import { fmt } from '@/lib/format'
import type { Account } from '@/lib/types'

const TYPE_LABEL: Record<Account['type'], string> = {
  checking: 'Checking',
  savings: 'Savings',
  investment: 'Investment',
  credit: 'Credit Card',
  loan: 'Loan',
  other: 'Other',
}

export function NetWorth() {
  const { data } = useAppData()

  const assets = data.accounts.filter((a) => a.type !== 'credit' && a.type !== 'loan')
  const liabilities = data.accounts.filter((a) => a.type === 'credit' || a.type === 'loan')

  const totalAssets = assets.reduce((s, a) => s + a.balance, 0)
  const totalLiabilities = liabilities.reduce((s, a) => s + a.balance, 0)
  const netWorth = totalAssets - totalLiabilities

  return (
    <Layout title="Net Worth" subtitle="Assets minus liabilities">
      <div className="space-y-3">
        <Card>
          <div className="text-sm text-muted mb-1">Net Worth</div>
          <div className={`text-3xl font-bold ${netWorth >= 0 ? 'text-accent-green' : 'text-accent-red'}`}>
            {fmt(netWorth)}
          </div>
        </Card>

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

        {assets.length > 0 && (
          <Card>
            <div className="font-medium text-white mb-3">Assets</div>
            <div className="space-y-2">
              {assets.map((a) => (
                <div key={a.id} className="flex justify-between items-center text-sm">
                  <div>
                    <div className="text-white">{a.name}</div>
                    <div className="text-xs text-muted">{TYPE_LABEL[a.type]}</div>
                  </div>
                  <span className="text-accent-green font-medium">{fmt(a.balance)}</span>
                </div>
              ))}
            </div>
          </Card>
        )}

        {liabilities.length > 0 && (
          <Card>
            <div className="font-medium text-white mb-3">Liabilities</div>
            <div className="space-y-2">
              {liabilities.map((a) => (
                <div key={a.id} className="flex justify-between items-center text-sm">
                  <div>
                    <div className="text-white">{a.name}</div>
                    <div className="text-xs text-muted">{TYPE_LABEL[a.type]}</div>
                  </div>
                  <span className="text-accent-red font-medium">{fmt(a.balance)}</span>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </Layout>
  )
}
