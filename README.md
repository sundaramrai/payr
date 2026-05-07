# PayR — Payment Gateway UI

A full-stack payment gateway simulation built with **Next.js 15 App Router** and **TypeScript**. No third-party payment SDK used — all gateway behaviour is simulated via a Next.js API Route.

## Setup

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Architecture

```
src/
├── app/
│   ├── api/pay/route.ts      # Mock gateway (POST /api/pay)
│   ├── page.tsx              # Root page — orchestrates all state
│   ├── layout.tsx
│   └── globals.css           # Full design system
├── components/
│   ├── CardInput.tsx         # Payment form with real-time validation
│   ├── LiveCardPreview.tsx   # 3D flip card preview
│   ├── StatusScreen.tsx      # Idle / Processing / Success / Failed / Timeout
│   ├── RetryBanner.tsx       # Retry UI with attempt counter
│   └── TransactionHistory.tsx # History list + detail modal
├── hooks/
│   ├── usePayment.ts         # Core payment lifecycle hook
│   └── useCardDetect.ts      # Card type detection hook
├── store/
│   └── paymentStore.ts       # Zustand global store
├── types/
│   └── index.ts              # All TypeScript interfaces
└── utils/
    ├── cardFormatter.ts      # Format, mask, detect card numbers
    ├── validators.ts         # Per-field validation functions
    ├── storage.ts            # localStorage wrapper (typed)
    └── currency.ts           # Currency formatting helpers
```

## Features

- **Real-time field validation** — errors appear per field on blur/change, never all at once on submit
- **Card detection** — Visa / Mastercard / Amex auto-detected from prefix; CVV length adjusts accordingly
- **3D card flip** — hover the card preview to see the back face
- **Auto-format** — card number spaces every 4 digits, expiry MM / YY, amount with commas
- **Payment lifecycle** — Idle → Processing → Success / Failed / Timeout
- **AbortController timeout** — frontend cancels after 6 s; server simulates 8 s delay for timeout scenario
- **Retry logic** — up to 3 attempts; same transaction ID reused across retries
- **Transaction history** — persists across refreshes; click any row for full details
- **Idempotency** — `crypto.randomUUID()` generates one ID per transaction, passed on every retry attempt
- **Accessibility** — `aria-describedby` on all error messages, `aria-live` on status regions, focus managed to result heading after transition
- **Responsive** — works at 375 px and 1280 px

## Gateway Simulation

`POST /api/pay` randomises outcomes server-side:

| Outcome | Probability | Behaviour |
|---------|-------------|-----------|
| Success | ~60% | Responds in ~1.2 s |
| Failed  | ~25% | Responds in ~0.8 s with a reason string |
| Timeout | ~15% | Responds after 8 s (frontend AbortController cancels at 6 s) |

## State Management

**Zustand** was chosen over Redux Toolkit for this scope — it eliminates boilerplate while keeping the store typed and modular. Global state covers payment lifecycle, current transaction ID, attempt count, failure reason, and transaction history. Local `useState` is used only for form field values.

## Assumptions

- Card numbers are not transmitted to any real payment processor
- The CVV field uses `type="password"` to prevent shoulder-surfing
- Currency formatting uses `Intl.NumberFormat` with `en-IN` locale
- Transaction history is capped by browser localStorage limits (~5 MB)

## What I'd Improve Given More Time

- Add unit tests for all validators and utility functions (Jest + Testing Library)
- Add E2E tests for the payment flow (Playwright)
- Animate state transitions with Framer Motion
- Add a dark mode toggle
- Support more card types (Discover, UnionPay, Maestro)
- Add card number Luhn algorithm validation
- Export transaction history as CSV
