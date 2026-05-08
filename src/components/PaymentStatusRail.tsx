import { PaymentStatus } from '@/types'
import { cn } from '@/utils/cn'

const PAYMENT_STATES: readonly PaymentStatus[] = [
  'idle',
  'processing',
  'success',
  'failed',
  'timeout',
]

const blockTone = {
  idle: 'bg-ink/5 text-ink/55',
  processing: 'bg-processing/10 text-processing',
  success: 'bg-success/10 text-success',
  failed: 'bg-danger/10 text-danger',
  timeout: 'bg-warn/10 text-warn',
} as const

function getPaymentStateLabel(status: PaymentStatus): string {
  return status.charAt(0).toUpperCase() + status.slice(1)
}

export function PaymentStatusRail({ status }: { readonly status: PaymentStatus }) {
  return (
    <div
      className="border-ink flex border-x-2 border-b-2"
      aria-label={`Payment status: ${getPaymentStateLabel(status)}`}
    >
      {PAYMENT_STATES.map((state) => {
        const isActive = status === state

        return (
          <div
            key={state}
            className={cn(
              'border-ink flex-1 border-r-2 px-2 py-2 text-center last:border-r-0',
              isActive ? blockTone[state] : 'bg-transparent text-ink/45'
            )}
            aria-current={isActive ? 'true' : undefined}
          >
            <div
              className={cn(
                'mx-auto mb-1.5 size-2 rounded-full',
                isActive ? 'bg-current animate-pulse' : 'bg-ink/20'
              )}
            />
            <div className="font-mono text-[0.42rem] uppercase tracking-[0.08em] sm:text-[0.46rem]">
              {getPaymentStateLabel(state)}
            </div>
          </div>
        )
      })}
    </div>
  )
}
