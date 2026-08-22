'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export interface CardDetails {
  cardName: string
  cardNumber: string
  expiry: string
  cvc: string
}

export type CardErrors = Partial<Record<keyof CardDetails, string>>

export function validateCardDetails(details: CardDetails): CardErrors {
  const errors: CardErrors = {}

  if (!details.cardName || details.cardName.trim().length < 3) {
    errors.cardName = 'Enter the name on the card'
  }

  const digitsOnly = details.cardNumber.replace(/\s/g, '')
  if (!/^\d{16}$/.test(digitsOnly)) {
    errors.cardNumber = 'Card number must be 16 digits'
  }

  const expiryMatch = /^(\d{2})\/(\d{2})$/.exec(details.expiry)
  if (!expiryMatch) {
    errors.expiry = 'Use MM/YY format'
  } else {
    const month = Number(expiryMatch[1])
    const year = Number(expiryMatch[2]) + 2000
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth() + 1
    if (month < 1 || month > 12) {
      errors.expiry = 'Invalid month'
    } else if (
      year < currentYear ||
      (year === currentYear && month < currentMonth)
    ) {
      errors.expiry = 'Card has expired'
    }
  }

  if (!/^\d{3,4}$/.test(details.cvc)) {
    errors.cvc = 'CVC must be 3-4 digits'
  }

  return errors
}

function formatCardNumber(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 16)
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ')
}

function formatExpiry(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 4)
  if (digits.length <= 2) return digits
  return `${digits.slice(0, 2)}/${digits.slice(2)}`
}

interface CardPaymentMockProps {
  details: CardDetails
  errors: CardErrors
  onChange: (details: CardDetails) => void
}

export function CardPaymentMock({
  details,
  errors,
  onChange,
}: CardPaymentMockProps) {
  return (
    <div className="flex flex-col gap-4 rounded-lg border border-border p-4 bg-aegean-gray/20">
      <p className="text-xs text-muted-foreground">
        Demo card form only — no real payment is processed.
      </p>
      <div className="flex flex-col gap-1">
        <Label htmlFor="cardName">Name on Card</Label>
        <Input
          id="cardName"
          type="text"
          placeholder="John Doe"
          value={details.cardName}
          onChange={(e) => onChange({ ...details, cardName: e.target.value })}
          error={errors.cardName}
        />
      </div>
      <div className="flex flex-col gap-1">
        <Label htmlFor="cardNumber">Card Number</Label>
        <Input
          id="cardNumber"
          type="text"
          inputMode="numeric"
          placeholder="4242 4242 4242 4242"
          value={details.cardNumber}
          onChange={(e) =>
            onChange({
              ...details,
              cardNumber: formatCardNumber(e.target.value),
            })
          }
          error={errors.cardNumber}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <Label htmlFor="expiry">Expiry</Label>
          <Input
            id="expiry"
            type="text"
            inputMode="numeric"
            placeholder="MM/YY"
            value={details.expiry}
            onChange={(e) =>
              onChange({ ...details, expiry: formatExpiry(e.target.value) })
            }
            error={errors.expiry}
          />
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="cvc">CVC</Label>
          <Input
            id="cvc"
            type="text"
            inputMode="numeric"
            placeholder="123"
            value={details.cvc}
            onChange={(e) =>
              onChange({
                ...details,
                cvc: e.target.value.replace(/\D/g, '').slice(0, 4),
              })
            }
            error={errors.cvc}
          />
        </div>
      </div>
    </div>
  )
}

// Fixed, purely decorative "QR-like" pattern — not a real scannable code.
// Scanning is simulated with the button below it.
const QR_PATTERN = [
  [1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1],
  [1, 0, 1, 0, 1, 0, 1, 1, 0, 1, 1, 0, 1],
  [1, 0, 1, 0, 1, 1, 0, 0, 1, 0, 1, 0, 1],
  [1, 0, 0, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1],
  [1, 1, 1, 1, 1, 0, 1, 0, 0, 0, 0, 0, 1],
  [0, 0, 0, 0, 0, 0, 1, 1, 0, 1, 1, 1, 0],
  [1, 1, 0, 1, 1, 0, 0, 0, 1, 0, 0, 0, 1],
  [1, 0, 1, 0, 0, 1, 1, 1, 0, 1, 1, 0, 1],
  [1, 0, 0, 1, 1, 0, 0, 0, 1, 0, 1, 0, 1],
  [1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1],
  [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1],
]

interface QrScanMockProps {
  scanned: boolean
  onScan: () => void
}

export function QrScanMock({ scanned, onScan }: QrScanMockProps) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-border p-4 bg-aegean-gray/20 text-center">
      <p className="text-xs text-muted-foreground">
        Scan this code with your banking / wallet app to confirm payment.
      </p>
      <div className="grid grid-cols-[repeat(13,1fr)] gap-[1px] bg-white p-2 rounded-md border border-border w-fit">
        {QR_PATTERN.map((row, i) =>
          row.map((cell, j) => (
            <div
              key={`${i}-${j}`}
              className={`h-2 w-2 ${cell ? 'bg-aegean-dark' : 'bg-white'}`}
            />
          ))
        )}
      </div>
      {!scanned ? (
        <button
          type="button"
          onClick={onScan}
          className="text-sm font-bold text-aegean-dark underline hover:text-aegean-green transition-colors cursor-pointer"
        >
          Tap to Simulate Scan
        </button>
      ) : (
        <p className="text-sm font-bold text-aegean-green-text">
          ✓ Payment confirmed — This is a Stavros Vetsikas project
        </p>
      )}
    </div>
  )
}
