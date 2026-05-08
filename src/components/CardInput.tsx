'use client'

import { SyntheticEvent, useEffect, useId, useRef, useState } from 'react'
import { FormField } from '@/components/ui/FormField'
import {
  CardPreviewFields,
  Currency,
  FormErrors,
  PaymentFormState,
  PaymentFormValues,
} from '@/types'
import { parseCurrencySymbol } from '@/utils/currency'
import { cn } from '@/utils/cn'
import {
  cardTypeLabel,
  detectCardType,
  formatAmount,
  formatCardNumber,
  formatExpiry,
  getCardMaxLength,
  getCvvLength,
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

interface Props {
  readonly onSubmit: (fields: PaymentFormValues) => void
  readonly onFieldChange: (fields: CardPreviewFields) => void
  readonly isProcessing: boolean
}

type FormFieldName = keyof FormErrors

const INITIAL_VALUES: PaymentFormState = {
  name: '',
  number: '',
  expiry: '',
  cvv: '',
  amount: '',
  currency: 'INR',
}

const TOUCHED_FIELDS: Record<FormFieldName, true> = {
  name: true,
  number: true,
  expiry: true,
  cvv: true,
  amount: true,
}

const CURRENCY_OPTIONS: ReadonlyArray<{ value: Currency; label: string }> = [
  { value: 'INR', label: 'INR ₹' },
  { value: 'USD', label: 'USD $' },
]

const INPUT_CLASS =
  'w-full bg-transparent font-mono text-[0.82rem] tracking-[0.04em] text-ink placeholder:text-ink/25 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50'

export function CardInput({ onSubmit, onFieldChange, isProcessing }: Props) {
  const uid = useId()
  const hasMountedRef = useRef(false)
  const [values, setValues] = useState<PaymentFormState>(INITIAL_VALUES)
  const [touched, setTouched] = useState<Partial<Record<FormFieldName, boolean>>>({})
  const [errors, setErrors] = useState<FormErrors>({})

  const { name, number, expiry, cvv, amount, currency } = values
  const cardType = detectCardType(number)
  const cvvLength = getCvvLength(cardType)
  const currentCardTypeLabel = cardTypeLabel(cardType)
  const validationErrors = validateAll(values, cardType)
  const submitEnabled = isFormValid(validationErrors) && !isProcessing
  const symbol = parseCurrencySymbol(currency)

  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true
      return
    }

    onFieldChange({ name, number, expiry })
  }, [expiry, name, number, onFieldChange])

  function updateValues(patch: Partial<PaymentFormState>) {
    setValues((current) => ({ ...current, ...patch }))
  }

  function markTouched(field: FormFieldName) {
    setTouched((current) => ({ ...current, [field]: true }))
  }

  function setFieldError(field: FormFieldName, value: string | undefined) {
    setErrors((current) => ({ ...current, [field]: value }))
  }

  function handleBlur(field: FormFieldName) {
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
    const detectedCardType = detectCardType(nextValue)
    const formatted = formatCardNumber(nextValue, detectedCardType)
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

  function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault()
    setTouched(TOUCHED_FIELDS)
    setErrors(validationErrors)

    if (!isFormValid(validationErrors)) {
      const form = event.currentTarget
      requestAnimationFrame(() => {
        form.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus()
      })
      return
    }

    onSubmit({ name, number, expiry, amount, currency })
  }

  return (
    <form
      className="border-ink grid border-l-2 border-t-2 md:grid-cols-2"
      aria-label="Payment details"
      onSubmit={handleSubmit}
    >
      <FormField
        full
        htmlFor={`${uid}-name`}
        label="Cardholder name"
        error={touched.name ? errors.name : undefined}
      >
        <input
          id={`${uid}-name`}
          className={INPUT_CLASS}
          type="text"
          autoComplete="cc-name"
          value={name}
          placeholder="Full name as on card"
          onChange={(event) => handleNameChange(event.target.value)}
          onBlur={() => handleBlur('name')}
          aria-describedby={errors.name ? `${uid}-name-err` : undefined}
          aria-invalid={Boolean(touched.name && errors.name)}
          disabled={isProcessing}
        />
      </FormField>

      <FormField
        full
        htmlFor={`${uid}-number`}
        label="Card number"
        error={touched.number ? errors.number : undefined}
      >
        <div className="flex items-center justify-between gap-3">
          <input
            id={`${uid}-number`}
            className={INPUT_CLASS}
            type="text"
            inputMode="numeric"
            autoComplete="cc-number"
            value={number}
            placeholder="0000 0000 0000 0000"
            maxLength={getCardMaxLength(cardType)}
            onChange={(event) => handleNumberChange(event.target.value)}
            onBlur={() => handleBlur('number')}
            aria-describedby={errors.number ? `${uid}-number-err` : undefined}
            aria-invalid={Boolean(touched.number && errors.number)}
            disabled={isProcessing}
          />
          {currentCardTypeLabel && (
            <span
              className="shrink-0 rounded-sm border border-amber px-2 py-1 font-mono text-[0.56rem] font-semibold tracking-[0.06em] text-amber"
              aria-label={`Card type: ${currentCardTypeLabel}`}
            >
              {currentCardTypeLabel}
            </span>
          )}
        </div>
      </FormField>

      <FormField
        htmlFor={`${uid}-expiry`}
        label="Expiry date"
        error={touched.expiry ? errors.expiry : undefined}
      >
        <input
          id={`${uid}-expiry`}
          className={INPUT_CLASS}
          type="text"
          inputMode="numeric"
          autoComplete="cc-exp"
          value={expiry}
          placeholder="MM / YY"
          maxLength={7}
          onChange={(event) => handleExpiryChange(event.target.value)}
          onBlur={() => handleBlur('expiry')}
          aria-describedby={errors.expiry ? `${uid}-expiry-err` : undefined}
          aria-invalid={Boolean(touched.expiry && errors.expiry)}
          disabled={isProcessing}
        />
      </FormField>

      <FormField
        htmlFor={`${uid}-cvv`}
        label="CVV / CVC"
        error={touched.cvv ? errors.cvv : undefined}
      >
        <input
          id={`${uid}-cvv`}
          className={INPUT_CLASS}
          type="password"
          inputMode="numeric"
          autoComplete="cc-csc"
          value={cvv}
          placeholder={cvvLength === 4 ? '0000' : '000'}
          maxLength={cvvLength}
          onChange={(event) => handleCvvChange(event.target.value)}
          onBlur={() => handleBlur('cvv')}
          aria-describedby={errors.cvv ? `${uid}-cvv-err` : undefined}
          aria-invalid={Boolean(touched.cvv && errors.cvv)}
          disabled={isProcessing}
        />
      </FormField>

      <FormField
        full
        htmlFor={`${uid}-amount`}
        label="Amount"
        error={touched.amount ? errors.amount : undefined}
      >
        <div className="flex items-center gap-3">
          <select
            className="shrink-0 bg-transparent font-mono text-xs font-semibold tracking-[0.08em] text-amber focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            value={currency}
            onChange={(event) => handleCurrencyChange(event.target.value as Currency)}
            aria-label="Currency"
            disabled={isProcessing}
          >
            {CURRENCY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <div className="h-6 w-px bg-ink/20" aria-hidden="true" />
          <input
            id={`${uid}-amount`}
            className={cn(INPUT_CLASS, 'text-lg font-semibold tracking-[0.02em]')}
            type="text"
            inputMode="decimal"
            value={amount}
            placeholder="0.00"
            onChange={(event) => handleAmountChange(event.target.value)}
            onBlur={() => handleBlur('amount')}
            aria-describedby={errors.amount ? `${uid}-amount-err` : undefined}
            aria-invalid={Boolean(touched.amount && errors.amount)}
            disabled={isProcessing}
          />
        </div>
      </FormField>

      <div className="border-ink bg-ink border-b-2 border-r-2 md:col-span-2">
        <button
          type="submit"
          className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-cream transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-45"
          disabled={!submitEnabled}
          aria-disabled={!submitEnabled}
          aria-label={isProcessing ? 'Processing payment' : `Pay ${symbol}${amount || '0.00'}`}
        >
          <div>
            <div className="text-[0.95rem] font-bold">
              {isProcessing ? 'Processing...' : `Pay ${symbol} ${amount || '0.00'}`}
            </div>
            <div className="mt-1 font-mono text-[0.5rem] font-light uppercase tracking-[0.14em] text-cream/35">
              Secure / validated / sandbox
            </div>
          </div>
          {isProcessing ? (
            <span
              className="size-4.5 shrink-0 rounded-full border-2 border-cream/20 border-t-amber animate-spin"
              aria-hidden="true"
            />
          ) : (
            <span aria-hidden="true">-&gt;</span>
          )}
        </button>
      </div>
    </form>
  )
}
