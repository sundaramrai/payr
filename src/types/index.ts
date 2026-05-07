export type PaymentStatus = 'idle' | 'processing' | 'success' | 'failed' | 'timeout'

export type CardType = 'visa' | 'mastercard' | 'amex' | 'unknown'

export type Currency = 'INR' | 'USD'

export interface CardFields {
  name: string
  number: string
  expiry: string
  cvv: string
}

export interface PaymentPayload {
  transactionId: string
  cardName: string
  cardNumber: string
  expiry: string
  amount: number
  currency: Currency
  attempt: number
}

export interface GatewayResponse {
  transactionId: string
  status: 'success' | 'failed'
  reason?: string
}

export interface Transaction {
  id: string
  amount: number
  currency: Currency
  status: PaymentStatus
  reason?: string
  timestamp: string
  attempts: number
}

export interface FormErrors {
  name?: string
  number?: string
  expiry?: string
  cvv?: string
  amount?: string
}
