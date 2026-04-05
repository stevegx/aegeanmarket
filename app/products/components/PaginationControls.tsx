import Link from 'next/link'
import { FC } from 'react'

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

  return (
    <div className="flex justify-center items-center gap-6 py-10">
      <Link
        href={`?page=${prevPage}`}
        className={`px-5 py-2 rounded-md font-bold transition-all ${
          currentPage <= 1
            ? 'bg-gray-100 text-gray-400 pointer-events-none'
            : 'bg-aegean-green text-white hover:bg-opacity-90 shadow-md'
        }`}
      >
        Προηγούμενη
      </Link>

      <div className="flex items-center gap-2">
        <span className="text-gray-400 text-sm">Page</span>
        <span className="font-black text-aegean-green">{currentPage}</span>
        <span className="text-gray-400 text-sm">from {totalPages}</span>
      </div>

      <Link
        href={`?page=${nextPage}`}
        className={`px-5 py-2 rounded-md font-bold transition-all ${
          currentPage >= totalPages
            ? 'bg-gray-100 text-gray-400 pointer-events-none'
            : 'bg-aegean-green text-white hover:bg-opacity-90 shadow-md'
        }`}
      >
        Επόμενη
      </Link>
    </div>
  )
}

export default PaginationControls
