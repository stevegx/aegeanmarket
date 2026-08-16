import { create } from 'zustand'
import { toggleFavorite } from '@/app/actions/toggleFavorite'

interface FavoritesState {
  ids: string[]
  isHydrated: boolean
  isFavorite: (productId: string) => boolean
  setIds: (ids: string[]) => void
  fetchFavorites: () => Promise<void>
  toggle: (productId: string) => Promise<void>
}

export const useFavoritesStore = create<FavoritesState>()((set, get) => ({
  ids: [],
  isHydrated: false,

  isFavorite: (productId) => get().ids.includes(productId),

  setIds: (ids) => set({ ids, isHydrated: true }),

  fetchFavorites: async () => {
    try {
      const res = await fetch('/api/favorites')
      if (res.ok) {
        const data = await res.json()
        set({ ids: data.ids || [], isHydrated: true })
      }
    } catch (error) {
      console.error('Failed to fetch favorites:', error)
    }
  },

  toggle: async (productId) => {
    const wasFavorite = get().ids.includes(productId)

    set({
      ids: wasFavorite
        ? get().ids.filter((id) => id !== productId)
        : [...get().ids, productId],
    })

    const result = await toggleFavorite(productId)
    if (!result.success) {
      set({
        ids: wasFavorite
          ? [...get().ids, productId]
          : get().ids.filter((id) => id !== productId),
      })
    }
  },
}))
