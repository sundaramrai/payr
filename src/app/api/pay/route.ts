import type { GatewayResponse, PaymentPayload } from '@/types'
import { NextRequest, NextResponse } from 'next/server'
import {
  validateAmount,
  validateCardNumber,
  validateExpiry,
  validateName,
} from '@/utils/validators'

const SUCCESS_DELAY_MS = 2_000
const FAILURE_DELAY_MS = 2_000
const TIMEOUT_DELAY_MS = 8_000
const FAILURE_REASONS = [
  'Insufficient funds',
  'Card declined by issuer',
  'Invalid card details',
  'Transaction limit exceeded',
  'Suspected fraud - contact your bank',
] as const

function pickFailureReason(): string {
  return FAILURE_REASONS[Math.floor(Math.random() * FAILURE_REASONS.length)]
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function validatePaymentPayload(payload: Partial<PaymentPayload>): string | null {
  if (!payload.transactionId?.trim()) return 'Transaction ID is required'

  const nameError = validateName(payload.cardName ?? '')
  if (nameError) return nameError

  const cardNumberError = validateCardNumber(payload.cardNumber ?? '')
  if (cardNumberError) return cardNumberError

  const expiryError = validateExpiry(payload.expiry ?? '')
  if (expiryError) return expiryError

  if (typeof payload.amount !== 'number' || Number.isNaN(payload.amount)) {
    return 'Amount must be numeric'
  }

  const amountError = validateAmount(String(payload.amount))
  if (amountError) return amountError

  if (payload.currency !== 'INR' && payload.currency !== 'USD') {
    return 'Unsupported currency'
  }

  if (!Number.isInteger(payload.attempt) || (payload.attempt ?? 0) < 1) {
    return 'Attempt must be a positive integer'
  }

  return null
}

export async function POST(req: NextRequest): Promise<NextResponse<GatewayResponse>> {
  const body = (await req.json()) as Partial<PaymentPayload>
  const validationError = validatePaymentPayload(body)
  const transactionId = body.transactionId ?? 'unknown'

  if (validationError) {
    return NextResponse.json(
      { transactionId, status: 'failed', reason: validationError },
      { status: 400 }
    )
  }

  const roll = Math.random()

  if (roll > 0.85) {
    await wait(TIMEOUT_DELAY_MS)
    return NextResponse.json(
      { transactionId, status: 'failed', reason: 'Gateway timeout' },
      { status: 504 }
    )
  }

  if (roll > 0.6) {
    await wait(FAILURE_DELAY_MS)
    return NextResponse.json(
      { transactionId, status: 'failed', reason: pickFailureReason() },
      { status: 402 }
    )
  }

  await wait(SUCCESS_DELAY_MS)
  return NextResponse.json({ transactionId, status: 'success' }, { status: 200 })
}
