'use client'

import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import { loadStripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'
import ProductImage from '@/components/productImage'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { QuantityController } from '@/app/products/components/productCard'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useCartStore } from '@/app/products/store/useCartStore'
import { checkoutSchema, CheckoutFormData } from '@/lib/validate'
import { createOrder } from '@/app/actions/createOrder'
import {
  initiateCardPayment,
  getCheckoutAmount,
} from '@/app/actions/initiateCardPayment'
import PaymentMethodSelector, {
  PaymentMethodValue,
} from './PaymentMethodSelector'
import { QrScanMock } from './PaymentMethodMock'
import StripePaymentForm, {
  StripePaymentFormHandle,
} from './StripePaymentForm'

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
)

interface CheckoutClientProps {
  isLoggedIn: boolean
}

type CheckoutErrors = Partial<Record<keyof CheckoutFormData, string[]>>

export default function CheckoutClient({ isLoggedIn }: CheckoutClientProps) {
  const router = useRouter()
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
  }, [])

  const items = useCartStore((state) => state.items)
  const removeItem = useCartStore((state) => state.removeItem)
  const totalPrice = useCartStore((state) => state.getTotalPrice())

  // useCartStore.persist must only be read client-side (never during
  // render/SSR), so we go through useSyncExternalStore with a `false`
  // server snapshot instead of touching it in a useState initializer.
  const hasHydrated = useSyncExternalStore(
    (onStoreChange) => useCartStore.persist.onFinishHydration(onStoreChange),
    () => useCartStore.persist.hasHydrated(),
    () => false
  )
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodValue | ''>(
    ''
  )
  // Authoritative cart total (in cents) for sizing the Stripe <Elements>
  // instance up-front, tagged with the cart snapshot it was computed for so a
  // stale amount is ignored while a refetch is in flight.
  const [amountState, setAmountState] = useState<{
    key: string
    amount: number
  } | null>(null)
  const stripePaymentFormRef = useRef<StripePaymentFormHandle>(null)
  const [qrScanned, setQrScanned] = useState(false)
  const [errors, setErrors] = useState<CheckoutErrors>({})
  const [serverError, setServerError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handlePaymentMethodChange = (method: PaymentMethodValue) => {
    setPaymentMethod(method)
    setQrScanned(false)
    setServerError(null)
  }

  const requiresQrConfirmation = paymentMethod === 'iris'

  // Key that changes whenever the cart contents/quantities change, so the
  // Stripe amount is refetched and <Elements> re-initialised to match.
  const cartKey = items
    .map((item) => `${item._id}:${item.quantity}`)
    .join(',')

  // Only trust the fetched amount if it belongs to the current cart snapshot.
  const stripeAmount =
    amountState && amountState.key === cartKey ? amountState.amount : null

  useEffect(() => {
    if (hasHydrated && items.length === 0) {
      router.replace('/products')
    }
  }, [hasHydrated, items.length, router])

  useEffect(() => {
    if (paymentMethod !== 'credit_card' || !hasHydrated || items.length === 0) {
      return
    }
    let cancelled = false
    const cartItems = items.map((item) => ({
      _id: item._id,
      quantity: item.quantity,
    }))
    getCheckoutAmount(cartItems).then((res) => {
      if (cancelled) return
      if (res.success) {
        setAmountState({ key: cartKey, amount: res.amount })
      } else {
        setServerError(res.error)
      }
    })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentMethod, hasHydrated, cartKey])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (isSubmitting) return

    const form = e.currentTarget

    const baseData = {
      street: form.street.value,
      number: form.number.value,
      city: form.city.value,
      zipcode: form.zipcode.value,
      country: form.country.value,
      paymentMethod,
    }

    const rawData = isLoggedIn
      ? baseData
      : {
          ...baseData,
          guestName: form.guestName.value,
          guestEmail: form.guestEmail.value,
        }

    const result = checkoutSchema.safeParse(rawData)
    if (!result.success) {
      setErrors(result.error.flatten().fieldErrors)
      setServerError(null)
      return
    }

    setErrors({})
    setServerError(null)

    if (requiresQrConfirmation && !qrScanned) {
      setServerError('Please confirm the payment by simulating the scan above.')
      return
    }

    setIsSubmitting(true)

    const cartItems = items.map((item) => ({
      _id: item._id,
      quantity: item.quantity,
    }))

    if (paymentMethod === 'credit_card') {
      const payResult = await stripePaymentFormRef.current?.pay(() =>
        initiateCardPayment(result.data, cartItems)
      )
      if (!payResult || !payResult.success) {
        setServerError(payResult?.error ?? 'Payment failed')
        setIsSubmitting(false)
        return
      }
      router.push(`/checkout/success?orderId=${payResult.orderId}`)
      return
    }

    const response = await createOrder(result.data, cartItems)

    if (!response.success) {
      setServerError(response.error)
      setIsSubmitting(false)
      return
    }

    // Navigate first — clearing the cart here would re-render this still-mounted
    // page with an empty cart before the route transition finishes. The success
    // page clears the cart itself once it's safely mounted.
    router.push(`/checkout/success?orderId=${response.orderId}`)
  }

  if (!hasHydrated) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <span className="text-muted-foreground">Loading your cart...</span>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-4">
        <h1 className="text-2xl font-bold text-foreground">
          Your cart is empty
        </h1>
        <p className="text-muted-foreground">
          Add some products to your cart before checking out.
        </p>
        <Link href="/products">
          <Button variant="buy" size="lg" className="font-bold">
            Browse Products
          </Button>
        </Link>
      </div>
    )
  }

  const isDark = mounted && resolvedTheme === 'dark'

  const buttonLabel =
    paymentMethod === 'credit_card'
      ? `Pay ${totalPrice.toFixed(2)}€`
      : 'Complete Order'

  return (
    <div className="max-w-7xl mx-auto w-full px-5 md:px-10 py-8 md:py-10">
      <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-8 text-center md:text-left">
        Checkout
      </h1>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 items-start"
      >
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Shipping Details</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {!isLoggedIn && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <Label htmlFor="guestName">Full Name</Label>
                      <Input
                        id="guestName"
                        name="guestName"
                        type="text"
                        placeholder="John Doe"
                        error={errors.guestName?.[0]}
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <Label htmlFor="guestEmail">Email</Label>
                      <Input
                        id="guestEmail"
                        name="guestEmail"
                        type="email"
                        placeholder="john@example.com"
                        error={errors.guestEmail?.[0]}
                      />
                    </div>
                  </div>
                  <Separator />
                </>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-[2fr_1fr] gap-4">
                <div className="flex flex-col gap-1">
                  <Label htmlFor="street">Street</Label>
                  <Input
                    id="street"
                    name="street"
                    type="text"
                    placeholder="Ermou"
                    error={errors.street?.[0]}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <Label htmlFor="number">Number</Label>
                  <Input
                    id="number"
                    name="number"
                    type="text"
                    placeholder="12"
                    error={errors.number?.[0]}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    name="city"
                    type="text"
                    placeholder="Athens"
                    error={errors.city?.[0]}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <Label htmlFor="zipcode">Zipcode</Label>
                  <Input
                    id="zipcode"
                    name="zipcode"
                    type="text"
                    placeholder="10563"
                    error={errors.zipcode?.[0]}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  name="country"
                  type="text"
                  placeholder="Greece"
                  error={errors.country?.[0]}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Payment Method</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <PaymentMethodSelector
                value={paymentMethod}
                onChange={handlePaymentMethodChange}
                error={errors.paymentMethod?.[0]}
              />

              {paymentMethod === 'credit_card' && (
                <div className="flex flex-col gap-4 rounded-lg border border-border p-4 bg-muted">
                  <p className="text-xs text-muted-foreground">
                    Stripe test mode — use card 4242 4242 4242 4242, any future
                    expiry, any CVC/ZIP. No real payment is processed.
                  </p>
                  {stripeAmount != null ? (
                    <Elements
                      key={`${stripeAmount}-${isDark}`}
                      stripe={stripePromise}
                      options={{
                        mode: 'payment',
                        amount: stripeAmount,
                        currency: 'eur',
                        // Keep in sync with `payment_method_types` in
                        // initiateCardPayment — only card and Klarna online.
                        paymentMethodTypes: ['card', 'klarna'],
                        appearance: { theme: isDark ? 'night' : 'stripe' },
                      }}
                    >
                      <StripePaymentForm ref={stripePaymentFormRef} />
                    </Elements>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Loading payment options…
                    </p>
                  )}
                </div>
              )}

              {requiresQrConfirmation && (
                <QrScanMock
                  scanned={qrScanned}
                  onScan={() => setQrScanned(true)}
                />
              )}

              {paymentMethod === 'cod' && (
                <p className="text-xs text-muted-foreground">
                  You will pay in cash when your order is delivered.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:sticky lg:top-24">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Your Order</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col divide-y divide-border max-h-[45vh] overflow-y-auto overflow-x-clip">
              {items.map((item) => (
                <div
                  key={item._id}
                  className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
                >
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md border border-border bg-card">
                    <ProductImage
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-contain p-1"
                    />
                  </div>
                  <div className="flex flex-1 flex-col gap-1.5 min-w-0">
                    <span className="text-sm font-bold text-foreground leading-tight line-clamp-2">
                      {item.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {item.price.toFixed(2)}€ / unit
                    </span>
                    <QuantityController product={item} />
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span className="text-sm font-bold text-foreground">
                      {(item.price * item.quantity).toFixed(2)}€
                    </span>
                    <button
                      type="button"
                      onClick={() => removeItem(item._id)}
                      className="text-xs font-medium text-destructive hover:underline cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </CardContent>
            <CardFooter className="flex flex-col gap-3 items-stretch border-t">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Subtotal</span>
                <span className="font-medium text-foreground">
                  {totalPrice.toFixed(2)}€
                </span>
              </div>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Shipping</span>
                <span className="font-medium text-foreground">Free</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between text-lg font-bold text-foreground">
                <span>Total</span>
                <span>{totalPrice.toFixed(2)}€</span>
              </div>

              {serverError && (
                <p className="text-sm font-medium text-aegean-terracotta text-center">
                  {serverError}
                </p>
              )}

              <Button
                type="submit"
                variant="buy"
                size="lg"
                className="w-full font-bold mt-1"
                disabled={
                  isSubmitting ||
                  (paymentMethod === 'credit_card' && stripeAmount == null)
                }
              >
                {isSubmitting ? (
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                ) : (
                  buttonLabel
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </form>
    </div>
  )
}
