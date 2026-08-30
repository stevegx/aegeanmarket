import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function ProductCardSkeleton() {
  return (
    <Card className="mx-auto w-full h-[520px] max-w-sm my-2 flex flex-col gap-0 p-3 rounded-xl border-border">
      <Skeleton className="h-[55%] w-full shrink-0 rounded-xl" />

      <div className="flex grow flex-col gap-2 px-1 pt-3">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-4 w-28 mt-1" />
        <Skeleton className="h-4 w-full mt-1" />
        <Skeleton className="h-6 w-24 mt-auto" />
      </div>

      <Skeleton className="h-11 w-full rounded-md shrink-0 mt-3" />
    </Card>
  )
}
