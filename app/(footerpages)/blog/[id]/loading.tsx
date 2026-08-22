import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <div>
      <div className="mt-12 pt-8 border-t border-border p-3">
        <Skeleton className="h-5 w-32" />
      </div>
      <article className="max-w-4xl mx-auto py-12 px-6">
        <header className="mb-8">
          <Skeleton className="h-10 w-3/4 mb-4" />
          <div className="flex items-center gap-3">
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-4 w-32" />
          </div>
        </header>
        <Skeleton className="w-full aspect-video rounded-3xl mb-10" />
        <div className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </article>
    </div>
  )
}
