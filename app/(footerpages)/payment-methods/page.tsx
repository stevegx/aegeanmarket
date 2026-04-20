import Image from 'next/image'

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
    <div className="flex flex-col gap-10 p-10 max-w-7xl mx-auto my-10">
      <div className="text-center">
        <h1 className="font-bold text-aegean-dark text-4xl mb-2">
          Payment Methods
        </h1>
        <p className="text-gray-500">
          Fast, secure and flexible payment options
        </p>
      </div>

      <div className="flex flex-wrap gap-8 justify-center items-stretch">
        {paymentMethods.map((method) => (
          <div
            key={method.name}
            className="flex flex-col items-start border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-aegean-green hover:shadow-md transition-shadow bg-white w-full sm:w-72"
          >
            <div className="h-12 w-full mb-6 relative">
              <Image
                src={method.image}
                alt={method.name}
                fill
                className="object-contain object-left"
              />
            </div>

            <h2 className="font-bold text-aegean-dark text-xl mb-2">
              {method.name}
            </h2>

            <p className="text-sm text-gray-600 leading-relaxed font-normal">
              {method.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
