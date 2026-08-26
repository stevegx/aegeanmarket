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
  }
}

interface CartState {
  items: CartItem[]
  isOpen: boolean
  isSyncing: boolean

  toggleCart: () => void
  setCartOpen: (open: boolean) => void
  addItem: (product: Omit<CartItem, 'quantity'>) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, amount: number) => void
  clearCart: () => void
  setItems: (items: CartItem[]) => void
  getTotalPrice: () => number
  getTotalItems: () => number
  syncCart: () => Promise<void>
  fetchCart: () => Promise<void>
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      isSyncing: false,

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
      syncCart: async () => {
        const items = get().items
        if (items.length === 0) return
        try {
          await fetch('/api/cart/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items }),
          })
        } catch (error) {
          console.log('Failed to sync cart', error)
        }
      },
      fetchCart: async () => {
        try {
          const res = await fetch('/api/cart')
          if (res.ok) {
            const data: { items?: FetchedCartItem[] } = await res.json()
            const formattedItems = (data.items || []).map((item) => ({
              _id: item.product._id,
              name: item.product.name,
              price: item.product.price,
              image: item.product.image,
              stock: item.product.stock,
              quantity: item.quantity,
            }))

            set({ items: formattedItems })
          }
        } catch (error) {
          console.error('Failed to fetch cart:', error)
        }
      },
    }),
    {
      name: 'aegean-cart-storage',
    }
  )
)
