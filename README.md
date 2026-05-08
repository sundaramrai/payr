# PayR - Payment Gateway UI

A payment gateway simulation built with Next.js 16 App Router, TypeScript, Zustand, Tailwind CSS, and Vitest. No third-party payment SDK is used. Gateway behavior is simulated through a Next.js route handler.

## Setup

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Scripts

```bash
npm run dev
npm run test
npm run lint
npm run build
```

## Architecture

```text
src/
  app/
    api/pay/route.ts
    globals.css
    layout.tsx
    page.tsx
  components/
    ui/
      FormField.tsx
      StatusBadge.tsx
    CardInput.tsx
    LiveCardPreview.tsx
    PaymentStage.tsx
    PaymentStatusRail.tsx
    RetryBanner.tsx
    StatusScreen.tsx
    TransactionHistory.tsx
  hooks/
    usePayment.ts
  store/
    paymentStore.ts
  types/
    index.ts
  utils/
    cardFormatter.ts
    cardFormatter.test.ts
    cn.ts
    currency.ts
    storage.ts
    validators.test.ts
    validators.ts
```

## Implemented Features

- Real-time per-field validation with disabled submit until the form is valid
- Card type detection for Visa, Mastercard, and Amex
- Stronger card validation with issuer checks and Luhn validation
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
- Unit tests for validators and formatter utilities with Vitest

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
- Transaction history relies on browser `localStorage`
- The app is intentionally a simulated gateway UI, not a production payment integration

## Why Zustand

Zustand keeps the global payment flow state small and explicit without Redux boilerplate. Shared lifecycle state, transaction history, current transaction ID, and retry count live in the store, while form input values stay local to the form component.

## What I Would Improve Next

- Add end-to-end flow coverage with Playwright
- Add export or filtering for transaction history
- Add a clearer offline or reconnect state for repeated network failures
