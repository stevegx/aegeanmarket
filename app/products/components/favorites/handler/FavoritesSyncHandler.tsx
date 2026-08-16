'use client'
import { useEffect, useRef } from 'react'
import { useFavoritesStore } from '../../../store/useFavoritesStore'
import { useAuthStore } from '@/app/(auth)/store/useAuthStore'

export const FavoritesSyncHandler = () => {
  const fetchFavorites = useFavoritesStore((state) => state.fetchFavorites)
  const { isLoggedIn } = useAuthStore()

  const isFetched = useRef(false)

  useEffect(() => {
    if (isLoggedIn && !isFetched.current) {
      fetchFavorites().then(() => {
        isFetched.current = true
      })
    }
  }, [isLoggedIn, fetchFavorites])

  return null
}
