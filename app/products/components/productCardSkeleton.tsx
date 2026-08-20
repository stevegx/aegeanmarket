import { Card, CardHeader, CardFooter } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function ProductCardSkeleton() {
  return (
    <Card className="mx-auto w-full h-auto overflow-hidden max-w-sm pt-0 my-10 flex flex-col border-border">
      <Skeleton className="aspect-video w-full rounded-none" />

      <CardHeader className="flex-none p-5 pb-2">
        <div className="flex flex-col items-start gap-y-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-2/3" />
          <Skeleton className="h-5 w-24 mt-1" />
          <Skeleton className="h-8 w-20 mt-2" />
          <div className="space-y-2 w-full mt-2">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-4/5" />
          </div>
        </div>
      </CardHeader>

      <CardFooter className="mt-auto p-5">
        <Skeleton className="h-10 w-full rounded-md" />
      </CardFooter>
    </Card>
  )
}
