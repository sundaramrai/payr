import { PaymentStatus } from '@/types'

const PAYMENT_STATES: readonly PaymentStatus[] = [
  'idle',
  'processing',
  'success',
  'failed',
  'timeout',
]

function formatStateLabel(status: PaymentStatus): string {
  return status.charAt(0).toUpperCase() + status.slice(1)
}

export function PaymentStatusRail({ status }: { readonly status: PaymentStatus }) {
  return (
    <div className="states-section" aria-label={`Payment status: ${status}`}>
      {PAYMENT_STATES.map((state) => {
        const isActive = status === state
        const blockClassName = isActive
          ? `state-block state-block--active state-block--${state}`
          : 'state-block'
        const dotClassName = isActive
          ? `state-dot state-dot--${state} state-dot--lit`
          : `state-dot state-dot--${state}`

        return (
          <div
            key={state}
            className={blockClassName}
            aria-current={isActive ? 'true' : undefined}
          >
            <div className={dotClassName} />
            <div className="state-name">{formatStateLabel(state)}</div>
          </div>
        )
      })}
    </div>
  )
}
