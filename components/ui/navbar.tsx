'use client'

import Image from 'next/image'
import { Input } from '@base-ui/react/input'
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuList,
} from './navigation-menu'
import Logo from '@/images/aegeanMarketLogo.jpg'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import { getSession } from '@/app/actions//getSession'
import { logoutUser } from '@/app/actions/logoutUser'
import { useRouter, usePathname } from 'next/navigation'
import { useAuthStore } from '@/app/(auth)/store/useAuthStore'
import { useCartStore } from '@/app/products/store/useCartStore'
import { Span } from 'next/dist/trace'
interface NavbarProps {
  initialSession: {
    username: string
    userId: string
  } | null // Εδώ είναι το κλειδί
}
export default function Navbar({ initialSession }: NavbarProps) {
  const { isLoggedIn, setLogout, setLogin, username } = useAuthStore()
  const router = useRouter()
  const pathname = usePathname()
  const [isHydrated, setIsHydrated] = useState(false)
  const cartItems = useCartStore((state) => state.getTotalItems())
  useEffect(() => {
    const initAuth = async () => {
      const session = await getSession()
      if (session) setLogin(session.username)
      setIsHydrated(true)
    }
    initAuth()
  }, [setLogin, setLogout])

  return (
    <div className="flex items-center justify-between px-6 py-2 bg-aegean-dark text-aegean-white gap-4 shadow-md sticky top-0">
      <Link href="/" className="shrink-0">
        <Image
          src={Logo}
          alt="Aegean Market Logo"
          width={100}
          height={400}
          className="h-12 w-auto rounded-lg object-contain"
          loading="lazy"
        />
      </Link>

      <div className="grow max-w-md">
        <Input
          placeholder="Search products..."
          type="search"
          className="w-full bg-white/10 border-none px-3 py-1.5 rounded text-sm text-white placeholder:text-gray-200 focus:bg-white focus:text-black transition-all outline-none"
        />
      </div>

      <div className="flex items-center gap-3">
        {!isHydrated ? (
          <div className="w-20 h-8 bg-white/10 animate-pulse rounded" />
        ) : isLoggedIn && username ? (
          <UserMenu
            name={username}
            onLogout={async () => {
              await logoutUser()
              setLogout()
              router.refresh()
            }}
          />
        ) : (
          <div className="flex items-center gap-2">
            {!pathname.startsWith('/login') && (
              <Link href="/login">
                <button className=" text-aegean-white text-md font-bold hover:bg-sky-900 cursor-pointer px-4 py-1.5 rounded">
                  Login
                </button>
              </Link>
            )}

            {!pathname.startsWith('/register') && (
              <Link href="/register">
                <button className=" text-aegean-white text-md font-bold hover:bg-sky-900 cursor-pointer px-4 py-1.5 rounded">
                  Register
                </button>
              </Link>
            )}
          </div>
        )}
        <button className="relative flex items-center justify-center w-10 h-10 rounded-full bg-aegean-light/30 hover:cursor-pointer transition-colors pr-1">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24" // Σημαντικό για να ξέρει το SVG πώς να κεντραριστεί
            fill="currentColor"
          >
            <path d="M7 4h-2l-1 2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2h-11.42c-.14 0-.25-.11-.25-.25l.03-.12 .9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49a1 1 0 0 0-.87-1.48h-14.31l-.94-2zm3 16a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm10 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" />
          </svg>
          {cartItems > 0 && (
            <span className="absolute -top-1.5 -right-2.5 flex h-5 w-5 items-center justify-center rounded-full bg-aegean-terracotta text-[11px] text-aegean-gray font-bold">
              {cartItems}
            </span>
          )}
        </button>
      </div>
    </div>
  )
}

export function UserMenu({
  name,
  onLogout,
}: {
  name: string
  onLogout: () => void
}) {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger className="bg-transparent text-white hover:text-aegean-green border-none text-sm px-2">
            {name}
          </NavigationMenuTrigger>
          <NavigationMenuContent className="bg-white text-aegean-dark rounded-md shadow-xl mt-2 border border-gray-200">
            <ul className="p-2 min-w-35 flex flex-col gap-1">
              <li>
                <Link
                  href="/profile"
                  className="block px-4 py-2 text-sm hover:bg-gray-100 rounded transition-colors"
                >
                  Profile
                </Link>
              </li>
              <li>
                <Link
                  href="/orders"
                  className="block px-4 py-2 text-sm hover:bg-gray-100 rounded transition-colors"
                >
                  Orders
                </Link>
              </li>
              <li className="border-t border-gray-100 mt-1 pt-1">
                <button
                  onClick={onLogout}
                  className="w-full text-left block px-4 py-2 text-sm hover:bg-gray-100 rounded transition-colors text-red-600 cursor-pointer"
                >
                  Logout
                </button>
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  )
}
