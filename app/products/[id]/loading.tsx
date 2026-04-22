import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-4 pt-35 pb-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="aspect-square w-full">
          <Skeleton className="h-full w-full rounded-2xl bg-gray-200" />
        </div>

        <div className="flex flex-col gap-6">
          <div className="space-y-4">
            <Skeleton className="h-10 w-3/4 bg-gray-200" />
            <Skeleton className="h-6 w-1/4 bg-gray-200" />
          </div>

          <div className="space-y-2">
            <Skeleton className="h-4 w-full bg-gray-200" />
            <Skeleton className="h-4 w-full bg-gray-200" />
            <Skeleton className="h-4 w-2/3 bg-gray-200" />
          </div>

          <div className="mt-4">
            <Skeleton className="h-12 w-32 bg-gray-200" />
          </div>

          <div className="flex gap-4 mt-6">
            <Skeleton className="h-14 flex-1 bg-gray-200 rounded-xl" />
            <Skeleton className="h-14 w-14 bg-gray-200 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  )
}
