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

export default function Navbar() {
  const { isLoggedIn, setLogout, setLogin, username } = useAuthStore()
  const router = useRouter()
  const pathname = usePathname()
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    const initAuth = async () => {
      const session = await getSession()
      if (session) setLogin(session.username)
      setIsHydrated(true)
    }
    initAuth()
  }, [setLogin, setLogout])

  return (
    <div className="flex items-center justify-between px-6 py-2 bg-aegean-dark text-aegean-white gap-4 shadow-md">
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
