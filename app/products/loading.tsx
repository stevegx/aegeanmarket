import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { FilterSideBarSkeleton } from './components/filterSideBarSkeleton'
import { FilterCategoriesSkeleton } from './components/filterCategoriesSkeleton'
import { ProductCardSkeleton } from './components/productCardSkeleton'

export default function Loading() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <FilterSideBarSkeleton />

        <SidebarInset className="w-full">
          <div className="flex-1 flex flex-col min-w-0">
            <main className="p-4 pt-35 w-full max-w-360 mx-auto">
              <FilterCategoriesSkeleton />

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 justify-items-center">
                {[...Array(6)].map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            </main>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
