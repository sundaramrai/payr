import { CardType, FormErrors } from '@/types'
import { getCvvLength, detectCardType } from './cardFormatter'

export function validateName(name: string): string | undefined {
  if (!name.trim()) return 'Cardholder name is required'
  if (name.trim().length < 2) return 'Enter a valid name'
}

export function validateCardNumber(number: string): string | undefined {
  const raw = number.replaceAll(' ', '')
  if (!raw) return 'Card number is required'
  const cardType = detectCardType(number)
  const expectedLength = cardType === 'amex' ? 15 : 16
  if (raw.length !== expectedLength) return `Must be ${expectedLength} digits`
}

export function validateExpiry(expiry: string): string | undefined {
  const raw = expiry.replaceAll(' ', '')
  if (!raw) return 'Expiry date is required'
  const parts = raw.split('/')
  if (parts.length !== 2) return 'Use MM / YY format'
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
