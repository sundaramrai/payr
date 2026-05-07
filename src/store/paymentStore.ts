import { create } from 'zustand'
import { PaymentStatus, Transaction } from '@/types'
import { loadTransactions, saveTransactions, upsertTransaction } from '@/utils/storage'

interface PaymentState {
  status: PaymentStatus
  currentTxId: string | null
  currentAttempt: number
  failureReason: string | null
  transactions: Transaction[]

  setStatus: (status: PaymentStatus) => void
  setCurrentTxId: (id: string) => void
  incrementAttempt: () => void
  resetAttempt: () => void
  setFailureReason: (reason: string | null) => void
  addOrUpdateTransaction: (tx: Transaction) => void
  loadHistory: () => void
  resetPayment: () => void
}

export const usePaymentStore = create<PaymentState>((set, get) => ({
  status: 'idle',
  currentTxId: null,
  currentAttempt: 1,
  failureReason: null,
  transactions: [],

  setStatus: (status) => set({ status }),

  setCurrentTxId: (id) => set({ currentTxId: id }),

  incrementAttempt: () =>
    set((s) => ({ currentAttempt: s.currentAttempt + 1 })),

  resetAttempt: () => set({ currentAttempt: 1 }),

  setFailureReason: (reason) => set({ failureReason: reason }),

  addOrUpdateTransaction: (tx) => {
    const updated = upsertTransaction(get().transactions, tx)
    saveTransactions(updated)
    set({ transactions: updated })
  },

  loadHistory: () => {
    set({ transactions: loadTransactions() })
  },

  resetPayment: () =>
    set({
      status: 'idle',
      currentTxId: null,
      currentAttempt: 1,
      failureReason: null,
    }),
}))
