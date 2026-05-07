import { Transaction } from '@/types'

const STORAGE_KEY = 'payr_transactions'

export function loadTransactions(): Transaction[] {
  if (globalThis.window === undefined) return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Transaction[]) : []
  } catch {
    return []
  }
}

export function saveTransactions(transactions: Transaction[]): void {
  if (globalThis.window === undefined) return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions))
  } catch {
    // storage unavailable — fail silently
  }
}

export function upsertTransaction(
  transactions: Transaction[],
  next: Transaction
): Transaction[] {
  const idx = transactions.findIndex((t) => t.id === next.id)
  if (idx === -1) return [next, ...transactions]
  const updated = [...transactions]
  updated[idx] = next
  return updated
}
