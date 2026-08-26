'use client'
import Link from 'next/link'
import { FC } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { cn } from '@/lib/utils'

interface PaginationProps {
  currentPage: number
  totalPages: number
  paramName?: string
}

const PaginationControls: FC<PaginationProps> = ({
  currentPage,
  totalPages,
  paramName = 'page',
}) => {
  const prevPage: number = Math.max(currentPage - 1, 1)
  const nextPage: number = Math.min(currentPage + 1, totalPages)
  const searchParams = useSearchParams()
  const pathname = usePathname()

  const createPageUrl = (pageNumber: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set(paramName, pageNumber.toString())
    return `${pathname}?${params.toString()}`
  }

  return (
    <div className="flex flex-wrap justify-center items-center gap-3 py-10">
      <Link
        href={createPageUrl(prevPage)}
        aria-disabled={currentPage <= 1}
        className={cn(
          'px-4 py-2 rounded-md font-bold text-sm transition-all',
          currentPage <= 1
            ? 'bg-muted text-muted-foreground pointer-events-none'
            : 'bg-aegean-green text-white hover:bg-opacity-90 shadow-md'
        )}
      >
        Previous
      </Link>

      <div className="flex items-center gap-2 text-sm">
        <span className="font-black text-aegean-green-text">{currentPage}</span>
        <span className="text-muted-foreground">from</span>
        <select
          aria-label="Go to page"
          value={totalPages}
          onChange={(e) => {
            window.location.href = createPageUrl(Number(e.target.value))
          }}
          className="h-9 rounded-md border border-border bg-background px-2 text-sm font-bold text-foreground outline-none cursor-pointer focus:ring-2 focus:ring-ring/50"
        >
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <option key={page} value={page}>
              {page}
            </option>
          ))}
        </select>
      </div>

      <Link
        href={createPageUrl(nextPage)}
        aria-disabled={currentPage >= totalPages}
        className={cn(
          'px-4 py-2 rounded-md font-bold text-sm transition-all',
          currentPage >= totalPages
            ? 'bg-muted text-muted-foreground pointer-events-none'
            : 'bg-aegean-green text-white hover:bg-opacity-90 shadow-md'
        )}
      >
        Next
      </Link>
    </div>
  )
}

export default PaginationControls
