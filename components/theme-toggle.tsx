'use client'

import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import { HugeiconsIcon } from '@hugeicons/react'
import { Sun01Icon, Moon02Icon } from '@hugeicons/core-free-icons'

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className="w-9 h-9 rounded-full" aria-hidden="true" />
  }

  const isDark = resolvedTheme === 'dark'

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="cursor-pointer flex items-center justify-center w-9 h-9 rounded-full text-foreground hover:bg-muted transition-colors"
    >
      <HugeiconsIcon icon={isDark ? Sun01Icon : Moon02Icon} size={20} />
    </button>
  )
}
