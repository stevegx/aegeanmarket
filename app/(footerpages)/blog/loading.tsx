import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-5xl text-center mb-10 font-bold text-aegean-dark opacity-20">
        Blog
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="w-full max-w-100">
            <Card className="flex flex-col h-full overflow-hidden p-0 border-border">
              <Skeleton className="aspect-video w-full rounded-none" />

              <div className="p-5 space-y-4">
                <Skeleton className="h-3 w-32" />
                <div className="space-y-2">
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-2/3" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
                <Skeleton className="h-4 w-20 mt-4" />
              </div>
            </Card>
          </div>
        ))}
      </div>
    </div>
  )
}
