import type { PaymentPayload } from '@/types'

const FAILURE_REASONS = [
  'Insufficient funds',
  'Card declined by issuer',
  'Invalid card details',
  'Transaction limit exceeded',
  'Suspected fraud - contact your bank',
]

const SUCCESS_DELAY_MS = 2_000
const FAILURE_DELAY_MS = 2_000
const TIMEOUT_DELAY_MS = 8_000

function pickFailureReason(): string {
  return FAILURE_REASONS[Math.floor(Math.random() * FAILURE_REASONS.length)]
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function POST(req: Request): Promise<Response> {
  const body = (await req.json()) as Partial<PaymentPayload>
  const transactionId = body.transactionId ?? 'unknown'
  const roll = Math.random()

  if (roll > 0.85) {
    await wait(TIMEOUT_DELAY_MS)
    return Response.json(
      { transactionId, status: 'failed', reason: 'Gateway timeout' },
      { status: 504 }
    )
  }

  if (roll > 0.6) {
    await wait(FAILURE_DELAY_MS)
    return Response.json(
      { transactionId, status: 'failed', reason: pickFailureReason() },
      { status: 402 }
    )
  }

  await wait(SUCCESS_DELAY_MS)

  return Response.json(
    { transactionId, status: 'success' },
    { status: 200 }
  )
}
