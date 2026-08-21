'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import PaginationControls from '@/app/products/components/PaginationControls'
import type { AdminUserListItem } from '@/lib/db'
import UserEditDialog from './UserEditDialog'
import CreateUserDialog from './CreateUserDialog'
import { TONE_CLASSES, BADGE_CLASS } from './statusMeta'

interface UsersTabProps {
  users: AdminUserListItem[]
  totalPages: number
  currentPage: number
  roleFilter?: string
  search?: string
  currentAdminId: string
}

export default function UsersTab({
  users,
  totalPages,
  currentPage,
  roleFilter,
  search,
  currentAdminId,
}: UsersTabProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchInput, setSearchInput] = useState(search ?? '')

  const updateParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('tab', 'users')
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === '') params.delete(key)
      else params.set(key, value)
    })
    params.set('userPage', '1')
    router.push(`?${params.toString()}`, { scroll: false })
  }

  return (
    <div className="w-full flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <Select
            value={roleFilter ?? 'all'}
            onValueChange={(value) =>
              updateParams({ userRole: value === 'all' ? null : value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="All roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All roles</SelectItem>
              <SelectItem value="customer">customer</SelectItem>
              <SelectItem value="admin">admin</SelectItem>
            </SelectContent>
          </Select>

          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') updateParams({ userSearch: searchInput })
            }}
            onBlur={() => updateParams({ userSearch: searchInput })}
            placeholder="Search by username or email..."
            className="flex-1 min-w-64 px-3 py-2 text-sm border rounded-md"
          />
        </div>

        <CreateUserDialog />
      </div>

      <div className="w-full overflow-x-auto rounded-lg ring-1 ring-foreground/10">
        <Table className="text-sm">
          <TableHeader>
            <TableRow>
              <TableHead>Username</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  No users found
                </TableCell>
              </TableRow>
            )}
            {users.map((user) => (
              <TableRow key={user._id}>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge
                    className={cn(
                      BADGE_CLASS,
                      TONE_CLASSES[user.role === 'admin' ? 'dark' : 'neutral']
                    )}
                  >
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    className={cn(
                      BADGE_CLASS,
                      TONE_CLASSES[user.isActive ? 'green' : 'destructive']
                    )}
                  >
                    {user.isActive ? 'active' : 'inactive'}
                  </Badge>
                </TableCell>
                <TableCell>
                  {new Date(user.createdAt).toLocaleDateString('en-GB')}
                </TableCell>
                <TableCell>
                  <UserEditDialog
                    user={user}
                    isSelf={user._id === currentAdminId}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          paramName="userPage"
        />
      )}
    </div>
  )
}
