'use client'
import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { createUser } from '@/app/actions/createUser'
import { registerSchema, RegisterFormData } from '@/lib/validate'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '../../store/useAuthStore'
import { useCartStore } from '@/app/products/store/useCartStore'
import GoogleSignInButton from '@/components/auth/GoogleSignInButton'

export default function RegisterPage() {
  const setLogin = useAuthStore((state) => state.setLogin)
  const router = useRouter()
  const { syncCart, fetchCart } = useCartStore()
  const [errors, setErrors] = useState<
    Partial<Record<keyof RegisterFormData, string[]>>
  >({})
  const [oauthError, setOauthError] = useState('')

  const handleOAuthSuccess = async (username: string) => {
    setOauthError('')
    setLogin(username)
    await syncCart()
    await fetchCart()
    router.push('/')
    router.refresh()
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = {
      username: e.currentTarget.username.value,
      email: e.currentTarget.email.value,
      password: e.currentTarget.password.value,
      confirmPassword: e.currentTarget.confirmPassword.value,
      address: e.currentTarget.address.value,
      phone: e.currentTarget.phone.value,
    }
    const result = registerSchema.safeParse(formData)
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors
      setErrors(fieldErrors)
    } else {
      setErrors({})
      // eslint-disable-next-line @typescript-eslint/no-unused-vars -- destructured only to exclude it from userData
      const { confirmPassword, ...userData } = result.data
      await createUser(userData)
    }
  }

  return (
    <div className="flex flex-col justify-center items-center min-h-screen">
      <form
        className="flex flex-col bg-card border border-border shadow-2xl rounded-4xl w-full max-w-lg p-10 gap-4"
        onSubmit={handleSubmit}
      >
        <h1 className="flex text-3xl md:text-4xl my-5 font-bold justify-center text-foreground">
          Register
        </h1>

        {oauthError && (
          <p className="text-sm text-destructive text-center">{oauthError}</p>
        )}
        <div className="flex flex-col gap-3">
          <GoogleSignInButton
            onSuccess={handleOAuthSuccess}
            onError={setOauthError}
          />
        </div>

        <div className="flex items-center gap-3 my-1 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border" />
          or register with email
          <span className="h-px flex-1 bg-border" />
        </div>

        <div className="flex flex-col gap-1">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            name="username"
            type="text"
            placeholder="Username"
            error={errors.username?.[0]}
          />
        </div>

        <div className="flex flex-col gap-1">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            placeholder="Email"
            error={errors.email?.[0]}
          />
        </div>

        <div className="flex flex-col gap-1">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="Password"
            error={errors.password?.[0]}
          />
        </div>

        <div className="flex flex-col gap-1">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            placeholder="Confirm Password"
            error={errors.confirmPassword?.[0]}
          />
        </div>

        <div className="flex flex-col gap-1">
          <Label htmlFor="address">Address</Label>
          <Input
            id="address"
            name="address"
            type="text"
            placeholder="Address"
            error={errors.address?.[0]}
          />
        </div>

        <div className="flex flex-col gap-1">
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            placeholder="Phone Number"
            error={errors.phone?.[0]}
          />
        </div>

        <Button type="submit" size="lg" className="w-full mt-2 font-bold">
          Register
        </Button>
        <p className="text-sm text-center">
          Already have an account?{' '}
          <Link href="/login" className="text-foreground hover:underline">
            Login
          </Link>
        </p>
      </form>
    </div>
  )
}
