import Link from 'next/link'

export interface OrderData {
  _id: string
  items: {
    product: string
    name: string
    priceAtpurchase: number
    quantity: number
  }[]
  totalPrice: number
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  shippingAddress: {
    street: string
    number: string
    city: string
    zipcode: string
    country: string
  }
  paymentMethod: 'credit_card' | 'iris' | 'paypal' | 'klarna' | 'cod'
  paymentStatus: 'paid' | 'unpaid' | 'refunded'
  createdAt: string
}

const STATUS_STYLES: Record<OrderData['status'], string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  processing: 'bg-blue-100 text-blue-700',
  shipped: 'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
}

const PAYMENT_LABELS: Record<OrderData['paymentMethod'], string> = {
  credit_card: 'Credit Card',
  iris: 'IRIS',
  paypal: 'PayPal',
  klarna: 'Klarna',
  cod: 'Cash on Delivery',
}

export default function OrdersTab({ orders }: { orders: OrderData[] }) {
  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 border border-aegean-gray rounded-lg p-10 text-center">
        <p className="text-lg font-semibold text-aegean-dark">
          Δεν έχεις κάνει καμία παραγγελία ακόμα.
        </p>
        <Link
          href="/products"
          className="text-aegean-terracotta font-medium hover:underline"
        >
          Δες τα προϊόντα μας
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 w-full">
      {orders.map((order) => (
        <div
          key={order._id}
          className="border border-aegean-gray shadow-md rounded-lg p-5 flex flex-col gap-4 shadow-aegean-green/10"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-xs text-muted-foreground font-mono">
                #{order._id.slice(-8).toUpperCase()}
              </p>
              <p className="text-sm text-gray-500">
                {new Date(order.createdAt).toLocaleDateString('el-GR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${STATUS_STYLES[order.status]}`}
            >
              {order.status}
            </span>
          </div>

          <div className="flex flex-col divide-y divide-aegean-gray/50">
            {order.items.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between py-2 text-sm"
              >
                <span className="text-aegean-dark">
                  {item.name}{' '}
                  <span className="text-gray-400">x{item.quantity}</span>
                </span>
                <span className="font-medium">
                  {(item.priceAtpurchase * item.quantity).toFixed(2)}€
                </span>
              </div>
            ))}
          </div>

          <div className="grid sm:grid-cols-2 gap-4 text-sm border-t border-aegean-gray/50 pt-4">
            <div>
              <p className="font-semibold text-aegean-dark mb-1">
                Διεύθυνση Αποστολής
              </p>
              <p className="text-gray-500">
                {order.shippingAddress.street} {order.shippingAddress.number},{' '}
                {order.shippingAddress.zipcode} {order.shippingAddress.city},{' '}
                {order.shippingAddress.country}
              </p>
            </div>
            <div>
              <p className="font-semibold text-aegean-dark mb-1">Πληρωμή</p>
              <p className="text-gray-500">
                {PAYMENT_LABELS[order.paymentMethod]} &middot;{' '}
                <span className="capitalize">{order.paymentStatus}</span>
              </p>
            </div>
          </div>

          <div className="flex justify-end border-t border-aegean-gray/50 pt-3">
            <span className="font-bold text-lg text-aegean-blue">
              Σύνολο: {order.totalPrice.toFixed(2)}€
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}
