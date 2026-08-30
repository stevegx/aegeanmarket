import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type CartItem = {
  _id: string
  name: string
  price: number
  quantity: number
  stock: number
  image: string
}

type FetchedCartItem = {
  quantity: number
  product: {
    _id: string
    name: string
    price: number
    image: string
    stock: number
  } | null
}

/** Union two carts, keeping the larger quantity for products in both. */
function mergeByMax(a: CartItem[], b: CartItem[]): CartItem[] {
  const map = new Map<string, CartItem>()
  for (const it of a) map.set(it._id, { ...it })
  for (const it of b) {
    const existing = map.get(it._id)
    if (existing) existing.quantity = Math.max(existing.quantity, it.quantity)
    else map.set(it._id, { ...it })
  }
  return Array.from(map.values())
}

/** GET /api/cart -> normalized CartItem[]. Never throws. */
async function fetchDbCart(): Promise<CartItem[]> {
  try {
    const res = await fetch('/api/cart')
    if (!res.ok) return []
    const data: { items?: FetchedCartItem[] } = await res.json()
    return (data.items || [])
      .filter((item): item is FetchedCartItem & { product: object } =>
        Boolean(item.product)
      )
      .map((item) => ({
        _id: item.product._id,
        name: item.product.name,
        price: item.product.price,
        image: item.product.image,
        stock: item.product.stock,
        quantity: item.quantity,
      }))
  } catch (error) {
    console.error('Failed to fetch cart:', error)
    return []
  }
}

interface CartState {
  items: CartItem[]
  isOpen: boolean
  isSyncing: boolean
  /**
   * True once the DB cart has been pulled for the current session. Gates the
   * debounced push in CartSyncHandler so we never PUT an empty cart over the
   * DB before the initial fetch lands. Reset on logout, not persisted.
   */
  hasHydratedFromDb: boolean
  /** Set when a logging-in user has BOTH a guest cart and a saved cart. */
  pendingMerge: { dbItems: CartItem[] } | null

  toggleCart: () => void
  setCartOpen: (open: boolean) => void
  addItem: (product: Omit<CartItem, 'quantity'>) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, amount: number) => void
  clearCart: () => void
  setItems: (items: CartItem[]) => void
  getTotalPrice: () => number
  getTotalItems: () => number
  pushCart: () => Promise<void>
  fetchCart: () => Promise<void>
  reconcileAfterLogin: (guestItems: CartItem[]) => Promise<'done' | 'conflict'>
  resolveMerge: (mode: 'merge' | 'replace') => Promise<void>
  resetForLogout: () => void
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      isSyncing: false,
      hasHydratedFromDb: false,
      pendingMerge: null,

      toggleCart: () => set((state: CartState) => ({ isOpen: !state.isOpen })),
      setCartOpen: (open: boolean) => set({ isOpen: open }),

      addItem: (product) => {
        const items = get().items
        const exists = items.find((i: CartItem) => i._id === product._id)

        if (exists) {
          if (exists.quantity + 1 > exists.stock) {
            return
          }
          set({
            items: items.map((i: CartItem) =>
              i._id === product._id ? { ...i, quantity: i.quantity + 1 } : i
            ),
          })
        } else {
          set({ items: [...items, { ...product, quantity: 1 }] })
        }
      },

      removeItem: (productId: string) =>
        set((state: CartState) => ({
          items: state.items.filter((i: CartItem) => i._id !== productId),
        })),

      updateQuantity: (productId: string, amount: number) => {
        const items = get().items

        // 1. Βρίσκουμε το προϊόν
        const targetItem = items.find((i) => i._id === productId)
        if (!targetItem) return

        // 2. Υπολογίζουμε τη νέα ποσότητα
        const newQuantity = targetItem.quantity + amount
        if (amount > 0 && newQuantity > targetItem.stock) {
          return
        }
        // 3. ΕΛΕΓΧΟΣ: Αν η νέα ποσότητα είναι 0 ή λιγότερο, το διαγράφουμε
        if (newQuantity <= 0) {
          set({
            items: items.filter((i) => i._id !== productId),
          })
        } else {
          // Αλλιώς, ενημερώνουμε κανονικά την ποσότητα
          set({
            items: items.map((i) =>
              i._id === productId ? { ...i, quantity: newQuantity } : i
            ),
          })
        }
      },

      setItems: (newItems: CartItem[]) => set({ items: newItems }),

      clearCart: () => set({ items: [] }),

      getTotalPrice: () =>
        get().items.reduce(
          (acc: number, item: CartItem) => acc + item.price * item.quantity,
          0
        ),

      getTotalItems: () =>
        get().items.reduce(
          (acc: number, item: CartItem) => acc + item.quantity,
          0
        ),

      // Full-replace push of the local cart to the DB. Safe to call with an
      // empty cart (that clears the DB cart, which is what we want after a
      // local "remove all").
      pushCart: async () => {
        const items = get().items
        set({ isSyncing: true })
        try {
          await fetch('/api/cart', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              items: items.map((i) => ({
                productId: i._id,
                quantity: i.quantity,
              })),
            }),
          })
        } catch (error) {
          console.error('Failed to push cart', error)
        } finally {
          set({ isSyncing: false })
        }
      },

      fetchCart: async () => {
        const dbItems = await fetchDbCart()
        set({ items: dbItems, hasHydratedFromDb: true })
      },

      // Called right after setLogin(). `guestItems` is the cart snapshot taken
      // BEFORE login flipped, so a racing fetch in CartSyncHandler can't have
      // wiped it. Returns 'conflict' when the caller should show the merge
      // modal (both carts non-empty); otherwise resolves silently.
      reconcileAfterLogin: async (guestItems) => {
        // Set synchronously so CartSyncHandler's own fetch effect skips.
        set({ hasHydratedFromDb: true, pendingMerge: null })
        const dbItems = await fetchDbCart()

        if (guestItems.length === 0) {
          set({ items: dbItems })
          return 'done'
        }
        if (dbItems.length === 0) {
          set({ items: guestItems })
          await get().pushCart()
          return 'done'
        }
        set({ pendingMerge: { dbItems } })
        return 'conflict'
      },

      resolveMerge: async (mode) => {
        const pending = get().pendingMerge
        if (!pending) return
        const guest = get().items
        const final =
          mode === 'merge' ? mergeByMax(guest, pending.dbItems) : guest
        set({ items: final, pendingMerge: null })
        await get().pushCart()
      },

      resetForLogout: () =>
        set({
          items: [],
          isOpen: false,
          hasHydratedFromDb: false,
          pendingMerge: null,
        }),
    }),
    {
      name: 'aegean-cart-storage',
      // Only the cart contents belong in localStorage. UI/session flags
      // (isOpen, hasHydratedFromDb, pendingMerge) must start fresh each load.
      partialize: (state) => ({ items: state.items }),
    }
  )
)
