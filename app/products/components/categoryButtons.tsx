'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import { cn } from '@/lib/utils'
import type { CategoryStat } from './filterCategories'

interface CategoryButtonsProps {
  categories: CategoryStat[]
  total: number
}

export default function CategoryButtons({
  categories,
  total,
}: CategoryButtonsProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const activeCat = searchParams.get('category')

  const handleFilter = (category: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (category === null || activeCat === category) {
      params.delete('category')
    } else {
      params.set('category', category)
    }
    params.set('page', '1')
    router.push(`?${params.toString()}`, { scroll: false })
  }

  const pill = (
    label: string,
    count: number,
    isActive: boolean,
    onClick: () => void
  ) => (
    <button
      key={label}
      type="button"
      onClick={onClick}
      aria-pressed={isActive}
      className={cn(
        'group flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-all hover:cursor-pointer active:scale-95',
        isActive
          ? 'border-aegean-dark bg-aegean-dark text-white shadow-sm'
          : 'border-border bg-background text-foreground hover:border-aegean-dark hover:text-aegean-dark'
      )}
    >
      <span>{label}</span>
      <span
        className={cn(
          'rounded-full px-1.5 py-0.5 text-xs font-bold tabular-nums transition-colors',
          isActive
            ? 'bg-white/20 text-white'
            : 'bg-muted text-muted-foreground group-hover:bg-aegean-dark/10 group-hover:text-aegean-dark'
        )}
      >
        {count}
      </span>
    </button>
  )

  return (
    <div className="flex flex-wrap gap-2">
      {pill('All', total, !activeCat, () => handleFilter(null))}
      {categories.map((cat) =>
        pill(
          cat.name.charAt(0) + cat.name.slice(1).toLowerCase(),
          cat.count,
          activeCat === cat.name,
          () => handleFilter(cat.name)
        )
      )}
    </div>
  )
}
