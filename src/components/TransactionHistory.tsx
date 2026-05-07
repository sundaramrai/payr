'use client'

import { useEffect, useRef, useState } from 'react'
import { Transaction } from '@/types'
import { formatCurrency } from '@/utils/currency'

interface Props {
  readonly transactions: ReadonlyArray<Transaction>
}

function formatTimestamp(iso: string): string {
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

function statusClass(status: Transaction['status']): string {
  if (status === 'success') return 'tag-success'
  if (status === 'timeout') return 'tag-timeout'
  return 'tag-failed'
}

function statusLabel(status: Transaction['status']): string {
  if (status === 'success') return 'Success'
  if (status === 'timeout') return 'Timeout'
  return 'Failed'
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

    if (!dialog.open) {
      dialog.showModal()
    }

    return () => {
      if (dialog.open) {
        dialog.close()
      }
    }
  }, [])

  return (
    <dialog
      ref={dialogRef}
      className="tx-detail-overlay"
      aria-label="Transaction details"
      aria-modal="true"
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
    >
      <div className="tx-detail-panel">
        <div className="tx-detail-header">
          <span className="tx-detail-title">Transaction Detail</span>
          <button className="tx-detail-close" type="button" onClick={onClose} aria-label="Close detail panel">✕</button>
        </div>

        <div className="tx-detail-body">
          <div className="tx-detail-row">
            <span className="tx-detail-label">Transaction ID</span>
            <span className="tx-detail-val tx-detail-mono">{tx.id}</span>
          </div>
          <div className="tx-detail-row">
            <span className="tx-detail-label">Amount</span>
            <span className="tx-detail-val">{formatCurrency(tx.amount, tx.currency)}</span>
          </div>
          <div className="tx-detail-row">
            <span className="tx-detail-label">Currency</span>
            <span className="tx-detail-val">{tx.currency}</span>
          </div>
          <div className="tx-detail-row">
            <span className="tx-detail-label">Status</span>
            <span className={`tx-status-tag ${statusClass(tx.status)}`}>{statusLabel(tx.status)}</span>
          </div>
          {tx.reason && (
            <div className="tx-detail-row">
              <span className="tx-detail-label">Reason</span>
              <span className="tx-detail-val">{tx.reason}</span>
            </div>
          )}
          <div className="tx-detail-row">
            <span className="tx-detail-label">Timestamp</span>
            <span className="tx-detail-val">{formatTimestamp(tx.timestamp)}</span>
          </div>
          <div className="tx-detail-row">
            <span className="tx-detail-label">Attempts</span>
            <span className="tx-detail-val">{tx.attempts}</span>
          </div>
        </div>
      </div>
    </dialog>
  )
}

export function TransactionHistory({ transactions }: Props) {
  const [selected, setSelected] = useState<Transaction | null>(null)

  if (transactions.length === 0) {
    return (
      <div className="history-section">
        <div className="section-header">
          <span className="section-title">Transaction history</span>
          <span className="section-meta">No transactions yet</span>
        </div>
        <div className="tx-empty">
          <span className="tx-empty-text">Your transactions will appear here</span>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="history-section">
        <div className="section-header">
          <span className="section-title">Transaction history</span>
          <span className="section-meta">
            {transactions.length} transaction{transactions.length === 1 ? '' : 's'} / Click to view
          </span>
        </div>

        <ul className="tx-list" aria-label="Transaction history">
          {transactions.map((transaction) => (
            <li key={transaction.id}>
              <button
                className="tx-row"
                type="button"
                onClick={() => setSelected(transaction)}
                aria-label={`Transaction ${transaction.id.slice(0, 8)}, ${formatCurrency(transaction.amount, transaction.currency)}, ${statusLabel(transaction.status)}`}
              >
                <div className="tx-left">
                  <div className="tx-id-text">{`${transaction.id.slice(0, 24)}...`}</div>
                  <div className="tx-amount-text">{formatCurrency(transaction.amount, transaction.currency)}</div>
                </div>
                <div className="tx-time">{formatTimestamp(transaction.timestamp)}</div>
                <div className={`tx-status-tag ${statusClass(transaction.status)}`}>
                  {statusLabel(transaction.status)}
                </div>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {selected && <TransactionDetail tx={selected} onClose={() => setSelected(null)} />}
    </>
  )
}
