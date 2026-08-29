'use client'
import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { LoginSchema, LoginFormData } from '@/lib/validate'
import { loginUser } from '@/app/actions/loginUser'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '../../store/useAuthStore'
import { useCartStore } from '@/app/products/store/useCartStore'
import GoogleSignInButton from '@/components/auth/GoogleSignInButton'
export default function LoginForm() {
  const setLogin = useAuthStore((state) => state.setLogin)
  const router = useRouter()
  const [errors, setErrors] = useState<
    Partial<Record<keyof LoginFormData, string[]>>
  >({})
  const [oauthError, setOauthError] = useState('')

  const reconcileAfterLogin = useCartStore((state) => state.reconcileAfterLogin)

  const handleOAuthSuccess = async (username: string) => {
    setOauthError('')
    const guestItems = useCartStore.getState().items
    setLogin(username)
    await reconcileAfterLogin(guestItems)
    router.push('/')
    router.refresh()
  }
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = {
      loginCredentials: e.currentTarget.loginCredentials.value,
      password: e.currentTarget.password.value,
    }
    const result = LoginSchema.safeParse(formData)
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors
      setErrors(fieldErrors)
    } else {
      setErrors({})
      const response = await loginUser(result.data)
      if (response && !response.success) {
        setErrors({ loginCredentials: [response.error || 'Wrong Credentials'] })
      } else {
        const guestItems = useCartStore.getState().items
        setLogin(response.username)
        await reconcileAfterLogin(guestItems)
        router.push('/')
        router.refresh()
      }
    }
  }

  return (
    <div className="flex flex-col justify-center items-center min-h-screen">
      <form
        className="flex flex-col bg-card border border-border shadow-2xl rounded-4xl w-full max-w-lg p-10 gap-4"
        onSubmit={handleSubmit}
      >
        <h1 className="flex text-3xl md:text-4xl my-5 font-bold justify-center text-foreground">
          Login
        </h1>

        <div className="flex flex-col gap-1">
          <Label htmlFor="loginCredentials">Username / Email</Label>
          <Input
            id="loginCredentials"
            name="loginCredentials"
            type="text"
            placeholder="Name or Email"
            error={errors.loginCredentials?.[0]}
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

        <Button
          type="submit"
          variant="buy"
          size="lg"
          className="w-full mt-2 font-bold"
        >
          Login
        </Button>

        <div className="flex items-center gap-3 my-1 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border" />
          or
          <span className="h-px flex-1 bg-border" />
        </div>

        {oauthError && (
          <p className="text-sm text-destructive text-center">{oauthError}</p>
        )}
        <div className="flex flex-col gap-3">
          <GoogleSignInButton
            onSuccess={handleOAuthSuccess}
            onError={setOauthError}
          />
        </div>

        <p className="text-sm text-center">
          Dont have an account?{' '}
          <Link href="/register" className="text-foreground hover:underline">
            Register
          </Link>
        </p>
      </form>
    </div>
  )
}
