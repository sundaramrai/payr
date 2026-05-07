'use client'

import { useEffect, useState } from 'react'
import { LiveCardPreview } from '@/components/LiveCardPreview'
import { PaymentStage } from '@/components/PaymentStage'
import { PaymentStatusRail } from '@/components/PaymentStatusRail'
import { TransactionHistory } from '@/components/TransactionHistory'
import { useCardDetect } from '@/hooks/useCardDetect'
import { usePayment } from '@/hooks/usePayment'
import { usePaymentStore } from '@/store/paymentStore'
import { CardPreviewFields, Currency, PaymentFormValues } from '@/types'

const INITIAL_PREVIEW_FIELDS: CardPreviewFields = {
  name: '',
  number: '',
  expiry: '',
}

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

  const [cardFields, setCardFields] = useState<CardPreviewFields>(INITIAL_PREVIEW_FIELDS)
  const [lastPayment, setLastPayment] = useState({
    amount: '',
    currency: 'INR' as Currency,
  })
  const [pendingRetry, setPendingRetry] = useState<PaymentFormValues | null>(null)

  const { cardType } = useCardDetect(cardFields.number)

  useEffect(() => {
    loadHistory()
  }, [loadHistory])

  function handleSubmit(fields: PaymentFormValues) {
    setLastPayment({ amount: fields.amount, currency: fields.currency })
    setPendingRetry(fields)
    submitPayment(fields)
  }

  function handleRetry() {
    if (pendingRetry) {
      submitPayment(pendingRetry)
    }
  }

  function handleReset() {
    resetPayment()
    setPendingRetry(null)
    setCardFields(INITIAL_PREVIEW_FIELDS)
    setLastPayment({ amount: '', currency: 'INR' })
  }

  return (
    <main className="pg-root">
      <div className="pg-wrap">
        <header className="masthead">
          <div className="brand-mark">
            <span className="brand-name">
              Pay<span className="r-accent">R</span>
            </span>
          </div>
          <div className="masthead-right">
            <div className="status-live" aria-label="Gateway status: online">
              Gateway online
            </div>
            <div className="ssl-note">256-BIT SSL ENCRYPTED</div>
          </div>
        </header>

        <section className="card-preview-section" aria-label="Card preview">
          <div className="preview-hint">Live preview / hover or focus to flip</div>
          <LiveCardPreview
            name={cardFields.name}
            number={cardFields.number}
            expiry={cardFields.expiry}
            cardType={cardType}
          />
        </section>

        <PaymentStatusRail status={status} />

        <PaymentStage
          status={status}
          amount={lastPayment.amount}
          currency={lastPayment.currency}
          transactionId={currentTxId}
          failureReason={failureReason}
          canRetry={canRetry}
          retriesExhausted={retriesExhausted}
          currentAttempt={currentAttempt}
          maxRetries={maxRetries}
          isProcessing={status === 'processing'}
          onSubmit={handleSubmit}
          onFieldChange={setCardFields}
          onRetry={handleRetry}
          onReset={handleReset}
        />

        <TransactionHistory transactions={transactions} />
      </div>
    </main>
  )
}
