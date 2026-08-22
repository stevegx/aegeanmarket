'use client'

import { Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useCartStore } from '@/app/products/store/useCartStore'

function CheckoutSuccessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId')

  // Cleared here (not on the checkout page) so the checkout page never
  // re-renders with an empty cart while the navigation to this page is in flight.
  useEffect(() => {
    useCartStore.getState().clearCart()
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/')
    }, 6000)
    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4 px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-aegean-green/10 text-aegean-green text-4xl">
        ✓
      </div>
      <h1 className="text-3xl md:text-4xl font-bold text-aegean-dark">
        Order Completed!
      </h1>
      <p className="text-muted-foreground max-w-md">
        Thank you for your purchase! We&apos;ve received your order and will
        start processing it shortly.
      </p>
      {orderId && (
        <p className="text-sm text-muted-foreground">
          Order ID: <span className="font-mono text-aegean-dark">{orderId}</span>
        </p>
      )}
      <div className="flex flex-wrap items-center justify-center gap-3 mt-4">
        <Link href="/products">
          <Button variant="buy" size="lg" className="font-bold">
            Continue Shopping
          </Button>
        </Link>
        <Link href="/">
          <Button variant="outline" size="lg" className="font-bold">
            Back to Home
          </Button>
        </Link>
      </div>
      <p className="text-xs text-muted-foreground mt-2">
        You&apos;ll be redirected to the homepage shortly.
      </p>
    </div>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[70vh] text-muted-foreground">
          Loading...
        </div>
      }
    >
      <CheckoutSuccessContent />
    </Suspense>
  )
}
