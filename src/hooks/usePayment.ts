'use client'

import { useEffect, useRef } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { usePaymentStore } from '@/store/paymentStore'
import { GatewayResponse, PaymentFormValues, Transaction } from '@/types'
import { parseRawAmount } from '@/utils/currency'

const MAX_RETRIES = 3
const CLIENT_TIMEOUT_MS = 6_000
const CLIENT_TIMEOUT_MESSAGE = 'Request timed out after 6 seconds'
const NETWORK_ERROR_MESSAGE = 'Network error - check your connection'

function buildTransaction(
  txId: string,
  amount: number,
  currency: PaymentFormValues['currency'],
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

function isGatewayResponse(value: unknown): value is GatewayResponse {
  if (!value || typeof value !== 'object') {
    return false
  }

  const candidate = value as Partial<GatewayResponse>
  return (
    typeof candidate.transactionId === 'string' &&
    (candidate.status === 'success' || candidate.status === 'failed') &&
    (candidate.reason === undefined || typeof candidate.reason === 'string')
  )
}

async function parseGatewayResponse(response: Response) {
  try {
    const data = (await response.json()) as unknown
    return isGatewayResponse(data) ? data : null
  } catch {
    return null
  }
}

function getFailureStatus(response: Response): 'failed' | 'timeout' {
  return response.status === 504 ? 'timeout' : 'failed'
}

function getFailureMessage(response: Response, reason?: string): string {
  if (reason) {
    return reason
  }

  if (response.status === 504) {
    return 'Gateway timeout'
  }

  if (response.status >= 500) {
    return 'Payment gateway unavailable'
  }

  return 'Payment declined'
}

export function usePayment() {
  const {
    status,
    currentTxId,
    attemptCount,
    failureReason,
    setStatus,
    setCurrentTxId,
    setAttemptCount,
    setFailureReason,
    addOrUpdateTransaction,
    resetPayment,
  } = usePaymentStore(
    useShallow((state) => ({
      status: state.status,
      currentTxId: state.currentTxId,
      attemptCount: state.attemptCount,
      failureReason: state.failureReason,
      setStatus: state.setStatus,
      setCurrentTxId: state.setCurrentTxId,
      setAttemptCount: state.setAttemptCount,
      setFailureReason: state.setFailureReason,
      addOrUpdateTransaction: state.addOrUpdateTransaction,
      resetPayment: state.resetPayment,
    }))
  )

  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    return () => abortRef.current?.abort()
  }, [])

  async function submitPayment(fields: PaymentFormValues) {
    abortRef.current?.abort()

    const attempt = attemptCount + 1
    const txId = currentTxId ?? crypto.randomUUID()

    if (!currentTxId) {
      setCurrentTxId(txId)
    }

    const abortController = new AbortController()
    abortRef.current = abortController

    let didTimeout = false
    const timeoutId = setTimeout(() => {
      didTimeout = true
      abortController.abort()
    }, CLIENT_TIMEOUT_MS)

    const rawAmount = parseRawAmount(fields.amount)

    setStatus('processing')
    setFailureReason(null)

    try {
      const response = await fetch('/api/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactionId: txId,
          cardName: fields.name,
          cardNumber: fields.number,
          expiry: fields.expiry,
          amount: rawAmount,
          currency: fields.currency,
          attempt,
        }),
        signal: abortController.signal,
      })

      const data = await parseGatewayResponse(response)
      clearTimeout(timeoutId)

      if (response.ok && data?.status === 'success') {
        addOrUpdateTransaction(
          buildTransaction(txId, rawAmount, fields.currency, attempt, 'success')
        )
        setAttemptCount(attempt)
        setStatus('success')
        return
      }

      const nextStatus = getFailureStatus(response)
      const message = getFailureMessage(response, data?.reason)

      addOrUpdateTransaction(
        buildTransaction(txId, rawAmount, fields.currency, attempt, nextStatus, message)
      )
      setAttemptCount(attempt)
      setStatus(nextStatus)
      setFailureReason(message)
    } catch {
      clearTimeout(timeoutId)

      if (abortController.signal.aborted && !didTimeout) {
        return
      }

      const nextStatus = didTimeout ? 'timeout' : 'failed'
      const message = didTimeout ? CLIENT_TIMEOUT_MESSAGE : NETWORK_ERROR_MESSAGE

      addOrUpdateTransaction(
        buildTransaction(txId, rawAmount, fields.currency, attempt, nextStatus, message)
      )
      setAttemptCount(attempt)
      setStatus(nextStatus)
      setFailureReason(message)
    } finally {
      clearTimeout(timeoutId)
      if (abortRef.current === abortController) {
        abortRef.current = null
      }
    }
  }

  const canRetry =
    (status === 'failed' || status === 'timeout') && attemptCount < MAX_RETRIES
  const retriesExhausted =
    (status === 'failed' || status === 'timeout') && attemptCount >= MAX_RETRIES

  return {
    status,
    attemptCount,
    nextAttempt: Math.min(attemptCount + 1, MAX_RETRIES),
    failureReason,
    canRetry,
    retriesExhausted,
    maxRetries: MAX_RETRIES,
    submitPayment,
    resetPayment,
  }
}
