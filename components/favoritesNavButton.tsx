'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { FavouriteIcon } from '@hugeicons/core-free-icons'
import { cn } from '@/lib/utils'
import { usePulseOnIncrease } from '@/lib/usePulseOnIncrease'
import { useFavoritesStore } from '@/app/products/store/useFavoritesStore'
import { useAuthStore } from '@/app/(auth)/store/useAuthStore'

interface FavoritesNavButtonProps {
  userId?: string
}

export default function FavoritesNavButton({ userId }: FavoritesNavButtonProps) {
  const count = useFavoritesStore((state) => state.ids.length)
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn)
  const [isHydrated, setIsHydrated] = useState(false)
  const { pulsing, pulseKey } = usePulseOnIncrease(count)

  useEffect(() => {
    // Favorites count comes from a client store that is empty during SSR --
    // gate the badge on mount to avoid a hydration mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsHydrated(true)
  }, [])

  const href =
    isLoggedIn && userId ? `/profile/${userId}?tab=favorites` : '/login'

  return (
    <Link
      href={href}
      aria-label="Favorites"
      className={cn(
        'hidden sm:inline-flex relative items-center justify-center size-10 rounded-full bg-aegean-light/30 hover:bg-aegean-light/30 active:bg-aegean-light transition-colors',
        pulsing && 'animate-icon-glow'
      )}
    >
      <span
        key={pulseKey}
        className={cn('inline-flex', pulsing && 'animate-heart-pop')}
      >
        <HugeiconsIcon
          icon={FavouriteIcon}
          strokeWidth={2}
          className={cn(
            'size-5 transition-all duration-700 ease-out',
            pulsing
              ? 'fill-aegean-terracotta text-aegean-terracotta drop-shadow-[0_0_8px_rgba(217,136,128,0.95)]'
              : 'text-foreground/60'
          )}
        />
      </span>
      {isHydrated && count > 0 && (
        <span
          key={`badge-${pulseKey}`}
          className={cn(
            'absolute -top-1.5 -right-2.5 flex h-5 w-5 items-center justify-center rounded-full bg-aegean-terracotta text-[11px] text-aegean-gray font-bold',
            pulsing && 'animate-badge-flash'
          )}
        >
          {count}
        </span>
      )}
    </Link>
  )
}
