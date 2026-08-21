import type { Metadata } from 'next'
import { Geist, Geist_Mono, Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { cn } from '@/lib/utils'
import Navbar from '@/components/navbar'
import { getSession } from '@/app/actions/getSession'
import { CartSyncHandler } from '@/app/products/components/cart/handler/CartSyncHandler'
import { FavoritesSyncHandler } from '@/app/products/components/favorites/handler/FavoritesSyncHandler'
import SearchComponent from '@/components/searchcomponents/searchComponent'
import Footer from '@/components/footer'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Aegean Market',
  description: 'This is my first next.js marketplace app!!',
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await getSession()
  return (
    <html lang="en" className={cn('h-full', 'antialiased', inter.variable)}>
      <body
        className={`${inter.variable} ${geistSans.variable} ${geistMono.variable} font-sans h-full flex flex-col`}
      >
        <Navbar initialSession={session}>
          <SearchComponent />
        </Navbar>
        <CartSyncHandler />
        <FavoritesSyncHandler />
        <main className="grow flex flex-col md:pt-12 pt-20"> {children}</main>

        <Footer userId={session?.userId ?? null} />
        <Analytics />
      </body>
    </html>
  )
}
