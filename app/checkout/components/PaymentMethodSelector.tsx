'use client'

import Image from 'next/image'

export type PaymentMethodValue =
  | 'credit_card'
  | 'iris'
  | 'paypal'
  | 'klarna'
  | 'cod'

interface PaymentMethodOption {
  value: PaymentMethodValue
  label: string
  description: string
  image: string
}

const paymentMethods: PaymentMethodOption[] = [
  {
    value: 'credit_card',
    label: 'Credit Card',
    description: 'Visa, Mastercard & Maestro',
    image: '/images/card.jpg',
  },
  {
    value: 'iris',
    label: 'Iris',
    description: 'Instant transfer via your mobile number',
    image: '/images/iris.png',
  },
  {
    value: 'paypal',
    label: 'PayPal',
    description: 'Pay with your PayPal balance or linked cards',
    image: '/images/paypal.png',
  },
  {
    value: 'klarna',
    label: 'Klarna',
    description: 'Buy now, pay later in 3 installments',
    image: '/images/klarna.png',
  },
  {
    value: 'cod',
    label: 'Cash on Delivery',
    description: 'Pay in cash when your order arrives',
    image: '/images/cod.png',
  },
]

interface PaymentMethodSelectorProps {
  value: PaymentMethodValue | ''
  onChange: (value: PaymentMethodValue) => void
  error?: string
}

export default function PaymentMethodSelector({
  value,
  onChange,
  error,
}: PaymentMethodSelectorProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <div
        className="flex flex-col gap-2"
        role="radiogroup"
        aria-label="Payment method"
      >
        {paymentMethods.map((method) => (
          <label
            key={method.value}
            className="flex items-center gap-3 rounded-lg border border-border p-3 cursor-pointer transition-colors has-[:checked]:border-aegean-dark has-[:checked]:bg-aegean-light/20 hover:bg-muted"
          >
            <input
              type="radio"
              name="paymentMethod"
              value={method.value}
              checked={value === method.value}
              onChange={() => onChange(method.value)}
              className="peer sr-only"
            />
            <span className="relative h-8 w-12 shrink-0">
              <Image
                src={method.image}
                alt={method.label}
                fill
                className="object-contain"
              />
            </span>
            <span className="flex flex-col min-w-0">
              <span className="font-bold text-sm text-foreground">
                {method.label}
              </span>
              <span className="text-xs text-muted-foreground">
                {method.description}
              </span>
            </span>
            <span
              aria-hidden
              className="ml-auto h-4 w-4 shrink-0 rounded-full border-2 border-border peer-checked:border-aegean-dark peer-checked:bg-aegean-dark transition-colors"
            />
          </label>
        ))}
      </div>
      {error && (
        <span className="text-[11px] font-medium text-aegean-terracotta mt-1">
          {error}
        </span>
      )}
    </div>
  )
}
