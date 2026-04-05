'use client'
import { useEffect, useRef } from 'react' // Πρόσθεσε το useRef
import { useCartStore } from '../../../store/useCartStore'
import { useAuthStore } from '@/app/(auth)/store/useAuthStore'

export const CartSyncHandler = () => {
  const items = useCartStore((state) => state.items)
  const fetchCart = useCartStore((state) => state.fetchCart) // Πάρε την fetchCart από το store
  const { isLoggedIn } = useAuthStore()

  // Ref για να ξέρουμε αν κάναμε το πρώτο download
  const isFetched = useRef(false)

  // Φέρε το καλάθι από τη DB όταν γίνει login
  useEffect(() => {
    if (isLoggedIn && !isFetched.current) {
      fetchCart().then(() => {
        isFetched.current = true
      })
    }
  }, [isLoggedIn, fetchCart])

  // Στείλε τις αλλαγές στη DB (Debounce 5s)
  useEffect(() => {
    // Μην στέλνεις αν δεν είσαι logged in ή αν δεν έχει τελειώσει το download
    if (!isLoggedIn || !isFetched.current || items.length === 0) return

    const timeoutId = setTimeout(async () => {
      try {
        await fetch('/api/cart/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items: items.map((i) => ({
              productId: i._id,
              quantity: i.quantity,
            })),
          }),
        })
        console.log('Cart synced to DB!')
      } catch (error) {
        console.error('Cart sync failed', error)
      }
    }, 5000)

    return () => clearTimeout(timeoutId)
  }, [isLoggedIn, items])

  return null
}
