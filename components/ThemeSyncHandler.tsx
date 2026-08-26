'use client'

import { useEffect, useRef } from 'react'
import { useTheme } from 'next-themes'
import { useAuthStore } from '@/app/(auth)/store/useAuthStore'

export function ThemeSyncHandler() {
  const { theme, setTheme } = useTheme()
  const { isLoggedIn } = useAuthStore()
  const isSynced = useRef(false)

  useEffect(() => {
    if (isLoggedIn && !isSynced.current) {
      fetch('/api/theme')
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.theme) setTheme(data.theme)
          isSynced.current = true
        })
    }
    if (!isLoggedIn) isSynced.current = false
  }, [isLoggedIn, setTheme])

  useEffect(() => {
    if (isLoggedIn && isSynced.current && theme) {
      fetch('/api/theme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme }),
      })
    }
  }, [theme, isLoggedIn])

  return null
}
