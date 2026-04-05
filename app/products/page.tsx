// app/products/page.tsx
import ProductList from './components/productList'
import {
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from '@/components/ui/sidebar'
import FilterSideBar from './components/filterSideBar'

interface PageProps {
  searchParams: Promise<{ page?: string }>
}

export default async function ProductPage({ searchParams }: PageProps) {
  // Διαβάζουμε το page από το URL
  const sParams = await searchParams
  const currentPage = Number(sParams.page) || 1

  return (
    <SidebarProvider>
      <FilterSideBar />
      <SidebarInset className="w-full">
        <SidebarTrigger className="md:hidden fixed top-20 left-4 z-50 flex h-11 w-auto items-center px-4 gap-2 bg-aegean-green! text-white! shadow-xl hover:cursor-pointer rounded-full border-none transition-transform active:scale-95 after:content-['Filters'] after:text-sm after:font-bold after:ml-1" />
        <main className="p-4 w-full">
          {/* Περνάμε το currentPage στο ProductList */}
          <ProductList currentPage={currentPage} />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
