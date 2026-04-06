import ProductList from './components/productList'
import {
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from '@/components/ui/sidebar'
import FilterSideBar from './components/filterSideBar'

interface PageProps {
  searchParams: Promise<{ page?: string; category?: string }>
}

export default async function ProductPage({ searchParams }: PageProps) {
  const sParams = await searchParams
  const currentPage: number = Number(sParams.page) || 1
  const category: string | undefined = sParams.category // Παίρνουμε την κατηγορία

  return (
    <SidebarProvider>
      <FilterSideBar />
      <SidebarInset className="w-full">
        <SidebarTrigger className="md:hidden fixed top-20 left-4 z-50 flex h-11 w-auto items-center px-4 gap-2 bg-aegean-green! text-white! shadow-xl hover:cursor-pointer rounded-full border-none transition-transform active:scale-95 after:content-['Filters'] after:text-sm after:font-bold after:ml-1" />

        <main className="p-4 w-full">
          <ProductList currentPage={currentPage} category={category} />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
