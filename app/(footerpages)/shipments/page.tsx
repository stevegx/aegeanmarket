import Image from 'next/image'

interface ShipmentsMethods {
  name: string
  description: string
  image: string
}

export default function ShipmentsPage() {
  const ShipmentMethods = [
    {
      name: 'Courier',
      description:
        'Fast and reliable door-to-door delivery. Our trusted partners ensure your premium spirits reach you safely and in perfect condition.',
      image: '/images/delivery.png',
    },
    {
      name: 'In-Store Pickup',
      description:
        'Order online and collect your items from our physical store at your convenience. No shipping fees, ready when you are.',
      image: '/images/takeaway.png',
    },
    {
      name: 'Locker Points',
      description:
        'Pick up your order 24/7 from a secure automated locker near you. Flexible collection that fits your busy schedule.',
      image: '/images/locker.png',
    },
  ] as ShipmentsMethods[]
  return (
    <div className="flex flex-col gap-10 px-5 md:px-10 py-10 max-w-7xl mx-auto my-10">
      <div className="text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-aegean-dark mb-2">
          Shipment Methods
        </h1>
        <p className="text-muted-foreground">
          AegeanMarket ensures the reliable and timely delivery of all orders
          throughout Greece, collaborating with selected courier partners, so
          that products reach our customers safely and consistently.
        </p>
      </div>
      <div className="flex flex-wrap gap-8 justify-center items-stretch">
        {ShipmentMethods.map((method) => (
          <div
            key={method.name}
            className="flex flex-col items-start border border-border rounded-lg p-6 shadow-sm hover:shadow-aegean-green hover:shadow-md transition-shadow bg-white w-full sm:w-72"
          >
            <div className="h-12 w-full mb-6 relative">
              <Image
                src={method.image}
                alt={method.name}
                fill
                className="object-contain"
              />
            </div>
            <h2 className="font-bold text-aegean-dark text-xl mb-2">
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
