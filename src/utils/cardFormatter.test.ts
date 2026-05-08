import { describe, expect, it } from 'vitest'
import {
  detectCardType,
  formatAmount,
  formatCardNumber,
  formatExpiry,
  isSupportedCardNumber,
} from '@/utils/cardFormatter'

describe('cardFormatter', () => {
  it('detects supported card types', () => {
    expect(detectCardType('4111 1111 1111 1111')).toBe('visa')
    expect(detectCardType('5555 5555 5555 4444')).toBe('mastercard')
    expect(detectCardType('378282246310005')).toBe('amex')
  })

  it('formats card number and expiry strings', () => {
    expect(formatCardNumber('4111111111111111', 'visa')).toBe('4111 1111 1111 1111')
    expect(formatCardNumber('378282246310005', 'amex')).toBe('3782 822463 10005')
    expect(formatExpiry('1228')).toBe('12 / 28')
  })

  it('normalizes amount input with grouping and decimals', () => {
    expect(formatAmount('0012345.678')).toBe('12,345.67')
    expect(formatAmount('.5')).toBe('0.5')
  })

  it('checks supported card numbers with luhn validation', () => {
    expect(isSupportedCardNumber('4111 1111 1111 1111')).toBe(true)
    expect(isSupportedCardNumber('4111 1111 1111 1112')).toBe(false)
    expect(isSupportedCardNumber('6011 1111 1111 1117')).toBe(false)
  })
})
