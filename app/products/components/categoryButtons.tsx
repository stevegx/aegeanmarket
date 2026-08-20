'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

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
        <Button
          key={cat}
          variant={activeCat === cat ? 'default' : 'secondary'}
          onClick={() => handleFilter(cat)}
          className={cn(
            'shrink-0 h-auto rounded-full px-4 py-2 font-bold text-sm',
            activeCat === cat && 'bg-aegean-green hover:bg-aegean-green/90'
          )}
        >
          {cat}
        </Button>
      ))}
    </div>
  )
}
