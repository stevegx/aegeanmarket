'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { updateProfile } from '@/app/actions/updateProfile'
import { updateProfileSchema, UpdateProfileFormData } from '@/lib/validate'

export interface ProfileUser {
  id: string
  username: string
  email: string
  address: string
  phone: string
  role: string
}

export default function ProfileInfoTab({ user }: { user: ProfileUser }) {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [form, setForm] = useState<UpdateProfileFormData>({
    username: user.username,
    email: user.email,
    address: user.address,
    phone: user.phone,
  })
  const [errors, setErrors] = useState<
    Partial<Record<keyof UpdateProfileFormData, string[]>>
  >({})
  const [successMessage, setSuccessMessage] = useState('')

  const handleChange =
    (field: keyof UpdateProfileFormData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }))
    }

  const handleCancel = () => {
    setForm({
      username: user.username,
      email: user.email,
      address: user.address,
      phone: user.phone,
    })
    setErrors({})
    setIsEditing(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSuccessMessage('')

    const result = updateProfileSchema.safeParse(form)
    if (!result.success) {
      setErrors(result.error.flatten().fieldErrors)
      return
    }

    setIsSubmitting(true)
    setErrors({})
    const response = await updateProfile(result.data)
    setIsSubmitting(false)

    if (!response.success) {
      if (response.fieldErrors) setErrors(response.fieldErrors)
      return
    }

    setSuccessMessage('Your information has been updated!')
    setIsEditing(false)
    router.refresh()
  }

  return (
    <div className="border border-aegean-gray shadow-md w-full p-6 rounded-lg flex flex-col gap-4 shadow-aegean-green/20">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            name="username"
            type="text"
            value={form.username}
            onChange={handleChange('username')}
            readOnly={!isEditing}
            error={errors.username?.[0]}
          />
        </div>

        <div className="flex flex-col gap-1">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange('email')}
            readOnly={!isEditing}
            error={errors.email?.[0]}
          />
        </div>

        <div className="flex flex-col gap-1">
          <Label htmlFor="address">Address</Label>
          <Input
            id="address"
            name="address"
            type="text"
            value={form.address}
            onChange={handleChange('address')}
            readOnly={!isEditing}
            error={errors.address?.[0]}
          />
        </div>

        <div className="flex flex-col gap-1">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            name="phone"
            type="text"
            value={form.phone}
            onChange={handleChange('phone')}
            readOnly={!isEditing}
            error={errors.phone?.[0]}
          />
        </div>

        {successMessage && (
          <p className="text-sm font-medium text-aegean-green-text">
            {successMessage}
          </p>
        )}

        <div className="flex justify-end gap-2 mt-2">
          {isEditing ? (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" variant="buy" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </>
          ) : (
            <Button
              type="button"
              variant="buy"
              onClick={() => {
                setSuccessMessage('')
                setIsEditing(true)
              }}
            >
              Edit
            </Button>
          )}
        </div>
      </form>
    </div>
  )
}
