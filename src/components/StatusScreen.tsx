'use client'

import { useEffect, useRef } from 'react'
import { PaymentStatus } from '@/types'

interface Props {
  readonly status: PaymentStatus
  readonly failureReason: string | null
  readonly transactionId: string | null
  readonly amount: string
  readonly currency: string
}

export function StatusScreen({ status, failureReason, transactionId, amount, currency }: Props) {
  const headingRef = useRef<HTMLHeadingElement>(null)

  // Move focus to result heading after transition so screen readers announce it
  useEffect(() => {
    if (status === 'success' || status === 'failed' || status === 'timeout') {
      headingRef.current?.focus()
    }
  }, [status])

  if (status === 'processing') {
    return (
      <div className="status-screen" role="status" aria-live="polite" aria-label="Processing payment">
        <div className="status-processing-ring" aria-hidden="true" />
        <p className="status-title">Processing payment</p>
        <p className="status-sub">Please do not close this window</p>
      </div>
    )
  }

  if (status === 'success') {
    return (
      <section className="status-screen status-success-screen" aria-label="Payment successful">
        <div className="status-icon-box success-icon" aria-hidden="true">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <polyline points="6,14 11,20 22,8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h2 className="status-title" ref={headingRef} tabIndex={-1}>Payment Successful</h2>
        <p className="status-amount">{currency === 'INR' ? '₹' : '$'}{amount}</p>
        {transactionId && (
          <p className="status-txid" aria-label={`Transaction ID: ${transactionId}`}>
            {transactionId.slice(0, 20)}…
          </p>
        )}
        <div className="status-confirmed-tag" aria-label="Payment confirmed">CONFIRMED</div>
      </section>
    )
  }

  if (status === 'failed') {
    return (
      <section className="status-screen status-failed-screen" aria-label="Payment failed">
        <div className="status-icon-box failed-icon" aria-hidden="true">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <line x1="8" y1="8" x2="20" y2="20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <line x1="20" y1="8" x2="8" y2="20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
        <h2 className="status-title" ref={headingRef} tabIndex={-1}>Payment Failed</h2>
        {failureReason && <p className="status-reason">{failureReason}</p>}
        {transactionId && (
          <p className="status-txid">{transactionId.slice(0, 20)}…</p>
        )}
        <div className="status-declined-tag">DECLINED</div>
      </section>
    )
  }

  if (status === 'timeout') {
    return (
      <section className="status-screen status-timeout-screen" aria-label="Payment timed out">
        <div className="status-icon-box timeout-icon" aria-hidden="true">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <circle cx="14" cy="14" r="9" stroke="currentColor" strokeWidth="1.5" />
            <line x1="14" y1="9" x2="14" y2="14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="14" y1="14" x2="18" y2="17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
        <h2 className="status-title" ref={headingRef} tabIndex={-1}>Request Timed Out</h2>
        <p className="status-reason">Cancelled after 6 seconds</p>
        {transactionId && (
          <p className="status-txid">{transactionId.slice(0, 20)}…</p>
        )}
        <div className="status-timeout-tag">TIMED OUT</div>
      </section>
    )
  }

  return null
}
