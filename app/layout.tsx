import type { Metadata } from 'next'
import { Geist, Geist_Mono, Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { cn } from '@/lib/utils'
import Navbar from '@/components/navbar'
import { getSession } from '@/app/actions/getSession'
import { CartSyncHandler } from '@/app/products/components/cart/handler/CartSyncHandler'
import { CartMergeModal } from '@/app/products/components/cart/handler/CartMergeModal'
import { FavoritesSyncHandler } from '@/app/products/components/favorites/handler/FavoritesSyncHandler'
import SearchComponent from '@/components/searchcomponents/searchComponent'
import Footer from '@/components/footer'
import MobileTabBar from '@/components/mobileTabBar'
import CookieConsent from '@/components/CookieConsent'
import { ThemeProvider } from '@/components/theme-provider'
import { ThemeSyncHandler } from '@/components/ThemeSyncHandler'

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
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  ),
  title: {
    default: 'Aegean Market',
    template: '%s | Aegean Market',
  },
  description:
    'Aegean Market — an online marketplace for premium Mediterranean wines, spirits, and beverages.',
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await getSession()
  return (
    <html
      lang="en"
      className={cn('antialiased', inter.variable)}
      suppressHydrationWarning
    >
      <body
        className={`${inter.variable} ${geistSans.variable} ${geistMono.variable} font-sans min-h-screen flex flex-col pb-16 sm:pb-0`}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Navbar initialSession={session}>
            <SearchComponent />
          </Navbar>
          <CartSyncHandler />
          <CartMergeModal />
          <FavoritesSyncHandler />
          <ThemeSyncHandler />
          <main className="grow flex flex-col">{children}</main>

          <Footer userId={session?.userId ?? null} />
          <MobileTabBar />
          <CookieConsent />
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  )
}
