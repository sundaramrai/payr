import { Currency } from '@/types'

const LOCALES: Record<Currency, string> = {
  INR: 'en-IN',
  USD: 'en-US',
}

export function formatCurrency(amount: number, currency: Currency): string {
  const formatter = new Intl.NumberFormat(LOCALES[currency], {
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

      return parseCurrencySymbol(currency)
    })
    .join('')
}

export function parseCurrencySymbol(currency: Currency): string {
  return currency === 'INR' ? '₹' : '$'
}

export function parseRawAmount(value: string): number {
  return Number.parseFloat(value.replaceAll(',', '')) || 0
}
