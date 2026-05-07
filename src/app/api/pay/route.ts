const FAILURE_REASONS = [
  'Insufficient funds',
  'Card declined by issuer',
  'Invalid card details',
  'Transaction limit exceeded',
  'Suspected fraud — contact your bank',
]

function pickFailureReason(): string {
  return FAILURE_REASONS[Math.floor(Math.random() * FAILURE_REASONS.length)]
}

export async function POST(req: Request): Promise<Response> {
  const body = await req.json()
  const transactionId: string = body.transactionId ?? 'unknown'

  const roll = Math.random()

  // ~15 % — simulate a gateway timeout (responds after 8 s)
  if (roll > 0.85) {
    await new Promise((resolve) => setTimeout(resolve, 8_000))
    return Response.json(
      { transactionId, status: 'failed', reason: 'Gateway timeout' },
      { status: 504 }
    )
  }

  // ~25 % — declined
  if (roll > 0.6) {
    await new Promise((resolve) => setTimeout(resolve, 800))
    return Response.json(
      { transactionId, status: 'failed', reason: pickFailureReason() },
      { status: 402 }
    )
  }

  // ~60 % — success
  await new Promise((resolve) => setTimeout(resolve, 1_200))
  return Response.json(
    { transactionId, status: 'success' },
    { status: 200 }
  )
}
