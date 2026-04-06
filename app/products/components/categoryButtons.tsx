'use client'
import { useRouter, useSearchParams } from 'next/navigation'

interface FilterButtonsProps {
  categories: string[]
}

export default function CategoryButtons({ categories }: FilterButtonsProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const activeCat = searchParams.get('category')

  const handleFilter = (category: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (activeCat === category) {
      params.delete('category')
    } else {
      params.set('category', category)
    }
    params.set('page', '1')
    router.push(`?${params.toString()}`)
  }
  return (
    <div className="flex gap-2 overflow-x-scroll pb-2">
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => handleFilter(cat)}
          className={`shrink-0 px-4 py-2 rounded-full font-bold text-sm transition-all ${
            activeCat === cat
              ? 'bg-aegean-green text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  )
}
