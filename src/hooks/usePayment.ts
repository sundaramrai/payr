'use client'

import { useCallback, useRef } from 'react'
import { usePaymentStore } from '@/store/paymentStore'
import { Currency, PaymentPayload, Transaction } from '@/types'
import { parseRawAmount } from '@/utils/currency'

const MAX_RETRIES = 3
const TIMEOUT_MS = 6_000

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

  const submitPayment = useCallback(
    async (fields: {
      name: string
      number: string
      expiry: string
      amount: string
      currency: Currency
    }) => {
      // Generate a new transaction ID only on the first attempt
      const txId =
        currentAttempt === 1
          ? crypto.randomUUID()
          : (currentTxId ?? crypto.randomUUID())

      if (currentAttempt === 1) setCurrentTxId(txId)

      abortRef.current = new AbortController()
      const timeoutId = setTimeout(() => abortRef.current?.abort(), TIMEOUT_MS)

      setStatus('processing')
      setFailureReason(null)

      const payload: PaymentPayload = {
        transactionId: txId,
        cardName: fields.name,
        cardNumber: fields.number,
        expiry: fields.expiry,
        amount: parseRawAmount(fields.amount),
        currency: fields.currency,
        attempt: currentAttempt,
      }

      try {
        const res = await fetch('/api/pay', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          signal: abortRef.current.signal,
        })

        clearTimeout(timeoutId)

        const data = await res.json()

        const tx: Transaction = {
          id: txId,
          amount: payload.amount,
          currency: payload.currency,
          status: data.status === 'success' ? 'success' : 'failed',
          reason: data.reason,
          timestamp: new Date().toISOString(),
          attempts: currentAttempt,
        }

        addOrUpdateTransaction(tx)

        if (data.status === 'success') {
          setStatus('success')
          resetAttempt()
        } else {
          setStatus('failed')
          setFailureReason(data.reason ?? 'Payment declined')
          incrementAttempt()
        }
      } catch (err: unknown) {
        clearTimeout(timeoutId)

        const isAbort =
          err instanceof DOMException && err.name === 'AbortError'

        const tx: Transaction = {
          id: txId,
          amount: parseRawAmount(fields.amount),
          currency: fields.currency,
          status: 'timeout',
          reason: 'Request timed out after 6 seconds',
          timestamp: new Date().toISOString(),
          attempts: currentAttempt,
        }

        addOrUpdateTransaction(tx)

        if (isAbort) {
          setStatus('timeout')
          setFailureReason('Request timed out after 6 seconds')
        } else {
          setStatus('failed')
          setFailureReason('Network error — check your connection')
        }

        incrementAttempt()
      }
    },
    [
      currentAttempt,
      currentTxId,
      setCurrentTxId,
      setStatus,
      setFailureReason,
      incrementAttempt,
      resetAttempt,
      addOrUpdateTransaction,
    ]
  )

  const canRetry = (status === 'failed' || status === 'timeout') && currentAttempt <= MAX_RETRIES
  const retriesExhausted = (status === 'failed' || status === 'timeout') && currentAttempt > MAX_RETRIES

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
