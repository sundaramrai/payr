import { Currency } from '@/types'

export function formatCurrency(amount: number, currency: Currency): string {
  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

  return formatter
    .formatToParts(amount)
    .map((part) => {
      if (part.type !== 'currency') {
        return part.value
      }

      return currency === 'INR' ? '₹' : '$'
    })
    .join('')
}

export function parseCurrencySymbol(currency: Currency): string {
  return currency === 'INR' ? '₹' : '$'
}

export function parseRawAmount(value: string): number {
  return Number.parseFloat(value.replaceAll(',', '')) || 0
}
