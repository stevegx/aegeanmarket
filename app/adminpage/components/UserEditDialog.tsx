'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { HugeiconsIcon } from '@hugeicons/react'
import { PencilEdit02Icon, Delete02Icon } from '@hugeicons/core-free-icons'
import type { AdminUserListItem } from '@/lib/db'
import { adminUpdateUser } from '@/app/actions/adminUpdateUser'
import { adminDeleteUser } from '@/app/actions/adminDeleteUser'

export default function UserEditDialog({
  user,
  isSelf,
}: {
  user: AdminUserListItem
  isSelf: boolean
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const [username, setUsername] = useState(user.username)
  const [email, setEmail] = useState(user.email)
  const [address, setAddress] = useState(user.address)
  const [phone, setPhone] = useState(user.phone)
  const [role, setRole] = useState(user.role)
  const [isActive, setIsActive] = useState(user.isActive)

  const handleSave = () => {
    setError(null)
    startTransition(async () => {
      const result = await adminUpdateUser(user._id, {
        username,
        email,
        address,
        phone,
        role,
        isActive,
      })
      if (!result.success) {
        setError(result.error)
        return
      }
      setOpen(false)
      router.refresh()
    })
  }

  const handleDelete = () => {
    startTransition(async () => {
      const result = await adminDeleteUser(user._id)
      if (!result.success) {
        setError(result.error)
        return
      }
      setOpen(false)
      router.refresh()
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={<Button variant="outline" size="sm" className="gap-1.5" />}
      >
        <HugeiconsIcon icon={PencilEdit02Icon} strokeWidth={2} className="size-3.5" />
        Edit
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base">Edit user</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              className="px-3 py-2 text-sm border rounded-md"
            />
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="px-3 py-2 text-sm border rounded-md"
            />
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Address"
              className="px-3 py-2 text-sm border rounded-md col-span-2"
            />
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Phone"
              className="px-3 py-2 text-sm border rounded-md col-span-2"
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Role</label>
            <Select
              value={role}
              onValueChange={(v) => setRole(v as typeof role)}
              disabled={isSelf}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="customer">customer</SelectItem>
                <SelectItem value="admin">admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Active account</label>
            <Switch
              checked={isActive}
              onCheckedChange={setIsActive}
              disabled={isSelf}
            />
          </div>

          {isSelf && (
            <p className="text-xs text-muted-foreground">
              You can&apos;t change your own role or deactivate your own
              account.
            </p>
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <DialogFooter className="justify-between sm:justify-between">
          <AlertDialog>
            <AlertDialogTrigger
              render={
                <Button variant="destructive" size="sm" className="gap-1.5" />
              }
              disabled={isSelf}
            >
              <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} className="size-3.5" />
              Delete
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete user?</AlertDialogTitle>
                <AlertDialogDescription>
                  {user.username} will be permanently deleted. Their
                  orders/reviews will remain as historical records.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  disabled={isPending}
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Button
            onClick={handleSave}
            disabled={isPending}
            size="lg"
            className="font-semibold"
          >
            {isPending ? 'Saving...' : 'Save changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
