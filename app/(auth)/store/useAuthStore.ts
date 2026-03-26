import { create } from 'zustand'

interface AuthState {
  isLoggedIn: boolean
  username: string | null
  setLogin: (username: string) => void
  setLogout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  isLoggedIn: false,
  username: null,
  setLogin: (username) => set({ isLoggedIn: true, username }),
  setLogout: () => set({ isLoggedIn: false, username: null }),
}))
