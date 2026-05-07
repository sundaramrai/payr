# PayR - Payment Gateway UI

A payment gateway simulation built with Next.js 15 App Router, TypeScript, and Zustand. No third-party payment SDK is used. The gateway behavior is simulated through a Next.js route handler.

## Setup

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Architecture

```text
src/
  app/
    api/pay/route.ts
    globals.css
    layout.tsx
    page.tsx
  components/
    CardInput.tsx
    LiveCardPreview.tsx
    PaymentStage.tsx
    PaymentStatusRail.tsx
    RetryBanner.tsx
    StatusScreen.tsx
    TransactionHistory.tsx
  hooks/
    useCardDetect.ts
    usePayment.ts
  store/
    paymentStore.ts
  types/
    index.ts
  utils/
    cardFormatter.ts
    currency.ts
    storage.ts
    validators.ts
```

## Implemented Features

- Real-time per-field validation with disabled submit until the form is valid
- Card type detection for Visa, Mastercard, and Amex
- Live card preview with flip interaction
- Currency selector with INR and USD
- Payment lifecycle states: Idle, Processing, Success, Failed, Timeout
- Mock gateway route at `POST /api/pay`
- Frontend timeout handling with `AbortController` after 6 seconds
- Retry flow capped at 3 attempts with the same transaction ID reused
- Persistent transaction history in `localStorage`
- Transaction detail modal for previous payments
- Focus management after payment result transitions
- Responsive layout for mobile and desktop

## Gateway Simulation

`POST /api/pay` randomizes outcomes server-side:

| Outcome | Probability | Behavior |
| --- | --- | --- |
| Success | ~60% | Responds in about 2 seconds |
| Failed | ~25% | Responds in about 2 seconds with a reason |
| Timeout | ~15% | Responds after 8 seconds |

The frontend cancels timeout requests after 6 seconds.

## Assumptions

- Card data is only used for simulation and is not sent to a real processor
- CVV is masked in the input for basic shoulder-surfing protection
- Amount display uses `Intl.NumberFormat` with `en-IN`
- Transaction history relies on browser `localStorage`

## Why Zustand

Zustand keeps the global payment flow state small and explicit without Redux boilerplate. Shared lifecycle state, transaction history, current transaction ID, and retry count live in the store, while form input values stay local to the form component.

## What I Would Improve Next

- Add unit tests for validators and utilities
- Add end-to-end flow coverage with Playwright
- Add stronger card validation such as Luhn checks
- Add export or filtering for transaction history
- Add a clearer offline or reconnect state for repeated network failures
