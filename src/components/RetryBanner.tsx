'use client'

import { StatusBadge } from '@/components/ui/StatusBadge'

interface Props {
  readonly attemptCount: number
  readonly nextAttempt: number
  readonly maxRetries: number
  readonly failureReason: string | null
  readonly retriesExhausted: boolean
  readonly onRetry: () => void
}

export function RetryBanner({
  attemptCount,
  nextAttempt,
  maxRetries,
  failureReason,
  retriesExhausted,
  onRetry,
}: Props) {
  if (retriesExhausted) {
    return (
      <div className="border-ink flex items-stretch border-x-2 border-b-2 bg-cream/85" role="alert" aria-live="assertive">
        <div className="border-ink flex-1 border-r-2 px-4 py-4">
          <div className="mb-1 text-sm font-bold">No more retries</div>
          <div className="font-mono text-[0.52rem] uppercase tracking-widest text-ink/50">
            {failureReason ?? 'Payment could not be completed'} / Please try a different card
          </div>
        </div>
        <div className="flex min-w-24 flex-col items-center justify-center gap-1 px-5 py-4">
          <div className="font-mono text-[0.5rem] uppercase tracking-widest text-ink/35">Attempts used</div>
          <div className="font-mono text-3xl font-semibold leading-none text-danger">{attemptCount}</div>
          <div className="font-mono text-[0.5rem] uppercase tracking-widest text-ink/35">of {maxRetries}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="border-ink flex items-stretch border-x-2 border-b-2 bg-cream" role="alert" aria-live="polite">
      <div className="border-ink flex-1 border-r-2 px-4 py-4">
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <div className="text-sm font-bold">Retry payment?</div>
          <StatusBadge tone="warning" className="text-[0.46rem]">
            Attempt {attemptCount} failed
          </StatusBadge>
        </div>
        <div className="font-mono text-[0.52rem] uppercase tracking-widest text-ink/50">
          {failureReason ?? 'Payment failed'} / Same transaction ID will be reused
        </div>
        <button
          className="mt-3 inline-flex items-center rounded-sm bg-amber px-3.5 py-2 text-[0.72rem] font-bold uppercase tracking-[0.06em] text-ink transition hover:bg-amber-dim"
          type="button"
          onClick={onRetry}
          aria-label={`Retry payment, attempt ${nextAttempt} of ${maxRetries}`}
        >
          Retry attempt {nextAttempt}
        </button>
      </div>
      <div className="flex min-w-24 flex-col items-center justify-center gap-1 px-5 py-4" aria-label={`Attempt ${attemptCount} of ${maxRetries}`}>
        <div className="font-mono text-[0.5rem] uppercase tracking-widest text-ink/35">Used</div>
        <div className="font-mono text-3xl font-semibold leading-none text-amber">{attemptCount}</div>
        <div className="font-mono text-[0.5rem] uppercase tracking-widest text-ink/35">of {maxRetries}</div>
      </div>
    </div>
  )
}
