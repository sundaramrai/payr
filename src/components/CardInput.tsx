'use client'

import { type SubmitEvent, useEffect, useId, useRef, useState } from 'react'
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

function getFieldMeta(
  uid: string,
  touched: Partial<Record<FormFieldName, boolean>>,
  errors: FormErrors,
  field: FormFieldName
) {
  const error = touched[field] ? errors[field] : undefined

  return {
    error,
    describedBy: error ? `${uid}-${field}-err` : undefined,
    invalid: Boolean(error),
  }
}

function updateValidatedField(
  field: FormFieldName,
  value: string,
  touched: Partial<Record<FormFieldName, boolean>>,
  updateValues: (patch: Partial<PaymentFormState>) => void,
  setFieldError: (field: FormFieldName, value: string | undefined) => void,
  validate: (value: string) => string | undefined
) {
  updateValues({ [field]: value } as Partial<PaymentFormState>)

  if (touched[field]) {
    setFieldError(field, validate(value))
  }
}

function focusFirstInvalidField(form: HTMLFormElement) {
  requestAnimationFrame(() => {
    form.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus()
  })
}

function CardTypeIndicator({ label }: { readonly label: string | null }) {
  if (!label) {
    return null
  }

  return (
    <span
      className="shrink-0 rounded-sm border border-amber px-2 py-1 font-mono text-[0.56rem] font-semibold tracking-[0.06em] text-amber"
      aria-label={`Card type: ${label}`}
    >
      {label}
    </span>
  )
}

function SubmitIndicator({ isProcessing }: { readonly isProcessing: boolean }) {
  if (isProcessing) {
    return (
      <span
        className="size-4.5 shrink-0 rounded-full border-2 border-cream/20 border-t-amber animate-spin"
        aria-hidden="true"
      />
    )
  }

  return <span aria-hidden="true">-&gt;</span>
}

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
  const displayAmount = amount || '0.00'
  const submitAriaLabel = isProcessing ? 'Processing payment' : `Pay ${symbol}${displayAmount}`
  const submitButtonText = isProcessing ? 'Processing...' : `Pay ${symbol} ${displayAmount}`
  const cvvPlaceholder = cvvLength === 4 ? '0000' : '000'
  const nameMeta = getFieldMeta(uid, touched, errors, 'name')
  const numberMeta = getFieldMeta(uid, touched, errors, 'number')
  const expiryMeta = getFieldMeta(uid, touched, errors, 'expiry')
  const cvvMeta = getFieldMeta(uid, touched, errors, 'cvv')
  const amountMeta = getFieldMeta(uid, touched, errors, 'amount')

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
    updateValidatedField('name', nextValue, touched, updateValues, setFieldError, validateName)
  }

  function handleNumberChange(nextValue: string) {
    const detectedCardType = detectCardType(nextValue)
    const formatted = formatCardNumber(nextValue, detectedCardType)
    updateValidatedField('number', formatted, touched, updateValues, setFieldError, validateCardNumber)
  }

  function handleExpiryChange(nextValue: string) {
    const formatted = formatExpiry(nextValue)
    updateValidatedField('expiry', formatted, touched, updateValues, setFieldError, validateExpiry)
  }

  function handleCvvChange(nextValue: string) {
    const raw = nextValue.replaceAll(/\D/g, '').slice(0, cvvLength)
    updateValidatedField('cvv', raw, touched, updateValues, setFieldError, (value) =>
      validateCvv(value, cardType)
    )
  }

  function handleAmountChange(nextValue: string) {
    const formatted = formatAmount(nextValue)
    updateValidatedField('amount', formatted, touched, updateValues, setFieldError, validateAmount)
  }

  function handleCurrencyChange(nextCurrency: Currency) {
    updateValues({ currency: nextCurrency })
  }

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    setTouched(TOUCHED_FIELDS)
    setErrors(validationErrors)

    if (!isFormValid(validationErrors)) {
      focusFirstInvalidField(event.currentTarget)
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
        error={nameMeta.error}
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
          aria-describedby={nameMeta.describedBy}
          aria-invalid={nameMeta.invalid}
          disabled={isProcessing}
        />
      </FormField>

      <FormField
        full
        htmlFor={`${uid}-number`}
        label="Card number"
        error={numberMeta.error}
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
            aria-describedby={numberMeta.describedBy}
            aria-invalid={numberMeta.invalid}
            disabled={isProcessing}
          />
          <CardTypeIndicator label={currentCardTypeLabel} />
        </div>
      </FormField>

      <FormField
        htmlFor={`${uid}-expiry`}
        label="Expiry date"
        error={expiryMeta.error}
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
          aria-describedby={expiryMeta.describedBy}
          aria-invalid={expiryMeta.invalid}
          disabled={isProcessing}
        />
      </FormField>

      <FormField
        htmlFor={`${uid}-cvv`}
        label="CVV / CVC"
        error={cvvMeta.error}
      >
        <input
          id={`${uid}-cvv`}
          className={INPUT_CLASS}
          type="password"
          inputMode="numeric"
          autoComplete="cc-csc"
          value={cvv}
          placeholder={cvvPlaceholder}
          maxLength={cvvLength}
          onChange={(event) => handleCvvChange(event.target.value)}
          onBlur={() => handleBlur('cvv')}
          aria-describedby={cvvMeta.describedBy}
          aria-invalid={cvvMeta.invalid}
          disabled={isProcessing}
        />
      </FormField>

      <FormField
        full
        htmlFor={`${uid}-amount`}
        label="Amount"
        error={amountMeta.error}
      >
        <div className="flex items-center gap-3">
          <div className="relative shrink-0">
            <select
              className="min-w-22 appearance-none bg-transparent pr-7 font-mono text-xs font-semibold tracking-[0.08em] whitespace-nowrap text-amber focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
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
            <span
              className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 text-amber"
              aria-hidden="true"
            >
              <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
                <path
                  d="M1 1.25L6 6.25L11 1.25"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </div>
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
            aria-describedby={amountMeta.describedBy}
            aria-invalid={amountMeta.invalid}
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
          aria-label={submitAriaLabel}
        >
          <div>
            <div className="text-[0.95rem] font-bold">{submitButtonText}</div>
            <div className="mt-1 font-mono text-[0.5rem] font-light uppercase tracking-[0.14em] text-cream/35">
              Secure / validated / sandbox
            </div>
          </div>
          <SubmitIndicator isProcessing={isProcessing} />
        </button>
      </div>
    </form>
  )
}
