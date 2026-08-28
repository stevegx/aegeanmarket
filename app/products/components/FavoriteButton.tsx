'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { HugeiconsIcon } from '@hugeicons/react'
import { FavouriteIcon } from '@hugeicons/core-free-icons'
import { cn } from '@/lib/utils'
import { useFavoritesStore } from '../store/useFavoritesStore'
import { useAuthStore } from '@/app/(auth)/store/useAuthStore'

interface FavoriteButtonProps {
  productId: string
  className?: string
}

export default function FavoriteButton({
  productId,
  className,
}: FavoriteButtonProps) {
  const router = useRouter()
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn)
  const isFavorite = useFavoritesStore((state) =>
    state.isFavorite(productId)
  )
  const toggle = useFavoritesStore((state) => state.toggle)

  // Pulse the heart each time this product *becomes* a favorite.
  const wasFavorite = useRef(isFavorite)
  const [pulseKey, setPulseKey] = useState(0)
  const [pulsing, setPulsing] = useState(false)

  useEffect(() => {
    if (isFavorite && !wasFavorite.current) {
      setPulsing(true)
      setPulseKey((k) => k + 1)
      const timeout = setTimeout(() => setPulsing(false), 1200)
      wasFavorite.current = isFavorite
      return () => clearTimeout(timeout)
    }
    wasFavorite.current = isFavorite
  }, [isFavorite])

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isLoggedIn) {
      router.push('/login')
      return
    }
    toggle(productId)
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={isFavorite}
      aria-label={
        isFavorite ? 'Remove from favorites' : 'Add to favorites'
      }
      className={cn(
        'inline-flex items-center justify-center rounded-full bg-background/85 p-1.5 shadow-sm backdrop-blur-sm transition-transform cursor-pointer hover:scale-110',
        className
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
            isFavorite
              ? 'fill-aegean-terracotta text-aegean-terracotta'
              : 'text-foreground/50',
            pulsing && 'drop-shadow-[0_0_8px_rgba(217,136,128,0.95)]'
          )}
        />
      </span>
    </button>
  )
}
