'use client'

import { CardType } from '@/types'
import { detectCardType, getCvvLength, cardTypeLabel } from '@/utils/cardFormatter'

export function useCardDetect(cardNumber: string): {
  cardType: CardType
  cvvLength: number
  label: string
} {
  const cardType = detectCardType(cardNumber)
  const cvvLength = getCvvLength(cardType)
  const label = cardTypeLabel(cardType)

  return { cardType, cvvLength, label }
}
