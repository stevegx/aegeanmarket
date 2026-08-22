import { Skeleton } from '@/components/ui/skeleton'
import { ProductCardSkeleton } from './products/components/productCardSkeleton'

export default function Loading() {
  return (
    <div className="w-full flex flex-col items-center justify-start overflow-x-hidden bg-white">
      <div className="w-full mb-6">
        <Skeleton className="w-full aspect-[21/9] rounded-none" />
      </div>

      <div className="w-full py-4 bg-aegean-gray border-y border-border">
        <div className="flex justify-center gap-8 px-4">
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-10 w-40 hidden sm:block" />
        </div>
      </div>

      <div className="w-full py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <Skeleton className="h-8 w-48 mb-8" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
