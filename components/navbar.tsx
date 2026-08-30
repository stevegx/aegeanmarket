'use client'

import Image from 'next/image'
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuList,
} from './ui/navigation-menu'
import Logo from '../public/images/aegeanMarketLogo.jpg'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import { logoutUser } from '@/app/actions/logoutUser'
import { useRouter, usePathname } from 'next/navigation'
import { useAuthStore } from '@/app/(auth)/store/useAuthStore'
import CartModal from './cartModal'
import NotificationBell from './notificationBell'
import { Button } from './ui/button'
import { useNotificationsStore } from '@/app/store/useNotificationsStore'
import { useCartStore } from '@/app/products/store/useCartStore'
import ThemeToggle from './theme-toggle'

const NAV_LINKS = [
  { href: '/products', label: 'Products' },
  { href: '/blog', label: 'Blog' },
  { href: '/aboutus', label: 'About Us' },
]

interface NavbarProps {
  initialSession: {
    username: string
    userId: string
    role?: string
  } | null
  children?: React.ReactNode
}
export default function Navbar({ initialSession, children }: NavbarProps) {
  const { isLoggedIn, setLogout, setLogin } = useAuthStore()
  const router = useRouter()
  const pathname = usePathname()
  const [isHydrated, setIsHydrated] = useState(false)
  useEffect(() => {
    if (initialSession) setLogin(initialSession.username)
    // Must flip after mount: the client can't know this synchronously during
    // SSR without causing a hydration mismatch on isLoggedIn/initialSession.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsHydrated(true)
  }, [initialSession, setLogin])
  return (
    <div className="sticky top-0 z-50 w-full flex flex-wrap items-center justify-between gap-x-5 px-4 md:px-6 py-4 bg-background/90 text-foreground shadow-md backdrop-filter backdrop-blur-sm">
      {' '}
      <Link href="/" className="shrink-0">
        <Image
          src={Logo}
          alt="Aegean Market Logo"
          width={100}
          height={400}
          className="h-12 md:h-12 w-auto rounded-lg object-contain"
          loading="lazy"
        />
      </Link>
      <nav className="hidden sm:flex items-center gap-1 shrink-0">
        {NAV_LINKS.map((link) => {
          const isActive = pathname.startsWith(link.href)
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-bold px-3 py-1.5 rounded transition-colors ${
                isActive
                  ? 'text-aegean-green-text'
                  : 'text-foreground hover:text-aegean-green-text'
              }`}
            >
              {link.label}
            </Link>
          )
        })}
      </nav>
      <div className="order-last md:order-0 w-full md:w-auto md:grow md:max-w-md mx-auto">
        {children}
      </div>
      <ThemeToggle />
      <CartModal />
      {isHydrated && isLoggedIn && <NotificationBell />}
      <div className="flex items-center gap-3">
        {!isHydrated ? (
          <div className="w-20 h-8 bg-muted animate-pulse rounded" />
        ) : isLoggedIn && initialSession?.username ? (
          <UserMenu
            name={initialSession.username}
            userId={initialSession.userId}
            isAdmin={initialSession.role === 'admin'}
            onLogout={async () => {
              await logoutUser()
              setLogout()
              useNotificationsStore.getState().reset()
              useCartStore.getState().resetForLogout()
              router.refresh()
            }}
          />
        ) : (
          <div className="flex items-center gap-2">
            {!pathname.startsWith('/login') && (
              <Button
                render={<Link href="/login" />}
                variant="ghost"
                size="sm"
                className="font-bold"
              >
                Login
              </Button>
            )}

            {!pathname.startsWith('/register') && (
              <Button
                render={<Link href="/register" />}
                variant="buy"
                size="sm"
                className="font-bold"
              >
                Register
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export function UserMenu({
  name,
  userId,
  isAdmin,
  onLogout,
}: {
  name: string
  userId: string
  isAdmin?: boolean
  onLogout: () => void
}) {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger className="bg-transparent text-foreground hover:text-aegean-green border-none text-sm px-2">
            {name}
          </NavigationMenuTrigger>
          <NavigationMenuContent className="bg-popover text-popover-foreground rounded-md shadow-xl mt-2 border border-border">
            <ul className="p-2 min-w-35 flex flex-col gap-1">
              <li>
                <Link
                  href={`/profile/${userId}`}
                  className="block px-4 py-2 text-sm hover:bg-muted rounded transition-colors"
                >
                  Profile
                </Link>
              </li>
              <li>
                <Link
                  href={`/profile/${userId}?tab=orders`}
                  className="block px-4 py-2 text-sm hover:bg-muted rounded transition-colors"
                >
                  Orders
                </Link>
              </li>
              <li>
                <Link
                  href={`/profile/${userId}?tab=favorites`}
                  className="block px-4 py-2 text-sm hover:bg-muted rounded transition-colors"
                >
                  Favorites
                </Link>
              </li>
              <li>
                <Link
                  href={`/profile/${userId}?tab=reviews`}
                  className="block px-4 py-2 text-sm hover:bg-muted rounded transition-colors"
                >
                  Reviews
                </Link>
              </li>
              {isAdmin && (
                <li>
                  <Link
                    href="/adminpage"
                    className="block px-4 py-2 text-sm hover:bg-muted rounded transition-colors font-semibold"
                  >
                    Admin Panel
                  </Link>
                </li>
              )}
              <li className="border-t border-border mt-1 pt-1">
                <Button
                  onClick={onLogout}
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start px-4 py-2 text-sm font-normal text-destructive hover:bg-muted hover:text-destructive"
                >
                  Logout
                </Button>
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  )
}
