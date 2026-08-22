import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <div className="flex flex-col lg:flex-row p-5 md:p-10 max-w-7xl mx-auto w-full items-start mt-10 gap-6">
      <div className="w-full aspect-square relative">
        <Skeleton className="w-full h-full" />
      </div>

      <div className="w-full flex flex-col gap-4">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-9 w-3/4" />
        <Skeleton className="h-9 w-1/3 mt-2" />
        <Skeleton className="h-5 w-24" />
        <div className="space-y-2 mt-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        <Skeleton className="h-11 w-full mt-4 rounded-md" />
      </div>
    </div>
  )
}
