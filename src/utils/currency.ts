import { Currency } from '@/types'

export function formatCurrency(amount: number, currency: Currency): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function parseCurrencySymbol(currency: Currency): string {
  return currency === 'INR' ? '₹' : '$'
}

export function parseRawAmount(value: string): number {
  return Number.parseFloat(value.replaceAll(',', '')) || 0
}
