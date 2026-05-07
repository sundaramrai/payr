'use client'

import { useId, useState } from 'react'
import {
  Currency,
  FormErrors,
  PaymentFormState,
  PaymentFormValues,
  CardPreviewFields,
} from '@/types'
import { useCardDetect } from '@/hooks/useCardDetect'
import {
  detectCardType,
  formatAmount,
  formatCardNumber,
  formatExpiry,
} from '@/utils/cardFormatter'
import {
  isFormValid,
  validateAll,
  validateAmount,
  validateCardNumber,
  validateCvv,
  validateExpiry,
  validateName,
} from '@/utils/validators'
import { parseCurrencySymbol } from '@/utils/currency'

interface Props {
  readonly onSubmit: (fields: PaymentFormValues) => void
  readonly onFieldChange: (fields: CardPreviewFields) => void
  readonly isProcessing: boolean
}

type FormField = keyof FormErrors

const INITIAL_VALUES: PaymentFormState = {
  name: '',
  number: '',
  expiry: '',
  cvv: '',
  amount: '',
  currency: 'INR',
}

const TOUCHED_FIELDS: Record<FormField, true> = {
  name: true,
  number: true,
  expiry: true,
  cvv: true,
  amount: true,
}

export function CardInput({ onSubmit, onFieldChange, isProcessing }: Props) {
  const uid = useId()
  const [values, setValues] = useState<PaymentFormState>(INITIAL_VALUES)
  const [touched, setTouched] = useState<Partial<Record<FormField, boolean>>>({})
  const [errors, setErrors] = useState<FormErrors>({})

  const { name, number, expiry, cvv, amount, currency } = values
  const { cardType, cvvLength, label: cardTypeLabel } = useCardDetect(number)
  const validationErrors = validateAll(values, cardType)
  const submitEnabled = isFormValid(validationErrors) && !isProcessing
  const symbol = parseCurrencySymbol(currency)

  function updateValues(patch: Partial<PaymentFormState>): PaymentFormState {
    const nextValues = { ...values, ...patch }
    setValues(nextValues)

    if (
      patch.name !== undefined ||
      patch.number !== undefined ||
      patch.expiry !== undefined
    ) {
      onFieldChange({
        name: nextValues.name,
        number: nextValues.number,
        expiry: nextValues.expiry,
      })
    }

    return nextValues
  }

  function markTouched(field: FormField) {
    setTouched((current) => ({ ...current, [field]: true }))
  }

  function setFieldError(field: FormField, value: string | undefined) {
    setErrors((current) => ({ ...current, [field]: value }))
  }

  function handleBlur(field: FormField) {
    markTouched(field)
    setFieldError(field, validationErrors[field])
  }

  function handleNameChange(nextValue: string) {
    updateValues({ name: nextValue })

    if (touched.name) {
      setFieldError('name', validateName(nextValue))
    }
  }

  function handleNumberChange(nextValue: string) {
    const formatted = formatCardNumber(nextValue, detectCardType(nextValue))
    updateValues({ number: formatted })

    if (touched.number) {
      setFieldError('number', validateCardNumber(formatted))
    }
  }

  function handleExpiryChange(nextValue: string) {
    const formatted = formatExpiry(nextValue)
    updateValues({ expiry: formatted })

    if (touched.expiry) {
      setFieldError('expiry', validateExpiry(formatted))
    }
  }

  function handleCvvChange(nextValue: string) {
    const raw = nextValue.replaceAll(/\D/g, '').slice(0, cvvLength)
    updateValues({ cvv: raw })

    if (touched.cvv) {
      setFieldError('cvv', validateCvv(raw, cardType))
    }
  }

  function handleAmountChange(nextValue: string) {
    const formatted = formatAmount(nextValue)
    updateValues({ amount: formatted })

    if (touched.amount) {
      setFieldError('amount', validateAmount(formatted))
    }
  }

  function handleCurrencyChange(nextCurrency: Currency) {
    updateValues({ currency: nextCurrency })
  }

  function handleSubmit(event: React.BaseSyntheticEvent) {
    event.preventDefault()
    setTouched(TOUCHED_FIELDS)
    setErrors(validationErrors)

    if (!isFormValid(validationErrors)) {
      return
    }

    onSubmit({ name, number, expiry, amount, currency })
  }

  return (
    <form className="form-bento" aria-label="Payment details" onSubmit={handleSubmit}>
      <div className="bento-cell full">
        <label className="cell-label" htmlFor={`${uid}-name`}>
          Cardholder name
        </label>
        <input
          id={`${uid}-name`}
          className="cell-input"
          type="text"
          autoComplete="cc-name"
          value={name}
          placeholder="Full name as on card"
          onChange={(event) => handleNameChange(event.target.value)}
          onBlur={() => handleBlur('name')}
          aria-describedby={errors.name ? `${uid}-name-err` : undefined}
          aria-invalid={Boolean(errors.name)}
          disabled={isProcessing}
        />
        {touched.name && errors.name && (
          <span id={`${uid}-name-err`} className="error-tag" role="alert">
            {errors.name}
          </span>
        )}
      </div>

      <div className="bento-cell full">
        <label className="cell-label" htmlFor={`${uid}-number`}>
          Card number
        </label>
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
            onChange={(event) => handleNumberChange(event.target.value)}
            onBlur={() => handleBlur('number')}
            aria-describedby={errors.number ? `${uid}-number-err` : undefined}
            aria-invalid={Boolean(errors.number)}
            disabled={isProcessing}
          />
          {cardTypeLabel && (
            <span className="card-type-badge" aria-label={`Card type: ${cardTypeLabel}`}>
              {cardTypeLabel}
            </span>
          )}
        </div>
        {touched.number && errors.number && (
          <span id={`${uid}-number-err`} className="error-tag" role="alert">
            {errors.number}
          </span>
        )}
      </div>

      <div className="bento-cell">
        <label className="cell-label" htmlFor={`${uid}-expiry`}>
          Expiry date
        </label>
        <input
          id={`${uid}-expiry`}
          className="cell-input"
          type="text"
          inputMode="numeric"
          autoComplete="cc-exp"
          value={expiry}
          placeholder="MM / YY"
          maxLength={7}
          onChange={(event) => handleExpiryChange(event.target.value)}
          onBlur={() => handleBlur('expiry')}
          aria-describedby={errors.expiry ? `${uid}-expiry-err` : undefined}
          aria-invalid={Boolean(errors.expiry)}
          disabled={isProcessing}
        />
        {touched.expiry && errors.expiry && (
          <span id={`${uid}-expiry-err`} className="error-tag" role="alert">
            {errors.expiry}
          </span>
        )}
      </div>

      <div className="bento-cell">
        <label className="cell-label" htmlFor={`${uid}-cvv`}>
          CVV / CVC
        </label>
        <input
          id={`${uid}-cvv`}
          className="cell-input"
          type="password"
          inputMode="numeric"
          autoComplete="cc-csc"
          value={cvv}
          placeholder={cvvLength === 4 ? '0000' : '000'}
          maxLength={cvvLength}
          onChange={(event) => handleCvvChange(event.target.value)}
          onBlur={() => handleBlur('cvv')}
          aria-describedby={errors.cvv ? `${uid}-cvv-err` : undefined}
          aria-invalid={Boolean(errors.cvv)}
          disabled={isProcessing}
        />
        {touched.cvv && errors.cvv && (
          <span id={`${uid}-cvv-err`} className="error-tag" role="alert">
            {errors.cvv}
          </span>
        )}
      </div>

      <div className="bento-cell full">
        <label className="cell-label" htmlFor={`${uid}-amount`}>
          Amount
        </label>
        <div className="amount-row">
          <select
            className="currency-select"
            value={currency}
            onChange={(event) => handleCurrencyChange(event.target.value as Currency)}
            aria-label="Currency"
            disabled={isProcessing}
          >
            <option value="INR">INR Rs</option>
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
            onChange={(event) => handleAmountChange(event.target.value)}
            onBlur={() => handleBlur('amount')}
            aria-describedby={errors.amount ? `${uid}-amount-err` : undefined}
            aria-invalid={Boolean(errors.amount)}
            disabled={isProcessing}
          />
        </div>
        {touched.amount && errors.amount && (
          <span id={`${uid}-amount-err`} className="error-tag" role="alert">
            {errors.amount}
          </span>
        )}
      </div>

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
              {isProcessing ? 'Processing...' : `Pay ${symbol} ${amount || '0.00'}`}
            </div>
            <div className="pay-btn-sub">Secure / Encrypted / Instant</div>
          </div>
          {!isProcessing && <span aria-hidden="true">-&gt;</span>}
          {isProcessing && <span className="spinner" aria-hidden="true" />}
        </button>
      </div>
    </form>
  )
}
