'use client'

import { useState, useCallback, useId } from 'react'
import { Currency, FormErrors } from '@/types'
import { useCardDetect } from '@/hooks/useCardDetect'
import {
  formatCardNumber,
  formatExpiry,
  formatAmount,
} from '@/utils/cardFormatter'
import {
  validateName,
  validateCardNumber,
  validateExpiry,
  validateCvv,
  validateAmount,
  isFormValid,
  validateAll,
} from '@/utils/validators'
import { parseCurrencySymbol } from '@/utils/currency'

interface Props {
  readonly onSubmit: (fields: {
    name: string
    number: string
    expiry: string
    amount: string
    currency: Currency
  }) => void
  readonly onFieldChange: (fields: { name: string; number: string; expiry: string }) => void
  readonly isProcessing: boolean
}

export function CardInput({ onSubmit, onFieldChange, isProcessing }: Props) {
  const uid = useId()

  const [name, setName] = useState('')
  const [number, setNumber] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvv, setCvv] = useState('')
  const [amount, setAmount] = useState('')
  const [currency, setCurrency] = useState<Currency>('INR')
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [errors, setErrors] = useState<FormErrors>({})

  const { cardType, cvvLength, label: cardTypeLabel } = useCardDetect(number)

  const touch = (field: string) =>
    setTouched((prev) => ({ ...prev, [field]: true }))

  const handleName = useCallback(
    (val: string) => {
      setName(val)
      if (touched.name) setErrors((e) => ({ ...e, name: validateName(val) }))
      onFieldChange({ name: val, number, expiry })
    },
    [touched.name, number, expiry, onFieldChange]
  )

  const handleNumber = useCallback(
    (val: string) => {
      const type = cardType
      const formatted = formatCardNumber(val, type)
      setNumber(formatted)
      if (touched.number)
        setErrors((e) => ({ ...e, number: validateCardNumber(formatted) }))
      onFieldChange({ name, number: formatted, expiry })
    },
    [touched.number, cardType, name, expiry, onFieldChange]
  )

  const handleExpiry = useCallback(
    (val: string) => {
      const formatted = formatExpiry(val)
      setExpiry(formatted)
      if (touched.expiry)
        setErrors((e) => ({ ...e, expiry: validateExpiry(formatted) }))
      onFieldChange({ name, number, expiry: formatted })
    },
    [touched.expiry, name, number, onFieldChange]
  )

  const handleCvv = useCallback(
    (val: string) => {
      const raw = val.replaceAll(/\D/g, '').slice(0, cvvLength)
      setCvv(raw)
      if (touched.cvv)
        setErrors((e) => ({ ...e, cvv: validateCvv(raw, cardType) }))
    },
    [touched.cvv, cvvLength, cardType]
  )

  const handleAmount = useCallback(
    (val: string) => {
      const formatted = formatAmount(val)
      setAmount(formatted)
      if (touched.amount)
        setErrors((e) => ({ ...e, amount: validateAmount(formatted) }))
    },
    [touched.amount]
  )

  const handleSubmit = () => {
    const allErrors = validateAll({ name, number, expiry, cvv, amount }, cardType)
    setErrors(allErrors)
    setTouched({ name: true, number: true, expiry: true, cvv: true, amount: true })
    if (!isFormValid(allErrors)) return
    onSubmit({ name, number, expiry, amount, currency })
  }

  const allErrors = validateAll({ name, number, expiry, cvv, amount }, cardType)
  const submitEnabled = isFormValid(allErrors) && !isProcessing

  const symbol = parseCurrencySymbol(currency)

  return (
    <form className="form-bento" aria-label="Payment details" onSubmit={(e) => { e.preventDefault(); handleSubmit() }}>

      {/* Name */}
      <div className="bento-cell full">
        <label className="cell-label" htmlFor={`${uid}-name`}>Cardholder name</label>
        <input
          id={`${uid}-name`}
          className="cell-input"
          type="text"
          autoComplete="cc-name"
          value={name}
          placeholder="Full name as on card"
          onChange={(e) => handleName(e.target.value)}
          onBlur={() => { touch('name'); setErrors((e) => ({ ...e, name: validateName(name) })) }}
          aria-describedby={errors.name ? `${uid}-name-err` : undefined}
          aria-invalid={!!errors.name}
          disabled={isProcessing}
        />
        {touched.name && errors.name && (
          <span id={`${uid}-name-err`} className="error-tag" role="alert">↑ {errors.name}</span>
        )}
      </div>

      {/* Card number */}
      <div className="bento-cell full">
        <label className="cell-label" htmlFor={`${uid}-number`}>Card number</label>
        <div className="number-row">
          <input
            id={`${uid}-number`}
            className="cell-input"
            type="text"
            inputMode="numeric"
            autoComplete="cc-number"
            value={number}
            placeholder="0000 0000 0000 0000"
            maxLength={cardType === 'amex' ? 17 : 19}
            onChange={(e) => handleNumber(e.target.value)}
            onBlur={() => { touch('number'); setErrors((e) => ({ ...e, number: validateCardNumber(number) })) }}
            aria-describedby={errors.number ? `${uid}-number-err` : undefined}
            aria-invalid={!!errors.number}
            disabled={isProcessing}
          />
          {cardTypeLabel && (
            <span className="card-type-badge" aria-label={`Card type: ${cardTypeLabel}`}>
              {cardTypeLabel}
            </span>
          )}
        </div>
        {touched.number && errors.number && (
          <span id={`${uid}-number-err`} className="error-tag" role="alert">↑ {errors.number}</span>
        )}
      </div>

      {/* Expiry */}
      <div className="bento-cell">
        <label className="cell-label" htmlFor={`${uid}-expiry`}>Expiry date</label>
        <input
          id={`${uid}-expiry`}
          className="cell-input"
          type="text"
          inputMode="numeric"
          autoComplete="cc-exp"
          value={expiry}
          placeholder="MM / YY"
          maxLength={7}
          onChange={(e) => handleExpiry(e.target.value)}
          onBlur={() => { touch('expiry'); setErrors((e) => ({ ...e, expiry: validateExpiry(expiry) })) }}
          aria-describedby={errors.expiry ? `${uid}-expiry-err` : undefined}
          aria-invalid={!!errors.expiry}
          disabled={isProcessing}
        />
        {touched.expiry && errors.expiry && (
          <span id={`${uid}-expiry-err`} className="error-tag" role="alert">↑ {errors.expiry}</span>
        )}
      </div>

      {/* CVV */}
      <div className="bento-cell">
        <label className="cell-label" htmlFor={`${uid}-cvv`}>CVV / CVC</label>
        <input
          id={`${uid}-cvv`}
          className="cell-input"
          type="password"
          inputMode="numeric"
          autoComplete="cc-csc"
          value={cvv}
          placeholder={cvvLength === 4 ? '• • • •' : '• • •'}
          maxLength={cvvLength}
          onChange={(e) => handleCvv(e.target.value)}
          onBlur={() => { touch('cvv'); setErrors((e) => ({ ...e, cvv: validateCvv(cvv, cardType) })) }}
          aria-describedby={errors.cvv ? `${uid}-cvv-err` : undefined}
          aria-invalid={!!errors.cvv}
          disabled={isProcessing}
        />
        {touched.cvv && errors.cvv && (
          <span id={`${uid}-cvv-err`} className="error-tag" role="alert">↑ {errors.cvv}</span>
        )}
      </div>

      {/* Amount */}
      <div className="bento-cell full">
        <label className="cell-label" htmlFor={`${uid}-amount`}>Amount</label>
        <div className="amount-row">
          <select
            className="currency-select"
            value={currency}
            onChange={(e) => setCurrency(e.target.value as Currency)}
            aria-label="Currency"
            disabled={isProcessing}
          >
            <option value="INR">INR ₹</option>
            <option value="USD">USD $</option>
          </select>
          <div className="divider-line" aria-hidden="true" />
          <input
            id={`${uid}-amount`}
            className="cell-input amount-input"
            type="text"
            inputMode="decimal"
            value={amount}
            placeholder="0.00"
            onChange={(e) => handleAmount(e.target.value)}
            onBlur={() => { touch('amount'); setErrors((e) => ({ ...e, amount: validateAmount(amount) })) }}
            aria-describedby={errors.amount ? `${uid}-amount-err` : undefined}
            aria-invalid={!!errors.amount}
            disabled={isProcessing}
          />
        </div>
        {touched.amount && errors.amount && (
          <span id={`${uid}-amount-err`} className="error-tag" role="alert">↑ {errors.amount}</span>
        )}
      </div>

      {/* Submit */}
      <div className="pay-cell">
        <button
          type="submit"
          className="pay-btn"
          disabled={!submitEnabled}
          aria-disabled={!submitEnabled}
          aria-label={
            isProcessing
              ? 'Processing payment'
              : `Pay ${symbol}${amount || '0.00'}`
          }
        >
          <div>
            <div className="pay-btn-label">
              {isProcessing ? 'Processing…' : `Pay ${symbol} ${amount || '0.00'}`}
            </div>
            <div className="pay-btn-sub">Secure · Encrypted · Instant</div>
          </div>
          {!isProcessing && <span aria-hidden="true">→</span>}
          {isProcessing && (
            <span className="spinner" aria-hidden="true" />
          )}
        </button>
      </div>

    </form>
  )
}
