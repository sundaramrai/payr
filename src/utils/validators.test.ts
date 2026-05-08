import { describe, expect, it } from 'vitest'
import {
  validateAmount,
  validateCardNumber,
  validateExpiry,
  validateName,
} from '@/utils/validators'

describe('validators', () => {
  it('validates names', () => {
    expect(validateName('Jane Doe')).toBeUndefined()
    expect(validateName('J')).toBe('Enter a valid name')
    expect(validateName('Jane123')).toBe('Use letters only')
  })

  it('validates card numbers with issuer and luhn rules', () => {
    expect(validateCardNumber('4111 1111 1111 1111')).toBeUndefined()
    expect(validateCardNumber('6011 1111 1111 1117')).toBe('Unsupported card type')
    expect(validateCardNumber('4111 1111 1111 1112')).toBe('VISA number is invalid')
  })

  it('validates expiry dates and amounts', () => {
    expect(validateExpiry('12 / 28')).toBeUndefined()
    expect(validateExpiry('1 / 28')).toBe('Use MM / YY format')
    expect(validateAmount('120.50')).toBeUndefined()
    expect(validateAmount('120.505')).toBe('Use up to 2 decimal places')
  })
})
