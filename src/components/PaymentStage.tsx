import { CardInput } from '@/components/CardInput'
import { RetryBanner } from '@/components/RetryBanner'
import { StatusScreen } from '@/components/StatusScreen'
import {
  CardPreviewFields,
  Currency,
  PaymentFormValues,
  PaymentStatus,
} from '@/types'

interface Props {
  readonly status: PaymentStatus
  readonly amount: string
  readonly currency: Currency
  readonly transactionId: string | null
  readonly failureReason: string | null
  readonly canRetry: boolean
  readonly retriesExhausted: boolean
  readonly currentAttempt: number
  readonly maxRetries: number
  readonly isProcessing: boolean
  readonly onSubmit: (fields: PaymentFormValues) => void
  readonly onFieldChange: (fields: CardPreviewFields) => void
  readonly onRetry: () => void
  readonly onReset: () => void
}

export function PaymentStage({
  status,
  amount,
  currency,
  transactionId,
  failureReason,
  canRetry,
  retriesExhausted,
  currentAttempt,
  maxRetries,
  isProcessing,
  onSubmit,
  onFieldChange,
  onRetry,
  onReset,
}: Props) {
  if (status === 'idle') {
    return (
      <CardInput
        onSubmit={onSubmit}
        onFieldChange={onFieldChange}
        isProcessing={isProcessing}
      />
    )
  }

  if (status === 'processing') {
    return (
      <StatusScreen
        status={status}
        failureReason={null}
        transactionId={transactionId}
        amount={amount}
        currency={currency}
      />
    )
  }

  return (
    <div className="result-wrap">
      <StatusScreen
        status={status}
        failureReason={failureReason}
        transactionId={transactionId}
        amount={amount}
        currency={currency}
      />
      {(canRetry || retriesExhausted) && (
        <RetryBanner
          attempt={currentAttempt}
          maxRetries={maxRetries}
          failureReason={failureReason}
          retriesExhausted={retriesExhausted}
          onRetry={onRetry}
        />
      )}
      {(status === 'success' || retriesExhausted) && (
        <button className="new-payment-btn" type="button" onClick={onReset}>
          {status === 'success' ? 'Start a new payment' : 'Try a different card'}
        </button>
      )}
    </div>
  )
}
