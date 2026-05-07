import { CardType } from '@/types'

export function detectCardType(number: string): CardType {
  const raw = number.replaceAll(' ', '')
  if (raw.startsWith('4')) return 'visa'
  if (/^5[1-5]/.test(raw) || /^2[2-7]/.test(raw)) return 'mastercard'
  if (/^3[47]/.test(raw)) return 'amex'
  return 'unknown'
}

export function formatCardNumber(value: string, cardType: CardType): string {
  const raw = value.replaceAll(/\D/g, '')
  if (cardType === 'amex') {
    const p1 = raw.slice(0, 4)
    const p2 = raw.slice(4, 10)
    const p3 = raw.slice(10, 15)
    return [p1, p2, p3].filter(Boolean).join(' ')
  }
  return raw.replaceAll(/(.{4})/g, '$1 ').trim()
}

export function formatExpiry(value: string): string {
  const raw = value.replaceAll(/\D/g, '')
  if (raw.length <= 2) return raw
  return `${raw.slice(0, 2)} / ${raw.slice(2, 4)}`
}

export function maskCardNumber(number: string, cardType: CardType): string {
  const raw = number.replaceAll(' ', '')
  if (cardType === 'amex') {
    const visible = raw.slice(0, 4)
    const masked = '••••••'
    const last = raw.slice(10, 15) || '•••••'
    return `${visible} ${masked} ${last}`
  }
  const groups = raw.padEnd(16, '•').match(/.{1,4}/g) ?? []
  return groups
    .map((g, i) => (i < 2 ? '••••' : g))
    .join('  ')
}

export function getCvvLength(cardType: CardType): number {
  return cardType === 'amex' ? 4 : 3
}

export function formatAmount(amount: string): string {
  const raw = amount.replaceAll(/[^\d.]/g, '')
  const parts = raw.split('.')
  const integer = parts[0].replaceAll(/\B(?=(\d{3})+(?!\d))/g, ',')
  const decimal = parts.length > 1 ? `.${parts[1].slice(0, 2)}` : ''
  return `${integer}${decimal}`
}

export function cardTypeLabel(cardType: CardType): string {
  const map: Record<CardType, string> = {
    visa: 'VISA',
    mastercard: 'MC',
    amex: 'AMEX',
    unknown: '',
  }
  return map[cardType]
}
