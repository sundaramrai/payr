import { Transaction } from '@/types'

const STORAGE_KEY = 'payr_transactions'
const TRANSACTION_HISTORY_LIMIT = 20

export function loadTransactions(): Transaction[] {
  if (globalThis.window === undefined) return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? (JSON.parse(raw) as unknown) : []
    return Array.isArray(parsed) ? (parsed as Transaction[]) : []
  } catch {
    return []
  }
}

export function saveTransactions(transactions: Transaction[]): void {
  if (globalThis.window === undefined) return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions))
  } catch {
    // Silently fail if storage is unavailable
  }
}

export function upsertTransaction(
  transactions: Transaction[],
  next: Transaction
): Transaction[] {
  return [next, ...transactions.filter((transaction) => transaction.id !== next.id)].slice(
    0,
    TRANSACTION_HISTORY_LIMIT
  )
}
