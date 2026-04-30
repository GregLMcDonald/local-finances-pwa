import type { Transaction } from './types'

function randomId() {
  return crypto.randomUUID()
}

export function parseCSV(text: string, accountId: string): Transaction[] {
  const lines = text.trim().split('\n')
  if (lines.length < 2) return []

  const headers = lines[0].split(',').map((h) => h.trim().toLowerCase().replace(/"/g, ''))

  const col = (row: string[], name: string) => {
    const idx = headers.indexOf(name)
    return idx >= 0 ? row[idx]?.replace(/"/g, '').trim() : ''
  }

  return lines.slice(1).flatMap((line) => {
    const row = line.split(',')
    const dateStr = col(row, 'date') || col(row, 'transaction date') || col(row, 'posting date')
    const desc =
      col(row, 'description') || col(row, 'memo') || col(row, 'name') || col(row, 'payee')
    const amountStr = col(row, 'amount') || col(row, 'debit') || col(row, 'credit') || '0'
    const amount = parseFloat(amountStr.replace(/[$,]/g, ''))
    if (!dateStr || isNaN(amount)) return []
    return [
      {
        id: randomId(),
        accountId,
        date: new Date(dateStr).toISOString().split('T')[0],
        description: desc,
        amount: Math.abs(amount),
        type: amount < 0 ? 'expense' : 'income',
        category: 'Uncategorized',
      } satisfies Transaction,
    ]
  })
}

export function parseOFX(text: string, accountId: string): Transaction[] {
  const transactions: Transaction[] = []
  const stmtTrnRegex = /<STMTTRN>([\s\S]*?)<\/STMTTRN>/gi
  let match: RegExpExecArray | null

  const tag = (block: string, name: string) => {
    const m = block.match(new RegExp(`<${name}>([^<\n\r]+)`, 'i'))
    return m ? m[1].trim() : ''
  }

  while ((match = stmtTrnRegex.exec(text)) !== null) {
    const block = match[1]
    const trntype = tag(block, 'TRNTYPE').toLowerCase()
    const dtposted = tag(block, 'DTPOSTED')
    const trnamt = parseFloat(tag(block, 'TRNAMT'))
    const memo = tag(block, 'MEMO') || tag(block, 'NAME')

    if (!dtposted || isNaN(trnamt)) continue

    const year = dtposted.slice(0, 4)
    const month = dtposted.slice(4, 6)
    const day = dtposted.slice(6, 8)
    const date = `${year}-${month}-${day}`

    const isExpense = trntype === 'debit' || trnamt < 0

    transactions.push({
      id: randomId(),
      accountId,
      date,
      description: memo,
      amount: Math.abs(trnamt),
      type: isExpense ? 'expense' : 'income',
      category: 'Uncategorized',
    })
  }

  return transactions
}
