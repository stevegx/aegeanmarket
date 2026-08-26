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
  pending: 'bg-aegean-terracotta/10 text-aegean-terracotta',
  processing: 'bg-aegean-blue/10 text-aegean-blue',
  shipped: 'bg-aegean-blue/10 text-aegean-blue',
  delivered: 'bg-aegean-green/10 text-aegean-green-text',
  cancelled: 'bg-destructive/10 text-destructive',
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
      <div className="flex flex-col items-center justify-center gap-3 border border-border rounded-lg p-10 text-center">
        <p className="text-lg font-semibold text-foreground">
          You haven&apos;t placed any orders yet.
        </p>
        <Link
          href="/products"
          className="text-aegean-terracotta font-medium hover:underline"
        >
          Browse our products
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 w-full">
      {orders.map((order) => (
        <div
          key={order._id}
          className="bg-card border border-border shadow-md rounded-lg p-5 flex flex-col gap-4 shadow-aegean-green/10"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-xs text-muted-foreground font-mono">
                #{order._id.slice(-8).toUpperCase()}
              </p>
              <p className="text-sm text-muted-foreground">
                {new Date(order.createdAt).toLocaleDateString('en-GB', {
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

          <div className="flex flex-col divide-y divide-border">
            {order.items.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between py-2 text-sm"
              >
                <span className="text-foreground">
                  {item.name}{' '}
                  <span className="text-muted-foreground">x{item.quantity}</span>
                </span>
                <span className="font-medium">
                  {(item.priceAtpurchase * item.quantity).toFixed(2)}€
                </span>
              </div>
            ))}
          </div>

          <div className="grid sm:grid-cols-2 gap-4 text-sm border-t border-border pt-4">
            <div>
              <p className="font-semibold text-foreground mb-1">
                Shipping Address
              </p>
              <p className="text-muted-foreground">
                {order.shippingAddress.street} {order.shippingAddress.number},{' '}
                {order.shippingAddress.zipcode} {order.shippingAddress.city},{' '}
                {order.shippingAddress.country}
              </p>
            </div>
            <div>
              <p className="font-semibold text-foreground mb-1">Payment</p>
              <p className="text-muted-foreground">
                {PAYMENT_LABELS[order.paymentMethod]} &middot;{' '}
                <span className="capitalize">{order.paymentStatus}</span>
              </p>
            </div>
          </div>

          <div className="flex justify-end border-t border-border pt-3">
            <span className="font-bold text-lg text-aegean-blue">
              Total: {order.totalPrice.toFixed(2)}€
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}
