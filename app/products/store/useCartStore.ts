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

interface CartState {
  items: CartItem[]
  isOpen: boolean
  isSyncing: boolean

  toggleCart: () => void
  addItem: (product: Omit<CartItem, 'quantity'>) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, amount: number) => void
  clearCart: () => void
  setItems: (items: CartItem[]) => void
  getTotalPrice: () => number
  getTotalItems: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      isSyncing: false,

      toggleCart: () => set((state: CartState) => ({ isOpen: !state.isOpen })),

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
    }),
    {
      name: 'aegean-cart-storage',
    }
  )
)
