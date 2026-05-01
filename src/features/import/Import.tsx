import { useState, useRef } from 'react'
import { Layout } from '@/components/Layout'
import { Card } from '@/components/Card'
import { Button } from '@/components/Button'
import { Select } from '@/components/Input'
import { useAppData } from '@/context/AppDataContext'
import { parseCSV, parseOFX, detectOFXAccountId } from '@/lib/parsers'
import { fmt, fmtDate } from '@/lib/format'
import type { Transaction } from '@/lib/types'

type Step = 'upload' | 'preview' | 'done'

export function Import() {
  const { data, setTransactions } = useAppData()
  const [step, setStep] = useState<Step>('upload')
  const [parsed, setParsed] = useState<Transaction[]>([])
  const [accountId, setAccountId] = useState(data.accounts[0]?.id ?? '')
  const [detectedAccountName, setDetectedAccountName] = useState<string | null>(null)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const accountOptions = data.accounts.map((a) => ({ value: a.id, label: a.name }))

  const handleFile = async (file: File) => {
    setError('')
    setDetectedAccountName(null)
    const text = await file.text()
    const ext = file.name.split('.').pop()?.toLowerCase()
    let txns: Transaction[] = []
    let resolvedAccountId = accountId

    if (ext === 'csv') {
      txns = parseCSV(text, resolvedAccountId)
    } else if (ext === 'ofx' || ext === 'qfx') {
      const ofxId = detectOFXAccountId(text)
      if (ofxId) {
        const matched = data.accounts.find((a) => a.reconciliationId === ofxId)
        if (matched) {
          resolvedAccountId = matched.id
          setAccountId(matched.id)
          setDetectedAccountName(matched.name)
        }
      }
      txns = parseOFX(text, resolvedAccountId)
    } else {
      setError('Unsupported file type. Please upload a CSV or OFX/QFX file.')
      return
    }

    if (txns.length === 0) {
      setError('No transactions found in file.')
      return
    }
    setParsed(txns)
    setStep('preview')
  }

  const confirm = () => {
    const existing = new Set(
      data.transactions.map((t) => `${t.date}|${t.description}|${t.amount}`)
    )
    const deduped = parsed.filter(
      (t) => !existing.has(`${t.date}|${t.description}|${t.amount}`)
    )
    setTransactions([...data.transactions, ...deduped])
    setParsed(deduped)
    setStep('done')
  }

  const reset = () => {
    setStep('upload')
    setParsed([])
    setError('')
    setDetectedAccountName(null)
  }

  return (
    <Layout title="Import" subtitle="Import transactions from CSV or OFX files">
      <div className="space-y-4">
        {step === 'upload' && (
          <>
            {accountOptions.length > 0 && (
              <Select
                label="Import into account"
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                options={accountOptions}
              />
            )}
            {accountOptions.length === 0 && (
              <div className="text-sm text-accent-yellow bg-yellow-950/30 border border-yellow-800 rounded-xl p-3">
                Add an account first before importing transactions.
              </div>
            )}

            <input
              ref={fileRef}
              type="file"
              accept=".csv,.ofx,.qfx"
              className="hidden"
              onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]) }}
            />

            <Card
              onClick={() => accountOptions.length > 0 && fileRef.current?.click()}
              className={`border-dashed border-2 flex flex-col items-center justify-center gap-3 py-12 ${accountOptions.length === 0 ? 'opacity-40 cursor-not-allowed' : 'hover:border-gray-500 cursor-pointer'}`}
            >
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-muted">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              <div className="text-center">
                <div className="text-white font-medium">Click to upload CSV or OFX file</div>
                <div className="text-muted text-sm mt-1">Supports CSV and OFX/QFX (bank statement) files</div>
              </div>
            </Card>

            {error && <p className="text-accent-red text-sm">{error}</p>}
          </>
        )}

        {step === 'preview' && (
          <>
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted">{parsed.length} transaction{parsed.length !== 1 ? 's' : ''} found</p>
              <Button variant="ghost" size="sm" onClick={reset}>← Back</Button>
            </div>

            {detectedAccountName && (
              <div className="text-sm text-accent-green bg-green-950/30 border border-green-800 rounded-xl px-3 py-2 flex items-center gap-2">
                <span>✓</span>
                <span>Auto-matched to <strong>{detectedAccountName}</strong> via Reconciliation ID</span>
              </div>
            )}

            <div className="space-y-2 max-h-[50vh] overflow-y-auto">
              {parsed.map((t) => (
                <Card key={t.id}>
                  <div className="flex justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-white truncate">{t.description}</div>
                      <div className="text-xs text-muted">{fmtDate(t.date)}</div>
                    </div>
                    <span className={`text-sm font-semibold shrink-0 ${t.type === 'income' ? 'text-accent-green' : 'text-white'}`}>
                      {t.type === 'income' ? '+' : '-'}{fmt(t.amount)}
                    </span>
                  </div>
                </Card>
              ))}
            </div>
            <Button onClick={confirm} className="w-full">Import {parsed.length} Transactions</Button>
          </>
        )}

        {step === 'done' && (
          <Card className="text-center py-8">
            <div className="text-4xl mb-3">✓</div>
            <div className="text-white font-semibold">Import complete</div>
            <div className="text-muted text-sm mt-1">{parsed.length} transaction{parsed.length !== 1 ? 's' : ''} imported</div>
            <Button onClick={reset} className="mt-4">Import Another File</Button>
          </Card>
        )}
      </div>
    </Layout>
  )
}
