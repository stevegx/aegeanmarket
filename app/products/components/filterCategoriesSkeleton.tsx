import { Skeleton } from '@/components/ui/skeleton'

export function FilterCategoriesSkeleton() {
  return (
    <div className="w-full mb-8">
      <Skeleton className="h-6 w-32 mb-4 bg-gray-400" />
      <div className="flex flex-wrap gap-2">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-10 w-24 rounded-full bg-gray-400" />
        ))}
      </div>
    </div>
  )
}
