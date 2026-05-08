'use client'

import { useEffect, useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { LiveCardPreview } from '@/components/LiveCardPreview'
import { PaymentStage } from '@/components/PaymentStage'
import { PaymentStatusRail } from '@/components/PaymentStatusRail'
import { TransactionHistory } from '@/components/TransactionHistory'
import { usePayment } from '@/hooks/usePayment'
import { usePaymentStore } from '@/store/paymentStore'
import { cardTypeLabel, detectCardType } from '@/utils/cardFormatter'
import { CardPreviewFields, PaymentFormValues } from '@/types'

const INITIAL_PREVIEW_FIELDS: CardPreviewFields = {
  name: '',
  number: '',
  expiry: '',
}

export default function HomePage() {
  const { transactions, loadHistory, currentTxId } = usePaymentStore(
    useShallow((state) => ({
      transactions: state.transactions,
      loadHistory: state.loadHistory,
      currentTxId: state.currentTxId,
    }))
  )

  const {
    status,
    attemptCount,
    nextAttempt,
    failureReason,
    canRetry,
    retriesExhausted,
    maxRetries,
    submitPayment,
    resetPayment,
  } = usePayment()

  const [cardFields, setCardFields] = useState<CardPreviewFields>(INITIAL_PREVIEW_FIELDS)
  const [submittedPayment, setSubmittedPayment] = useState<PaymentFormValues | null>(null)

  useEffect(() => {
    loadHistory()
  }, [loadHistory])

  function handleSubmit(fields: PaymentFormValues) {
    setSubmittedPayment(fields)
    submitPayment(fields)
  }

  function handleRetry() {
    if (submittedPayment) {
      submitPayment(submittedPayment)
    }
  }

  function handleReset() {
    resetPayment()
    setSubmittedPayment(null)
    setCardFields(INITIAL_PREVIEW_FIELDS)
  }

  const cardType = detectCardType(cardFields.number)
  const previewCardTypeLabel = cardTypeLabel(cardType)
  const submittedAmount = submittedPayment?.amount ?? ''
  const submittedCurrency = submittedPayment?.currency ?? 'INR'

  return (
    <main className="page-grid relative min-h-screen">
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-3xl flex-col px-4 pb-14 pt-8 sm:px-6">
        <header className="border-ink flex items-start justify-between border-b-2 pb-4">
          <h1 className="text-3xl font-extrabold tracking-[-0.04em] sm:text-4xl">
            Pay<span className="text-amber underline decoration-2 underline-offset-2">R</span>
          </h1>

          <div className="inline-flex items-center gap-2 rounded-sm border border-success px-3 py-1 font-mono text-[0.56rem] font-light uppercase tracking-[0.12em] text-success">
            <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
            Gateway ready
          </div>
        </header>

        <section
          className="border-ink border-x-2 border-b-2 px-4 py-4 sm:px-5"
          aria-label="Card preview"
        >
          <div className="mb-3 flex items-center justify-between gap-3">
            <span className="font-mono text-[0.5rem] uppercase tracking-[0.18em] text-ink/35">
              Live preview / click or focus to flip
            </span>
            {previewCardTypeLabel && (
              <span className="font-mono text-[0.5rem] font-semibold uppercase tracking-[0.12em] text-amber">
                {previewCardTypeLabel}
              </span>
            )}
          </div>
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
          amount={submittedAmount}
          currency={submittedCurrency}
          transactionId={currentTxId}
          failureReason={failureReason}
          canRetry={canRetry}
          retriesExhausted={retriesExhausted}
          attemptCount={attemptCount}
          nextAttempt={nextAttempt}
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
