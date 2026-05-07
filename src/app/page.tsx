'use client'

import { useEffect, useState, useCallback, type ReactNode } from 'react'
import { usePaymentStore } from '@/store/paymentStore'
import { usePayment } from '@/hooks/usePayment'
import { useCardDetect } from '@/hooks/useCardDetect'
import { LiveCardPreview } from '@/components/LiveCardPreview'
import { CardInput } from '@/components/CardInput'
import { StatusScreen } from '@/components/StatusScreen'
import { RetryBanner } from '@/components/RetryBanner'
import { TransactionHistory } from '@/components/TransactionHistory'
import { Currency } from '@/types'

export default function HomePage() {
  const { transactions, loadHistory, currentTxId } = usePaymentStore()
  const {
    status,
    currentAttempt,
    failureReason,
    canRetry,
    retriesExhausted,
    maxRetries,
    submitPayment,
    resetPayment,
  } = usePayment()

  const [cardFields, setCardFields] = useState({ name: '', number: '', expiry: '' })
  const [lastAmount, setLastAmount] = useState('')
  const [lastCurrency, setLastCurrency] = useState<Currency>('INR')
  const [pendingRetry, setPendingRetry] = useState<{
    name: string; number: string; expiry: string; amount: string; currency: Currency
  } | null>(null)

  const { cardType } = useCardDetect(cardFields.number)

  useEffect(() => { loadHistory() }, [loadHistory])

  const handleSubmit = useCallback(
    (fields: { name: string; number: string; expiry: string; amount: string; currency: Currency }) => {
      setLastAmount(fields.amount)
      setLastCurrency(fields.currency)
      setPendingRetry(fields)
      submitPayment(fields)
    },
    [submitPayment]
  )

  const handleRetry = useCallback(() => {
    if (pendingRetry) submitPayment(pendingRetry)
  }, [pendingRetry, submitPayment])

  const handleNewPayment = () => {
    resetPayment()
    setPendingRetry(null)
  }

  const isProcessing = status === 'processing'
  const showResult = status === 'success' || status === 'failed' || status === 'timeout'
  const showRetry = (canRetry || retriesExhausted) && showResult

  const paymentStates = ['idle', 'processing', 'success', 'failed', 'timeout'] as const

  const stateBlocks = paymentStates.map((state) => {
    const isActive = status === state
    const blockClassName = isActive
      ? `state-block state-block--active state-block--${state}`
      : 'state-block'
    const dotClassName = isActive
      ? `state-dot state-dot--${state} state-dot--lit`
      : `state-dot state-dot--${state}`

    return {
      state,
      blockClassName,
      dotClassName,
      ariaCurrent: isActive ? ('true' as const) : undefined,
      label: state.charAt(0).toUpperCase() + state.slice(1),
    }
  })

  let paymentContent: ReactNode

  if (isProcessing) {
    paymentContent = (
      <StatusScreen
        status="processing"
        failureReason={null}
        transactionId={currentTxId}
        amount={lastAmount}
        currency={lastCurrency}
      />
    )
  } else if (showResult && !canRetry && !retriesExhausted && status === 'success') {
    paymentContent = (
      <div className="result-wrap">
        <StatusScreen
          status={status}
          failureReason={failureReason}
          transactionId={currentTxId}
          amount={lastAmount}
          currency={lastCurrency}
        />
        <button className="new-payment-btn" onClick={handleNewPayment}>
          ← Make another payment
        </button>
      </div>
    )
  } else if (showResult) {
    paymentContent = (
      <div className="result-wrap">
        <StatusScreen
          status={status}
          failureReason={failureReason}
          transactionId={currentTxId}
          amount={lastAmount}
          currency={lastCurrency}
        />
        {showRetry && (
          <RetryBanner
            attempt={currentAttempt}
            maxRetries={maxRetries}
            failureReason={failureReason}
            retriesExhausted={retriesExhausted}
            onRetry={handleRetry}
          />
        )}
        {retriesExhausted && (
          <button className="new-payment-btn" onClick={handleNewPayment}>
            ← Try a different card
          </button>
        )}
      </div>
    )
  } else {
    paymentContent = (
      <CardInput
        onSubmit={handleSubmit}
        onFieldChange={setCardFields}
        isProcessing={isProcessing}
      />
    )
  }

  return (
    <main className="pg-root">
      <div className="pg-wrap">

        {/* ── MASTHEAD ── */}
        <header className="masthead">
          <div className="brand-mark">
            <span className="brand-tag">Secure checkout · v1.0</span>
            <span className="brand-name">
              Pay<span className="r-accent">R</span>
            </span>
          </div>
          <div className="masthead-right">
            <div className="status-live" aria-label="Gateway status: online">Gateway online</div>
            <div className="ssl-note">256-BIT SSL ENCRYPTED</div>
          </div>
        </header>

        {/* ── CARD PREVIEW ── */}
        <section className="card-preview-section" aria-label="Card preview">
          <div className="preview-hint">Card preview · hover to flip</div>
          <LiveCardPreview
            name={cardFields.name}
            number={cardFields.number}
            expiry={cardFields.expiry}
            cardType={cardType}
          />
        </section>

        {/* ── LIFECYCLE STATES BAR ── */}
        <output className="states-section" aria-label={`Payment status: ${status}`}>
          {stateBlocks.map((stateBlock) => (
            <div
              key={stateBlock.state}
              className={stateBlock.blockClassName}
              aria-current={stateBlock.ariaCurrent}
            >
              <div className={stateBlock.dotClassName} />
              <div className="state-name">{stateBlock.label}</div>
            </div>
          ))}
        </output>

        {/* ── PROCESSING / RESULT / FORM ── */}
        {paymentContent}

        {/* ── TRANSACTION HISTORY ── */}
        <TransactionHistory transactions={transactions} />

      </div>
    </main>
  )
}
