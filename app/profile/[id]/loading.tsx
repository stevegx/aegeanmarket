import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <div className="flex flex-col items-center w-full px-4 py-10 gap-6">
      <Skeleton className="h-9 w-40" />

      <div className="w-full max-w-3xl flex flex-col items-center gap-6">
        <Skeleton className="h-16 w-16 rounded-full" />
        <Skeleton className="h-6 w-48" />

        <div className="flex gap-2 w-full justify-center">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-9 w-24 rounded-md" />
          ))}
        </div>

        <div className="border border-aegean-gray shadow-md w-full p-6 rounded-lg flex flex-col gap-4">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    </div>
  )
}
