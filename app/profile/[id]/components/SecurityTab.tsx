'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { changePassword } from '@/app/actions/changePassword'
import { changePasswordSchema, ChangePasswordFormData } from '@/lib/validate'

const emptyForm: ChangePasswordFormData = {
  currentPassword: '',
  newPassword: '',
  confirmNewPassword: '',
}

export default function SecurityTab() {
  const [form, setForm] = useState<ChangePasswordFormData>(emptyForm)
  const [errors, setErrors] = useState<
    Partial<Record<keyof ChangePasswordFormData, string[]>>
  >({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  const handleChange =
    (field: keyof ChangePasswordFormData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }))
    }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSuccessMessage('')

    const result = changePasswordSchema.safeParse(form)
    if (!result.success) {
      setErrors(result.error.flatten().fieldErrors)
      return
    }

    setIsSubmitting(true)
    setErrors({})
    const response = await changePassword(result.data)
    setIsSubmitting(false)

    if (!response.success) {
      if (response.fieldErrors) setErrors(response.fieldErrors)
      return
    }

    setForm(emptyForm)
    setSuccessMessage('Your password was changed successfully!')
  }

  return (
    <div className="border border-aegean-gray shadow-md w-full p-6 rounded-lg flex flex-col gap-4 shadow-aegean-green/20">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <Label htmlFor="currentPassword">Current Password</Label>
          <Input
            id="currentPassword"
            name="currentPassword"
            type="password"
            value={form.currentPassword}
            onChange={handleChange('currentPassword')}
            error={errors.currentPassword?.[0]}
          />
        </div>

        <div className="flex flex-col gap-1">
          <Label htmlFor="newPassword">New Password</Label>
          <Input
            id="newPassword"
            name="newPassword"
            type="password"
            value={form.newPassword}
            onChange={handleChange('newPassword')}
            error={errors.newPassword?.[0]}
          />
        </div>

        <div className="flex flex-col gap-1">
          <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
          <Input
            id="confirmNewPassword"
            name="confirmNewPassword"
            type="password"
            value={form.confirmNewPassword}
            onChange={handleChange('confirmNewPassword')}
            error={errors.confirmNewPassword?.[0]}
          />
        </div>

        {successMessage && (
          <p className="text-sm font-medium text-aegean-green-text">
            {successMessage}
          </p>
        )}

        <div className="flex justify-end mt-2">
          <Button type="submit" variant="buy" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Change Password'}
          </Button>
        </div>
      </form>
    </div>
  )
}
