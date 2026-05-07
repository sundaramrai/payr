'use client'

import { useMemo } from 'react'
import { CardType } from '@/types'
import { detectCardType, getCvvLength, cardTypeLabel } from '@/utils/cardFormatter'

export function useCardDetect(cardNumber: string): {
  cardType: CardType
  cvvLength: number
  label: string
} {
  const cardType = useMemo(() => detectCardType(cardNumber), [cardNumber])
  const cvvLength = useMemo(() => getCvvLength(cardType), [cardType])
  const label = useMemo(() => cardTypeLabel(cardType), [cardType])

  return { cardType, cvvLength, label }
}
