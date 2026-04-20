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
export default function LoginForm() {
  const setLogin = useAuthStore((state) => state.setLogin)
  const router = useRouter()
  const [errors, setErrors] = useState<
    Partial<Record<keyof LoginFormData, string[]>>
  >({})

  const { syncCart } = useCartStore()
  const { fetchCart } = useCartStore()
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
        setLogin(response.username)
        await syncCart()
        await fetchCart()
        router.push('/')
        router.refresh()
      }
    }
  }

  return (
    <div className="flex flex-col justify-center items-center min-h-screen">
      <form
        className="flex flex-col shadow-2xl rounded-4xl w-lg p-10 gap-4"
        onSubmit={handleSubmit}
      >
        <h1 className="flex text-4xl my-5 font-bold justify-center text-aegean-dark">
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
          className="w-full mt-2 py-5 font-bold text-lg text-white"
        >
          Login
        </Button>
        <p className="text-sm text-center">
          Dont have an account?{' '}
          <Link href="/register" className="text-blue-500 hover:underline">
            Register
          </Link>
        </p>
      </form>
    </div>
  )
}
