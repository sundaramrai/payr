'use client'

import { useEffect, useRef, useState } from 'react'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Transaction } from '@/types'
import { formatCurrency } from '@/utils/currency'
import { cn } from '@/utils/cn'

interface Props {
  readonly transactions: ReadonlyArray<Transaction>
}

function formatTransactionTimestamp(iso: string): string {
  const date = new Date(iso)
  const now = new Date()
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()

  const yesterday = new Date(now)
  yesterday.setDate(now.getDate() - 1)
  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear()

  const time = date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })

  if (isToday) return `Today / ${time}`
  if (isYesterday) return `Yesterday / ${time}`
  return `${date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} / ${time}`
}

function getTransactionStatusLabel(status: Transaction['status']): string {
  if (status === 'success') return 'Success'
  if (status === 'timeout') return 'Timed out'
  return 'Failed'
}

function getTransactionTone(status: Transaction['status']): 'danger' | 'success' | 'warning' {
  if (status === 'success') return 'success'
  if (status === 'timeout') return 'warning'
  return 'danger'
}

interface DetailModalProps {
  readonly tx: Transaction
  readonly onClose: () => void
}

function TransactionDetail({ tx, onClose }: DetailModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    const handleBackdropClick = (event: MouseEvent) => {
      if (event.target === dialog) {
        onClose()
      }
    }

    dialog.addEventListener('click', handleBackdropClick)

    if (!dialog.open) {
      dialog.showModal()
    }

    return () => {
      dialog.removeEventListener('click', handleBackdropClick)

      if (dialog.open) {
        dialog.close()
      }
    }
  }, [onClose])

  return (
    <dialog
      ref={dialogRef}
      className="tx-detail-overlay m-auto w-full max-w-none bg-transparent p-0 md:p-6"
      aria-label="Transaction details"
      aria-modal="true"
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
    >
      <div className="border-ink mx-auto w-full max-w-xl border-2 bg-cream">
        <div className="bg-ink flex items-center justify-between px-4 py-3">
          <span className="text-[0.68rem] font-bold uppercase tracking-[0.08em] text-cream">
            Transaction detail
          </span>
          <button
            className="flex size-6 items-center justify-center rounded-sm border border-cream/20 font-mono text-[0.7rem] text-cream"
            type="button"
            onClick={onClose}
            aria-label="Close detail panel"
          >
            ×
          </button>
        </div>

        <div className="py-2">
          {[
            { label: 'Transaction ID', value: tx.id, mono: true },
            { label: 'Amount', value: formatCurrency(tx.amount, tx.currency), mono: false },
            { label: 'Currency', value: tx.currency, mono: false },
            { label: 'Status', value: getTransactionStatusLabel(tx.status), mono: false },
            {
              label: 'Timestamp',
              value: formatTransactionTimestamp(tx.timestamp),
              mono: false,
            },
            { label: 'Attempts', value: String(tx.attempts), mono: false },
          ].map(({ label, value, mono }) => (
            <div
              key={label}
              className="border-ink/10 flex items-start justify-between gap-3 border-b px-4 py-3 last:border-b-0"
            >
              <span className="pt-0.5 font-mono text-[0.5rem] font-light uppercase tracking-[0.14em] text-ink/45">
                {label}
              </span>
              {label === 'Status' ? (
                <StatusBadge tone={getTransactionTone(tx.status)} className="text-[0.46rem]">
                  {value}
                </StatusBadge>
              ) : (
                <span
                  className={cn(
                    'text-right font-mono text-[0.68rem] break-all',
                    mono && 'text-[0.58rem] tracking-[0.06em] text-ink/75'
                  )}
                >
                  {value}
                </span>
              )}
            </div>
          ))}

          {tx.reason && (
            <div className="flex items-start justify-between gap-3 px-4 py-3">
              <span className="pt-0.5 font-mono text-[0.5rem] font-light uppercase tracking-[0.14em] text-ink/45">
                Reason
              </span>
              <span className="max-w-[70%] text-right font-mono text-[0.68rem] wrap-break-word">
                {tx.reason}
              </span>
            </div>
          )}
        </div>
      </div>
    </dialog>
  )
}

export function TransactionHistory({ transactions }: Props) {
  const [selected, setSelected] = useState<Transaction | null>(null)
  const transactionCountLabel = `${transactions.length} transaction${transactions.length === 1 ? '' : 's'}`
  const historyHint = transactions.length === 0 ? 'No transactions yet' : `${transactionCountLabel} / Click to view`

  return (
    <>
      <section className="mt-7">
        <div className="border-ink bg-ink flex items-center justify-between gap-3 border-2 px-4 py-3">
          <span className="text-[0.68rem] font-bold uppercase tracking-[0.08em] text-cream">
            Transaction history
          </span>
          <span className="font-mono text-[0.56rem] tracking-[0.06em] text-amber">
            {historyHint}
          </span>
        </div>

        {transactions.length === 0 ? (
          <div className="border-ink border-x-2 border-b-2 px-6 py-8 text-center">
            <span className="font-mono text-[0.62rem] uppercase tracking-widest text-ink/35">
              Your transactions will appear here
            </span>
          </div>
        ) : (
          <ul className="border-ink border-x-2 border-b-2" aria-label="Transaction history">
            {transactions.map((transaction) => (
              <li key={transaction.id}>
                <button
                  className="border-ink/20 grid w-full grid-cols-[1fr_auto] gap-3 border-b px-4 py-3 text-left transition hover:bg-ink/3 sm:grid-cols-[1fr_auto_auto] last:border-b-0"
                  type="button"
                  onClick={() => setSelected(transaction)}
                  aria-label={`Transaction ${transaction.id.slice(0, 8)}, ${formatCurrency(transaction.amount, transaction.currency)}, ${getTransactionStatusLabel(transaction.status)}`}
                >
                  <div className="min-w-0">
                    <div className="mb-1 truncate font-mono text-[0.56rem] font-light tracking-widest text-ink/35">
                      {transaction.id.length > 24 ? `${transaction.id.slice(0, 24)}...` : transaction.id}
                    </div>
                    <div className="font-mono text-[0.78rem] font-semibold text-ink">
                      {formatCurrency(transaction.amount, transaction.currency)}
                    </div>
                  </div>
                  <div className="hidden whitespace-nowrap text-right font-mono text-[0.5rem] tracking-[0.06em] text-ink/35 sm:block">
                    {formatTransactionTimestamp(transaction.timestamp)}
                  </div>
                  <div className="justify-self-end">
                    <StatusBadge tone={getTransactionTone(transaction.status)} className="text-[0.46rem]">
                      {getTransactionStatusLabel(transaction.status)}
                    </StatusBadge>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {selected && <TransactionDetail tx={selected} onClose={() => setSelected(null)} />}
    </>
  )
}
