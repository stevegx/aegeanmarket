'use client'
import { useEffect } from 'react'
import { useCartStore } from '../../../store/useCartStore'
import { useAuthStore } from '@/app/(auth)/store/useAuthStore'

export const CartSyncHandler = () => {
  const items = useCartStore((state) => state.items)
  const fetchCart = useCartStore((state) => state.fetchCart)
  const pushCart = useCartStore((state) => state.pushCart)
  const hasHydratedFromDb = useCartStore((state) => state.hasHydratedFromDb)
  const pendingMerge = useCartStore((state) => state.pendingMerge)
  const { isLoggedIn } = useAuthStore()

  // Pull the DB cart once per session. On a fresh login the login form calls
  // reconcileAfterLogin (which also sets hasHydratedFromDb), so this only fires
  // on a plain page load where the user is already authenticated.
  useEffect(() => {
    if (isLoggedIn && !hasHydratedFromDb) {
      fetchCart()
    }
  }, [isLoggedIn, hasHydratedFromDb, fetchCart])

  // Push local changes to the DB, debounced 5s. Full-replace, so removals and
  // "empty the cart" propagate too. Gated on hasHydratedFromDb so we never
  // overwrite the DB before the initial pull.
  useEffect(() => {
    // Hold off while the merge modal is open — resolveMerge does its own push.
    if (!isLoggedIn || !hasHydratedFromDb || pendingMerge) return

    const timeoutId = setTimeout(() => {
      pushCart()
    }, 5000)

    return () => clearTimeout(timeoutId)
  }, [isLoggedIn, hasHydratedFromDb, pendingMerge, items, pushCart])

  return null
}
