import { Sidebar, SidebarHeader, SidebarContent } from '@/components/ui/sidebar'
import { Skeleton } from '@/components/ui/skeleton'

export function FilterSideBarSkeleton() {
  return (
    <Sidebar variant="sidebar" className="sticky top-16 border-r">
      <SidebarHeader className="h-16 border-b flex items-center px-4">
        <Skeleton className="h-6 w-24" /> {/* "Filters" Title */}
      </SidebarHeader>
      <SidebarContent className="p-4 space-y-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-5 w-32" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          </div>
        ))}
      </SidebarContent>
    </Sidebar>
  )
}
