'use client'

import { useEffect, useRef } from 'react'
import { Currency, PaymentStatus } from '@/types'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { parseCurrencySymbol } from '@/utils/currency'
import { cn } from '@/utils/cn'

interface Props {
  readonly status: PaymentStatus
  readonly failureReason: string | null
  readonly transactionId: string | null
  readonly amount: string
  readonly currency: Currency
}

interface SharedStatusProps {
  readonly headingRef: React.RefObject<HTMLHeadingElement | null>
  readonly displayTransactionId: string | null
}

function formatTransactionId(transactionId: string | null): string | null {
  if (!transactionId) {
    return null
  }

  return transactionId.length > 20 ? `${transactionId.slice(0, 20)}...` : transactionId
}

function isTerminalStatus(status: PaymentStatus): boolean {
  return status === 'success' || status === 'failed' || status === 'timeout'
}

function ProcessingState() {
  return (
    <div
      className="border-ink flex flex-col items-center gap-3 border-x-2 border-b-2 bg-cream px-6 py-10 text-center"
      role="status"
      aria-live="polite"
      aria-label="Processing payment"
    >
      <div className="size-14 rounded-full border-2 border-ink/10 border-t-ink animate-spin" aria-hidden="true" />
      <p className="text-xl font-extrabold tracking-[-0.02em]">Processing payment</p>
      <p className="max-w-sm font-mono text-[0.62rem] uppercase tracking-widest text-ink/55">
        Please do not close this window while we confirm the payment.
      </p>
    </div>
  )
}

function SuccessState({
  amount,
  currencySymbol,
  displayTransactionId,
  headingRef,
  transactionId,
}: SharedStatusProps & {
  readonly amount: string
  readonly currencySymbol: string
  readonly transactionId: string | null
}) {
  return (
    <section
      className="border-ink flex flex-col items-center gap-3 border-x-2 border-b-2 border-t-[3px] border-t-success bg-cream px-6 py-10 text-center"
      aria-label="Payment successful"
    >
      <div className="flex size-12 items-center justify-center rounded-sm border border-success text-success" aria-hidden="true">
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <polyline
            points="6,14 11,20 22,8"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <h2 className="text-xl font-extrabold tracking-[-0.02em] outline-none" ref={headingRef} tabIndex={-1}>
        Payment successful
      </h2>
      <p className="font-mono text-sm font-semibold text-ink/75">{`${currencySymbol}${amount || '0.00'}`}</p>
      {displayTransactionId && (
        <p className="font-mono text-[0.56rem] font-light tracking-widest text-ink/35" aria-label={`Transaction ID: ${transactionId}`}>
          {displayTransactionId}
        </p>
      )}
      <StatusBadge tone="success">Confirmed</StatusBadge>
    </section>
  )
}

function FailureStatusIcon({ isTimeout }: { readonly isTimeout: boolean }) {
  if (isTimeout) {
    return (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <circle cx="14" cy="14" r="9" stroke="currentColor" strokeWidth="1.5" />
        <line x1="14" y1="9" x2="14" y2="14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="14" y1="14" x2="18" y2="17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    )
  }

  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <line x1="8" y1="8" x2="20" y2="20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="20" y1="8" x2="8" y2="20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function FailureState({
  displayTransactionId,
  failureReason,
  headingRef,
  isTimeout,
}: SharedStatusProps & {
  readonly failureReason: string | null
  readonly isTimeout: boolean
}) {
  const panelClassName = isTimeout
    ? 'border-t-[3px] border-t-warn bg-cream'
    : 'border-t-[3px] border-t-danger bg-ink text-cream'
  const iconClassName = isTimeout ? 'border-warn text-warn' : 'border-[#ff5a4e] text-[#ff5a4e]'
  const headingClassName = cn(
    'text-xl font-extrabold tracking-[-0.02em] outline-none',
    !isTimeout && 'text-cream'
  )
  const reasonClassName = isTimeout ? 'text-ink/60' : 'text-cream/60'
  const transactionClassName = isTimeout ? 'text-ink/35' : 'text-cream/30'
  const ariaLabel = isTimeout ? 'Payment timed out' : 'Payment failed'
  const title = isTimeout ? 'Request timed out' : 'Payment failed'
  const message = failureReason ?? (isTimeout ? 'Cancelled after 6 seconds' : 'Payment declined')
  const badgeTone = isTimeout ? 'warning' : 'danger'
  const badgeLabel = isTimeout ? 'Timed out' : 'Declined'

  return (
    <section
      className={cn(
        'border-ink flex flex-col items-center gap-3 border-x-2 border-b-2 px-6 py-10 text-center',
        panelClassName
      )}
      aria-label={ariaLabel}
    >
      <div
        className={cn('flex size-12 items-center justify-center rounded-sm border', iconClassName)}
        aria-hidden="true"
      >
        <FailureStatusIcon isTimeout={isTimeout} />
      </div>
      <h2 className={headingClassName} ref={headingRef} tabIndex={-1}>
        {title}
      </h2>
      <p className={cn('font-mono text-[0.68rem] tracking-[0.04em]', reasonClassName)}>{message}</p>
      {displayTransactionId && (
        <p className={cn('font-mono text-[0.56rem] font-light tracking-widest', transactionClassName)}>
          {displayTransactionId}
        </p>
      )}
      <StatusBadge tone={badgeTone}>{badgeLabel}</StatusBadge>
    </section>
  )
}

export function StatusScreen({
  status,
  failureReason,
  transactionId,
  amount,
  currency,
}: Props) {
  const headingRef = useRef<HTMLHeadingElement>(null)
  const displayTransactionId = formatTransactionId(transactionId)
  const currencySymbol = parseCurrencySymbol(currency)

  useEffect(() => {
    if (isTerminalStatus(status)) {
      headingRef.current?.focus()
    }
  }, [status])

  if (status === 'processing') {
    return <ProcessingState />
  }

  if (status === 'success') {
    return (
      <SuccessState
        amount={amount}
        currencySymbol={currencySymbol}
        displayTransactionId={displayTransactionId}
        headingRef={headingRef}
        transactionId={transactionId}
      />
    )
  }

  if (status === 'failed' || status === 'timeout') {
    return (
      <FailureState
        displayTransactionId={displayTransactionId}
        failureReason={failureReason}
        headingRef={headingRef}
        isTimeout={status === 'timeout'}
      />
    )
  }

  return null
}
