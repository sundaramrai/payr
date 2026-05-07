'use client'

interface Props {
  readonly attempt: number
  readonly maxRetries: number
  readonly failureReason: string | null
  readonly retriesExhausted: boolean
  readonly onRetry: () => void
}

export function RetryBanner({
  attempt,
  maxRetries,
  failureReason,
  retriesExhausted,
  onRetry,
}: Props) {
  if (retriesExhausted) {
    return (
      <div className="retry-banner retry-banner--exhausted" role="alert" aria-live="assertive">
        <div className="retry-left">
          <div className="retry-title">No more retries</div>
          <div className="retry-sub">
            {failureReason ?? 'Payment could not be completed'} / Please try a different card
          </div>
        </div>
        <div className="retry-right">
          <div className="attempt-of">Attempts used</div>
          <div className="attempt-count attempt-count--danger">{maxRetries}</div>
          <div className="attempt-of">of {maxRetries}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="retry-banner" role="alert" aria-live="polite">
      <div className="retry-left">
        <div className="retry-title">Retry payment?</div>
        <div className="retry-sub">
          {failureReason ?? 'Payment failed'} / Same transaction ID will be reused
        </div>
        <button
          className="retry-btn"
          type="button"
          onClick={onRetry}
          aria-label={`Retry payment, attempt ${attempt} of ${maxRetries}`}
        >
          Retry now
        </button>
      </div>
      <div className="retry-right" aria-label={`Attempt ${attempt} of ${maxRetries}`}>
        <div className="attempt-of">Attempt</div>
        <div className="attempt-count">{attempt}</div>
        <div className="attempt-of">of {maxRetries}</div>
      </div>
    </div>
  )
}
