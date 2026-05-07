'use client'

import { CardType } from '@/types'
import { maskCardNumber, cardTypeLabel } from '@/utils/cardFormatter'

interface Props {
  readonly name: string
  readonly number: string
  readonly expiry: string
  readonly cardType: CardType
}

export function LiveCardPreview({ name, number, expiry, cardType }: Props) {
  const displayNumber = maskCardNumber(number, cardType)
  const displayName = name.trim().toUpperCase() || 'CARDHOLDER NAME'
  const displayExpiry = expiry || 'MM / YY'
  const typeLabel = cardTypeLabel(cardType)

  return (
    <div className="card-scene" aria-label="Live card preview — hover to flip">
      <div className="card-3d">
        {/* FRONT */}
        <div className="card-face card-front">
          <div className="card-top-row">
            <svg className="card-chip" viewBox="0 0 36 28" fill="none" aria-hidden="true">
              <rect x="0.5" y="0.5" width="35" height="27" rx="3"
                fill="#e8a020" fillOpacity="0.12"
                stroke="#e8a020" strokeOpacity="0.4" strokeWidth="0.5" />
              <rect x="8" y="6" width="20" height="16" rx="1.5"
                fill="none" stroke="#e8a020" strokeOpacity="0.5" strokeWidth="0.6" />
              <line x1="18" y1="6" x2="18" y2="22"
                stroke="#e8a020" strokeOpacity="0.35" strokeWidth="0.5" />
              <line x1="8" y1="14" x2="28" y2="14"
                stroke="#e8a020" strokeOpacity="0.35" strokeWidth="0.5" />
            </svg>
            <div className="card-top-right">
              {typeLabel && <span className="card-type-mark">{typeLabel}</span>}
              <span className="card-hint">LIVE PREVIEW</span>
            </div>
          </div>

          <div className="card-number" aria-label="Card number">
            {displayNumber}
          </div>

          <div className="card-bottom-row">
            <div>
              <div className="card-field-label">Cardholder</div>
              <div className="card-field-val">{displayName}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div className="card-field-label">Expires</div>
              <div className="card-field-val card-expiry">{displayExpiry}</div>
            </div>
          </div>
        </div>

        {/* BACK */}
        <div className="card-face card-back">
          <div className="card-back-strip" aria-hidden="true" />
          <div className="card-back-cvv-row">
            <div className="cvv-stripe" aria-label="CVV hidden">• • •</div>
            <span className="cvv-label">CVV</span>
          </div>
          <p className="card-back-note">
            No real card data is stored or transmitted
          </p>
        </div>
      </div>
    </div>
  )
}
