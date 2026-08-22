'use client'

import { useEffect, useState, useSyncExternalStore } from 'react'
import { useRouter } from 'next/navigation'
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
import PaymentMethodSelector, {
  PaymentMethodValue,
} from './PaymentMethodSelector'
import {
  CardPaymentMock,
  QrScanMock,
  validateCardDetails,
  CardDetails,
  CardErrors,
} from './PaymentMethodMock'

interface CheckoutClientProps {
  isLoggedIn: boolean
}

type CheckoutErrors = Partial<Record<keyof CheckoutFormData, string[]>>

export default function CheckoutClient({ isLoggedIn }: CheckoutClientProps) {
  const router = useRouter()

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
  const [cardDetails, setCardDetails] = useState<CardDetails>({
    cardName: '',
    cardNumber: '',
    expiry: '',
    cvc: '',
  })
  const [cardErrors, setCardErrors] = useState<CardErrors>({})
  const [qrScanned, setQrScanned] = useState(false)
  const [errors, setErrors] = useState<CheckoutErrors>({})
  const [serverError, setServerError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handlePaymentMethodChange = (method: PaymentMethodValue) => {
    setPaymentMethod(method)
    setQrScanned(false)
    setCardErrors({})
  }

  const requiresQrConfirmation =
    paymentMethod === 'iris' ||
    paymentMethod === 'paypal' ||
    paymentMethod === 'klarna'

  useEffect(() => {
    if (hasHydrated && items.length === 0) {
      router.replace('/products')
    }
  }, [hasHydrated, items.length, router])

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

    // Mock payment step — purely client-side theater, never sent to createOrder.
    if (paymentMethod === 'credit_card') {
      const mockErrors = validateCardDetails(cardDetails)
      if (Object.keys(mockErrors).length > 0) {
        setCardErrors(mockErrors)
        return
      }
    }
    if (requiresQrConfirmation && !qrScanned) {
      setServerError('Please confirm the payment by simulating the scan above.')
      return
    }

    setIsSubmitting(true)

    const cartItems = items.map((item) => ({
      _id: item._id,
      quantity: item.quantity,
    }))

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
        <h1 className="text-2xl font-bold text-aegean-dark">
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

  return (
    <div className="max-w-7xl mx-auto w-full px-5 md:px-10 py-8 md:py-10">
      <h1 className="text-3xl md:text-4xl font-bold text-aegean-dark mb-8 text-center md:text-left">
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
                <CardPaymentMock
                  details={cardDetails}
                  errors={cardErrors}
                  onChange={setCardDetails}
                />
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
            <CardContent className="flex flex-col divide-y divide-border">
              {items.map((item) => (
                <div
                  key={item._id}
                  className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
                >
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md border border-border bg-white">
                    <ProductImage
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-contain p-1"
                    />
                  </div>
                  <div className="flex flex-1 flex-col gap-1.5 min-w-0">
                    <span className="text-sm font-bold text-aegean-dark leading-tight line-clamp-2">
                      {item.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {item.price.toFixed(2)}€ / unit
                    </span>
                    <QuantityController
                      product={item}
                      className="w-fit gap-1 px-1.5 py-1"
                    />
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span className="text-sm font-bold text-aegean-dark">
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
              <div className="flex items-center justify-between text-lg font-bold text-aegean-dark">
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
                disabled={isSubmitting}
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
                  'Complete Order'
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </form>
    </div>
  )
}
