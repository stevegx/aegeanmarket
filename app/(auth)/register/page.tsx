import type { Metadata } from 'next'
import RegisterForm from './components/registerForm'

export const metadata: Metadata = {
  title: 'Register',
  robots: { index: false, follow: false },
}

export default function RegisterPage() {
  return <RegisterForm />
}
