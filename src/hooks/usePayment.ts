'use client'

import { useRef } from 'react'
import { usePaymentStore } from '@/store/paymentStore'
import { Currency, PaymentFormValues, PaymentPayload, Transaction } from '@/types'
import { parseRawAmount } from '@/utils/currency'

const MAX_RETRIES = 3
const TIMEOUT_MS = 6_000
const TIMEOUT_MESSAGE = 'Request timed out after 6 seconds'
const NETWORK_MESSAGE = 'Network error - check your connection'

function buildTransaction(
  txId: string,
  amount: number,
  currency: Currency,
  attempts: number,
  status: Transaction['status'],
  reason?: string
): Transaction {
  return {
    id: txId,
    amount,
    currency,
    status,
    reason,
    timestamp: new Date().toISOString(),
    attempts,
  }
}

export function usePayment() {
  const {
    status,
    currentTxId,
    currentAttempt,
    failureReason,
    setStatus,
    setCurrentTxId,
    setFailureReason,
    incrementAttempt,
    resetAttempt,
    addOrUpdateTransaction,
    resetPayment,
  } = usePaymentStore()

  const abortRef = useRef<AbortController | null>(null)

  async function submitPayment(fields: PaymentFormValues) {
    abortRef.current?.abort()

    const txId =
      currentAttempt === 1
        ? crypto.randomUUID()
        : (currentTxId ?? crypto.randomUUID())

    if (currentAttempt === 1 || currentTxId === null) {
      setCurrentTxId(txId)
    }

    const abortController = new AbortController()
    abortRef.current = abortController

    const timeoutId = setTimeout(() => abortController.abort(), TIMEOUT_MS)
    const rawAmount = parseRawAmount(fields.amount)

    setStatus('processing')
    setFailureReason(null)

    const payload: PaymentPayload = {
      transactionId: txId,
      cardName: fields.name,
      cardNumber: fields.number,
      expiry: fields.expiry,
      amount: rawAmount,
      currency: fields.currency,
      attempt: currentAttempt,
    }

    try {
      const response = await fetch('/api/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: abortController.signal,
      })

      clearTimeout(timeoutId)

      const data = await response.json()
      const isSuccess = data.status === 'success'
      const transaction = buildTransaction(
        txId,
        rawAmount,
        fields.currency,
        currentAttempt,
        isSuccess ? 'success' : 'failed',
        data.reason
      )

      addOrUpdateTransaction(transaction)

      if (isSuccess) {
        setStatus('success')
        resetAttempt()
        return
      }

      setStatus('failed')
      setFailureReason(data.reason ?? 'Payment declined')
      incrementAttempt()
    } catch (error: unknown) {
      clearTimeout(timeoutId)

      const isTimeout =
        error instanceof DOMException && error.name === 'AbortError'

      const message = isTimeout ? TIMEOUT_MESSAGE : NETWORK_MESSAGE
      const transaction = buildTransaction(
        txId,
        rawAmount,
        fields.currency,
        currentAttempt,
        isTimeout ? 'timeout' : 'failed',
        message
      )

      addOrUpdateTransaction(transaction)
      setStatus(isTimeout ? 'timeout' : 'failed')
      setFailureReason(message)
      incrementAttempt()
    } finally {
      if (abortRef.current === abortController) {
        abortRef.current = null
      }
    }
  }

  const canRetry =
    (status === 'failed' || status === 'timeout') && currentAttempt <= MAX_RETRIES
  const retriesExhausted =
    (status === 'failed' || status === 'timeout') && currentAttempt > MAX_RETRIES

  return {
    status,
    currentAttempt,
    failureReason,
    canRetry,
    retriesExhausted,
    maxRetries: MAX_RETRIES,
    submitPayment,
    resetPayment,
  }
}
