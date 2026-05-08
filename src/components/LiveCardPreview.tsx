'use client'

import { useState } from 'react'
import { CardType } from '@/types'
import { cn } from '@/utils/cn'
import { cardTypeLabel, maskCardNumber } from '@/utils/cardFormatter'

interface Props {
  readonly name: string
  readonly number: string
  readonly expiry: string
  readonly cardType: CardType
}

export function LiveCardPreview({ name, number, expiry, cardType }: Props) {
  const [isPinned, setIsPinned] = useState(false)
  const displayNumber = maskCardNumber(number, cardType)
  const displayName = name.trim().toUpperCase() || 'CARDHOLDER NAME'
  const displayExpiry = expiry || 'MM / YY'
  const typeLabel = cardTypeLabel(cardType)

  return (
    <button
      type="button"
      className="group block w-full cursor-pointer text-left focus:outline-none"
      aria-label={`Live card preview${isPinned ? ', back visible' : ', front visible'}`}
      aria-pressed={isPinned}
      onClick={() => setIsPinned((current) => !current)}
    >
      <div className="h-44 perspective-[900px] sm:h-48">
        <div
          className={cn(
            'preserve-3d relative h-full w-full transition-transform duration-700 ease-in-out',
            isPinned
              ? 'transform-[rotateY(180deg)]'
              : 'group-hover:transform-[rotateY(180deg)] group-focus-visible:transform-[rotateY(180deg)]'
          )}
        >
          <div className="backface-hidden border-ink absolute inset-0 flex flex-col justify-between overflow-hidden border-2 bg-ink px-5 py-5 text-cream sm:px-6">
            <div className="flex items-start justify-between gap-4">
              <svg className="h-7 w-9 opacity-80" viewBox="0 0 36 28" fill="none" aria-hidden="true">
                <rect
                  x="0.5"
                  y="0.5"
                  width="35"
                  height="27"
                  rx="3"
                  fill="#e8a020"
                  fillOpacity="0.12"
                  stroke="#e8a020"
                  strokeOpacity="0.4"
                  strokeWidth="0.5"
                />
                <rect
                  x="8"
                  y="6"
                  width="20"
                  height="16"
                  rx="1.5"
                  fill="none"
                  stroke="#e8a020"
                  strokeOpacity="0.5"
                  strokeWidth="0.6"
                />
                <line
                  x1="18"
                  y1="6"
                  x2="18"
                  y2="22"
                  stroke="#e8a020"
                  strokeOpacity="0.35"
                  strokeWidth="0.5"
                />
                <line
                  x1="8"
                  y1="14"
                  x2="28"
                  y2="14"
                  stroke="#e8a020"
                  strokeOpacity="0.35"
                  strokeWidth="0.5"
                />
              </svg>

              <div className="flex flex-col items-end gap-1">
                {typeLabel && <span className="text-sm font-extrabold tracking-[0.04em] text-amber">{typeLabel}</span>}
                <span className="font-mono text-[0.45rem] uppercase tracking-[0.14em] text-cream/35">
                  Live preview
                </span>
              </div>
            </div>

            <div className="font-mono text-sm tracking-[0.18em] text-cream sm:text-base">
              {displayNumber}
            </div>

            <div className="flex items-end justify-between gap-4">
              <div className="min-w-0">
                <div className="mb-1 font-mono text-[0.45rem] uppercase tracking-[0.14em] text-cream/35">
                  Cardholder
                </div>
                <div className="truncate font-mono text-[0.68rem] uppercase tracking-widest sm:text-[0.72rem]">
                  {displayName}
                </div>
              </div>

              <div className="shrink-0 text-right">
                <div className="mb-1 font-mono text-[0.45rem] uppercase tracking-[0.14em] text-cream/35">
                  Expires
                </div>
                <div className="font-mono text-[0.68rem] uppercase tracking-widest text-amber sm:text-[0.72rem]">
                  {displayExpiry}
                </div>
              </div>
            </div>
          </div>

          <div className="backface-hidden border-ink absolute inset-0 flex transform-[rotateY(180deg)] flex-col justify-center gap-3 overflow-hidden border-2 bg-amber text-ink">
            <div className="h-10 w-full bg-ink/85" aria-hidden="true" />
            <div className="flex items-center gap-3 px-5 sm:px-6">
              <div className="flex h-8 flex-1 items-center border border-ink/15 bg-white/55 px-3 font-mono text-sm tracking-[0.2em]">
                * * *
              </div>
              <span className="font-mono text-[0.56rem] font-semibold uppercase tracking-[0.14em] text-ink/60">
                CVV
              </span>
            </div>
            <p className="px-5 text-center font-mono text-[0.45rem] uppercase tracking-widest text-ink/45 sm:px-6">
              No real card data is stored or transmitted
            </p>
          </div>
        </div>
      </div>
    </button>
  )
}
