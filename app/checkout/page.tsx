import { getSession } from '@/app/actions/getSession'
import CheckoutClient from './components/CheckoutClient'

export default async function CheckoutPage() {
  const session = await getSession()

  return <CheckoutClient isLoggedIn={!!session} />
}
