import { CardType } from '@/types'

const STANDARD_MASK = '****'
const AMEX_MIDDLE_MASK = '******'
const AMEX_LAST_MASK = '*****'
const CARD_LENGTHS: Record<CardType, number> = {
  visa: 16,
  mastercard: 16,
  amex: 15,
  unknown: 16,
}
const CARD_LABELS: Record<CardType, string> = {
  visa: 'VISA',
  mastercard: 'MC',
  amex: 'AMEX',
  unknown: '',
}

export function detectCardType(number: string): CardType {
  const raw = stripToDigits(number)
  if (/^4\d{0,15}$/.test(raw)) return 'visa'
  if (/^(5[1-5]\d{0,14}|2(2[2-9]|[3-6]\d|7[01])\d{0,12}|2720\d{0,12})$/.test(raw)) {
    return 'mastercard'
  }
  if (/^3[47]\d{0,13}$/.test(raw)) return 'amex'
  return 'unknown'
}

export function formatCardNumber(value: string, cardType: CardType): string {
  const raw = stripToDigits(value).slice(0, CARD_LENGTHS[cardType])
  if (cardType === 'amex') {
    const first = raw.slice(0, 4)
    const second = raw.slice(4, 10)
    const third = raw.slice(10, 15)
    return [first, second, third].filter(Boolean).join(' ')
  }
  return raw.replaceAll(/(.{4})/g, '$1 ').trim()
}

export function formatExpiry(value: string): string {
  const raw = stripToDigits(value).slice(0, 4)
  if (raw.length <= 2) return raw
  return `${raw.slice(0, 2)} / ${raw.slice(2, 4)}`
}

export function maskCardNumber(number: string, cardType: CardType): string {
  const raw = stripToDigits(number)
  if (cardType === 'amex') {
    const visible = raw.slice(0, 4)
    const last = raw.slice(10, 15) || AMEX_LAST_MASK
    return `${visible} ${AMEX_MIDDLE_MASK} ${last}`.trim()
  }
  const groups = raw.padEnd(16, '*').match(/.{1,4}/g) ?? []
  return groups
    .map((group, index) => (index < 2 ? STANDARD_MASK : group))
    .join(' ')
}

export function getCvvLength(cardType: CardType): number {
  return cardType === 'amex' ? 4 : 3
}

export function formatAmount(amount: string): string {
  const sanitized = amount.replaceAll(/[^\d.]/g, '')
  const [integerPart = '', ...decimalParts] = sanitized.split('.')
  const normalizedInteger = integerPart.replace(/^0+(?=\d)/, '')
  const integer = normalizedInteger.replaceAll(/\B(?=(\d{3})+(?!\d))/g, ',')
  const decimal = decimalParts.length > 0 ? `.${decimalParts.join('').slice(0, 2)}` : ''

  return `${integer}${decimal}`.replace(/^\./, '0.')
}

export function cardTypeLabel(cardType: CardType): string {
  return CARD_LABELS[cardType]
}

export function getCardMaxLength(cardType: CardType): number {
  return cardType === 'amex' ? 17 : 19
}

export function stripToDigits(value: string): string {
  return value.replaceAll(/\D/g, '')
}

export function isSupportedCardNumber(number: string): boolean {
  const cardType = detectCardType(number)
  if (cardType === 'unknown') {
    return false
  }

  const raw = stripToDigits(number)
  return raw.length === CARD_LENGTHS[cardType] && passesLuhnCheck(raw)
}

function passesLuhnCheck(number: string): boolean {
  let total = 0
  let shouldDouble = false

  for (let index = number.length - 1; index >= 0; index -= 1) {
    let digit = Number.parseInt(number[index], 10)

    if (shouldDouble) {
      digit *= 2
      if (digit > 9) {
        digit -= 9
      }
    }

    total += digit
    shouldDouble = !shouldDouble
  }

  return total % 10 === 0
}
