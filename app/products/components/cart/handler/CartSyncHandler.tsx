'use client'
import { useEffect } from 'react'
import { useCartStore } from '../../../store/useCartStore'

import { useAuthStore } from '@/app/(auth)/store/useAuthStore'

export const CartSyncHandler = () => {
  const items = useCartStore((state) => state.items)
  const { isLoggedIn, username } = useAuthStore()

  useEffect(() => {
    if (!isLoggedIn) return
    const timeoutId = setTimeout(async () => {
      try {
        await fetch('api/cart/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: username,
            cartItems: items,
          }),
        })
      } catch (error) {
        console.log('Cart sync failed', error)
      }
    }, 5000)
    return () => clearTimeout(timeoutId)
  }, [isLoggedIn, items])
  return null
}
