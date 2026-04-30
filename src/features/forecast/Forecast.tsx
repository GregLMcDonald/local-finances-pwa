import { useState, useMemo } from 'react'
import { Layout } from '@/components/Layout'
import { Card } from '@/components/Card'
import { Input } from '@/components/Input'
import { useAppData } from '@/context/AppDataContext'
import { fmt, currentMonthRange } from '@/lib/format'
import type { ForecastSettings } from '@/lib/types'

interface YearRow {
  year: number
  age: number
  balance: number
  income: number
  expenses: number
  net: number
  phase: 'working' | 'retired'
}

function buildForecast(
  netWorth: number,
  monthlyIncome: number,
  monthlyExpenses: number,
  settings: ForecastSettings,
): YearRow[] {
  const currentYear = new Date().getFullYear()
  const rows: YearRow[] = []
  const { currentAge, retirementAge, annualReturn, inflation } = settings
  const r = annualReturn / 100
  const inf = inflation / 100

  let balance = netWorth
  let annualIncome = monthlyIncome * 12
  let annualExpenses = monthlyExpenses * 12

  for (let i = 0; i <= 50; i++) {
    const age = currentAge + i
    const year = currentYear + i
    const phase: YearRow['phase'] = age < retirementAge ? 'working' : 'retired'

    const effectiveIncome = phase === 'retired' ? 0 : annualIncome
    const net = effectiveIncome - annualExpenses
    balance = balance * (1 + r) + net

    rows.push({ year, age, balance, income: effectiveIncome, expenses: annualExpenses, net, phase })

    annualIncome *= 1 + inf
    annualExpenses *= 1 + inf
  }

  return rows
}

