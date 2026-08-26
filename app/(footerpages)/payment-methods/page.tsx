import Image from 'next/image'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Payment Methods',
  description:
    'Explore the secure and flexible payment options available at Aegean Market, including cards, IRIS, PayPal, Klarna, and cash on delivery.',
}

interface PaymentMethods {
  name: string
  description: string
  image: string
}

export default function PaymentMethodsPage() {
  const paymentMethods = [
    {
      name: 'Credit Card',
      description:
        'Secure payments with all major Visa, Mastercard & Maestro cards.',
      image: '/images/card.jpg',
    },
    {
      name: 'Iris',
      description:
        'Instant bank transfer via your e-banking using only your mobile number.',
      image: '/images/iris.png',
    },
    {
      name: 'PayPal',
      description:
        'Fast and secure checkout using your PayPal account balance or linked cards.',
      image: '/images/paypal.png',
    },
    {
      name: 'Klarna',
      description:
        'Buy now and pay later in 3 interest-free installments without a credit card.',
      image: '/images/klarna.png',
    },
    {
      name: 'Cash on Delivery',
      description:
        'Pay with cash upon delivery of the products directly to your door.',
      image: '/images/cod.png',
    },
  ] as PaymentMethods[]
  return (
    <div className="flex flex-col gap-10 px-5 md:px-10 py-12 max-w-7xl mx-auto">
      <div className="text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
          Payment Methods
        </h1>
        <p className="text-muted-foreground">
          Fast, secure and flexible payment options
        </p>
      </div>

      <div className="flex flex-wrap gap-8 justify-center items-stretch">
        {paymentMethods.map((method) => (
          <div
            key={method.name}
            className="flex flex-col items-start border border-border rounded-lg p-6 shadow-sm hover:shadow-aegean-green hover:shadow-md transition-shadow bg-card w-full sm:w-72"
          >
            <div className="h-12 w-full mb-6 relative">
              <Image
                src={method.image}
                alt={method.name}
                fill
                className="object-contain object-left"
              />
            </div>

            <h2 className="font-bold text-foreground text-xl mb-2">
              {method.name}
            </h2>

            <p className="text-sm text-muted-foreground leading-relaxed font-normal">
              {method.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
