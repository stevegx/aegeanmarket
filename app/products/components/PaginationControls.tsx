'use client'
import Link from 'next/link'
import { FC } from 'react'
import { useSearchParams } from 'next/navigation'
interface PaginationProps {
  currentPage: number
  totalPages: number
}

const PaginationControls: FC<PaginationProps> = ({
  currentPage,
  totalPages,
}) => {
  const prevPage: number = Math.max(currentPage - 1, 1)
  const nextPage: number = Math.min(currentPage + 1, totalPages)
  const searchParams = useSearchParams()

  const createPageUrl = (pageNumber: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', pageNumber.toString())
    return `?${params.toString()}`
  }

  return (
    <div className="flex justify-center items-center gap-6 py-10">
      <Link
        href={createPageUrl(prevPage)}
        className={`px-5 py-2 rounded-md font-bold transition-all ${
          currentPage <= 1
            ? 'bg-muted text-muted-foreground pointer-events-none'
            : 'bg-aegean-green text-white hover:bg-opacity-90 shadow-md'
        }`}
      >
        Προηγούμενη
      </Link>

      <div className="flex items-center gap-2">
        <span className="text-muted-foreground text-sm">Page</span>
        <span className="font-black text-aegean-green">{currentPage}</span>
        <span className="text-muted-foreground text-sm">from {totalPages}</span>
      </div>

      <Link
        href={createPageUrl(nextPage)}
        className={`px-5 py-2 rounded-md font-bold transition-all ${
          currentPage >= totalPages
            ? 'bg-muted text-muted-foreground pointer-events-none'
            : 'bg-aegean-green text-white hover:bg-opacity-90 shadow-md'
        }`}
      >
        Επόμενη
      </Link>
    </div>
  )
}

export default PaginationControls
