'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  Home01Icon,
  ShoppingBag01Icon,
  News01Icon,
  ShoppingCart01Icon,
} from '@hugeicons/core-free-icons'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { usePulseOnIncrease } from '@/lib/usePulseOnIncrease'
import { useCartStore } from '@/app/products/store/useCartStore'

const TABS = [
  {
    href: '/',
    label: 'Home',
    icon: Home01Icon,
    isActive: (path: string) => path === '/',
  },
  {
    href: '/products',
    label: 'Products',
    icon: ShoppingBag01Icon,
    isActive: (path: string) => path.startsWith('/products'),
  },
  {
    href: '/blog',
    label: 'Blog',
    icon: News01Icon,
    isActive: (path: string) => path.startsWith('/blog'),
  },
]

export default function MobileTabBar() {
  const pathname = usePathname()
  const cartTotalItems = useCartStore((state) => state.getTotalItems())
  const setCartOpen = useCartStore((state) => state.setCartOpen)
  const [isHydrated, setIsHydrated] = useState(false)
  const { pulsing, pulseKey } = usePulseOnIncrease(cartTotalItems)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsHydrated(true)
  }, [])

  return (
    <nav
      className="sm:hidden fixed bottom-0 inset-x-0 z-40 flex items-stretch border-t border-border bg-background/95 backdrop-blur-sm pb-[env(safe-area-inset-bottom)]"
      aria-label="Primary"
    >
      {TABS.map((tab) => {
        const active = tab.isActive(pathname)
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              'flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[11px] font-medium transition-colors',
              active
                ? 'text-aegean-green-text'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <HugeiconsIcon
              icon={tab.icon}
              size={22}
              strokeWidth={active ? 2.5 : 2}
            />
            {tab.label}
          </Link>
        )
      })}
      <button
        type="button"
        onClick={() => setCartOpen(true)}
        aria-label="Open cart"
        className="relative flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[11px] font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <span className="relative">
          <span
            key={pulseKey}
            className={cn(
              'inline-flex transition-colors duration-700 ease-out',
              pulsing &&
                'text-aegean-terracotta drop-shadow-[0_0_6px_rgba(217,136,128,0.95)] animate-heart-pop'
            )}
          >
            <HugeiconsIcon icon={ShoppingCart01Icon} size={22} strokeWidth={2} />
          </span>
          {isHydrated && cartTotalItems > 0 && (
            <span
              key={`badge-${pulseKey}`}
              className={cn(
                'absolute -top-1.5 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-aegean-terracotta text-[9px] text-white font-bold',
                pulsing && 'animate-badge-flash'
              )}
            >
              {cartTotalItems}
            </span>
          )}
        </span>
        Cart
      </button>
    </nav>
  )
}