export function Forecast() {
  const { data, setSettings } = useAppData()
  const { forecast } = data.settings
  const [local, setLocal] = useState<ForecastSettings>(forecast)

  const { start, end } = currentMonthRange()

  const monthlyIncome = data.transactions
    .filter((t) => t.date >= start && t.date <= end && t.type === 'income')
    .reduce((s, t) => s + t.amount, 0)

  const monthlyExpenses = data.transactions
    .filter((t) => t.date >= start && t.date <= end && t.type === 'expense')
    .reduce((s, t) => s + t.amount, 0)

  const netWorth =
    data.accounts.filter((a) => a.type !== 'credit' && a.type !== 'loan').reduce((s, a) => s + a.balance, 0) -
    data.accounts.filter((a) => a.type === 'credit' || a.type === 'loan').reduce((s, a) => s + a.balance, 0)

  const rows = useMemo(() => buildForecast(netWorth, monthlyIncome, monthlyExpenses, local), [netWorth, monthlyIncome, monthlyExpenses, local])

  const atRetirement = rows.find((r) => r.age === local.retirementAge)
  const atAge80 = rows.find((r) => r.age === 80)

  const updateField = (field: keyof ForecastSettings, value: number) => {
    const updated = { ...local, [field]: value }
    setLocal(updated)
    setSettings({ ...data.settings, forecast: updated })
  }

  const runOutYear = rows.find((r) => r.balance <= 0)

  const milestoneRows = rows.filter((r) => r.age % 5 === 0)
  const maxBalance = Math.max(...milestoneRows.map((r) => Math.abs(r.balance)), 1)

  return (
    <Layout title="50-Year Financial Forecast" subtitle="Long-range projection of your financial trajectory">
      <div className="space-y-4">
        {runOutYear && (
          <div className="bg-red-950/50 border border-red-800 rounded-xl p-3 text-sm text-red-300 flex gap-2">
            <span>⚠</span>
            <span>Warning: At current pace, funds may run out at age {runOutYear.age} ({runOutYear.year}). Consider increasing savings or reducing expenses.</span>
          </div>
        )}

        <Card>
          <div className="text-xs text-muted font-semibold mb-3 tracking-widest">ASSUMPTIONS</div>
          <div className="space-y-3">
            <Input label="Current Age" type="number" value={local.currentAge} onChange={(e) => updateField('currentAge', parseInt(e.target.value) || 30)} />
            <Input label="Retirement Age" type="number" value={local.retirementAge} onChange={(e) => updateField('retirementAge', parseInt(e.target.value) || 65)} />
            <Input label="Annual Return (%)" type="number" step="0.1" value={local.annualReturn} onChange={(e) => updateField('annualReturn', parseFloat(e.target.value) || 7)} />
            <Input label="Inflation (%)" type="number" step="0.1" value={local.inflation} onChange={(e) => updateField('inflation', parseFloat(e.target.value) || 2.5)} />
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-accent-blue">◎</span>
            <span className="text-sm text-muted">At Retirement (age {local.retirementAge})</span>
          </div>
          <div className={`text-2xl font-bold ${(atRetirement?.balance ?? 0) >= 0 ? 'text-white' : 'text-accent-red'}`}>
            {fmt(atRetirement?.balance ?? 0)}
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-accent-purple">📅</span>
            <span className="text-sm text-muted">At Age 80</span>
          </div>
          <div className={`text-2xl font-bold ${(atAge80?.balance ?? 0) >= 0 ? 'text-white' : 'text-accent-red'}`}>
            {fmt(atAge80?.balance ?? 0)}
          </div>
        </Card>

        <Card>
          <div className="font-semibold text-white mb-4 flex items-center gap-2">↗ Wealth Trajectory</div>
          <div className="space-y-2">
            {milestoneRows.map((row) => {
              const pct = Math.max(0, (Math.abs(row.balance) / maxBalance) * 100)
              const isRetired = row.phase === 'retired'
              return (
                <div key={row.year} className="flex items-center gap-3">
                  <div className={`text-xs w-10 shrink-0 ${isRetired ? 'text-accent-orange' : 'text-muted'}`}>{row.year}</div>
                  <div className={`text-xs w-8 shrink-0 ${isRetired ? 'text-accent-orange' : 'text-muted'}`}>{row.age}y</div>
                  <div className="flex-1 h-2 bg-border rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${row.balance < 0 ? 'bg-accent-red' : isRetired ? 'bg-accent-orange' : 'bg-gray-500'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className={`text-xs w-20 text-right shrink-0 ${row.balance < 0 ? 'text-accent-red' : 'text-muted'}`}>
                    {fmt(row.balance)}
                  </div>
                </div>
              )
            })}
          </div>
          <div className="flex gap-4 mt-3 text-xs text-muted">
            <span className="flex items-center gap-1"><span className="w-2 h-2 bg-gray-500 rounded-full inline-block" /> Working</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 bg-accent-orange rounded-full inline-block" /> Retired</span>
          </div>
        </Card>

        <Card>
          <div className="font-semibold text-white mb-3">Year-by-Year Breakdown</div>
          <div className="overflow-x-auto -mx-1">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-muted border-b border-border">
                  <th className="text-left pb-2 pr-2">Year</th>
                  <th className="text-left pb-2 pr-2">Age</th>
                  <th className="text-right pb-2 pr-2">Balance</th>
                  <th className="text-right pb-2 pr-2">Income</th>
                  <th className="text-right pb-2 pr-2">Expenses</th>
                  <th className="text-right pb-2 pr-2">Net</th>
                  <th className="text-right pb-2">Phase</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.year} className={`border-b border-border/50 ${row.phase === 'retired' ? 'text-accent-orange' : 'text-white'}`}>
                    <td className="py-1.5 pr-2">{row.year}</td>
                    <td className="py-1.5 pr-2">{row.age}</td>
                    <td className={`py-1.5 pr-2 text-right font-medium ${row.balance < 0 ? 'text-accent-red' : ''}`}>{fmt(row.balance)}</td>
                    <td className="py-1.5 pr-2 text-right">{fmt(row.income)}</td>
                    <td className="py-1.5 pr-2 text-right">{fmt(row.expenses)}</td>
                    <td className={`py-1.5 pr-2 text-right ${row.net >= 0 ? 'text-accent-green' : 'text-accent-red'}`}>{fmt(row.net)}</td>
                    <td className="py-1.5 text-right capitalize">{row.phase[0].toUpperCase()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </Layout>
  )
}
