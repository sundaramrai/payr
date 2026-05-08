import { CardType, FormErrors } from '@/types'
import {
  cardTypeLabel,
  detectCardType,
  getCvvLength,
  isSupportedCardNumber,
  stripToDigits,
} from './cardFormatter'

export function validateName(name: string): string | undefined {
  const trimmed = name.trim()
  if (!trimmed) return 'Cardholder name is required'
  if (trimmed.length < 2) return 'Enter a valid name'
  if (!/^[a-z ,.'-]+$/i.test(trimmed)) return 'Use letters only'
}

export function validateCardNumber(number: string): string | undefined {
  const raw = stripToDigits(number)
  if (!raw) return 'Card number is required'
  const cardType = detectCardType(number)
  if (cardType === 'unknown') return 'Unsupported card type'
  const expectedLength = cardType === 'amex' ? 15 : 16
  if (raw.length !== expectedLength) return `Must be ${expectedLength} digits`
  if (!isSupportedCardNumber(number)) return `${cardTypeLabel(cardType)} number is invalid`
}

export function validateExpiry(expiry: string): string | undefined {
  const raw = expiry.replaceAll(' ', '')
  if (!raw) return 'Expiry date is required'
  const parts = raw.split('/')
  if (parts.length !== 2) return 'Use MM / YY format'
  if (parts[0].trim().length !== 2 || parts[1].trim().length !== 2) {
    return 'Use MM / YY format'
  }
  const month = Number.parseInt(parts[0], 10)
  const year = Number.parseInt(parts[1], 10)
  if (Number.isNaN(month) || Number.isNaN(year)) return 'Invalid expiry date'
  if (month < 1 || month > 12) return 'Invalid month'
  const now = new Date()
  const currentYear = now.getFullYear() % 100
  const currentMonth = now.getMonth() + 1
  if (year < currentYear || (year === currentYear && month < currentMonth)) {
    return 'Card has expired'
  }
}

export function validateCvv(cvv: string, cardType: CardType): string | undefined {
  const required = getCvvLength(cardType)
  if (!cvv) return 'CVV is required'
  if (!/^\d+$/.test(cvv)) return 'CVV must be numeric'
  if (cvv.length !== required) return `Must be ${required} digits`
}

export function validateAmount(amount: string): string | undefined {
  const raw = Number.parseFloat(amount.replaceAll(',', ''))
  if (!amount) return 'Amount is required'
  if (Number.isNaN(raw) || raw <= 0) return 'Enter a valid amount'
  if (raw > 1_000_000) return 'Amount exceeds limit'
  if (!/^\d{1,3}(,\d{3})*(\.\d{1,2})?$|^\d+(\.\d{1,2})?$/.test(amount)) {
    return 'Use up to 2 decimal places'
  }
}

export function validateAll(
  fields: { name: string; number: string; expiry: string; cvv: string; amount: string },
  cardType: CardType
): FormErrors {
  return {
    name: validateName(fields.name),
    number: validateCardNumber(fields.number),
    expiry: validateExpiry(fields.expiry),
    cvv: validateCvv(fields.cvv, cardType),
    amount: validateAmount(fields.amount),
  }
}

export function isFormValid(errors: FormErrors): boolean {
  return Object.values(errors).every((e) => !e)
}
