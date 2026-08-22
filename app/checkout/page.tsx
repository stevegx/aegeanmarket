import type { Metadata } from 'next'
import { getSession } from '@/app/actions/getSession'
import CheckoutClient from './components/CheckoutClient'

export const metadata: Metadata = {
  title: 'Checkout',
  robots: { index: false, follow: false },
}

export default async function CheckoutPage() {
  const session = await getSession()

  return <CheckoutClient isLoggedIn={!!session} />
}
