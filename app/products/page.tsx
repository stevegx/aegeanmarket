import ProductList from './components/productList'
import {
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from '@/components/ui/sidebar'
import FilterSideBar from './components/filterSideBar'

interface PageProps {
  searchParams: Promise<{
    page?: string
    category?: string
    maxPrice?: string
    manufacturer?: string | string[]
    minRating?: string
    onlyInStock?: string
    q?: string
    volume: string | string[]
    origin: string | string[]
  }>
}

export default async function ProductPage({ searchParams }: PageProps) {
  const sParams = await searchParams

  // 1. Προετοιμασία των τιμών για το ProductList
  const currentPage: number = Number(sParams.page) || 1
  const category = sParams.category
  const maxPrice = sParams.maxPrice ? Number(sParams.maxPrice) : undefined
  const minRating = sParams.minRating ? Number(sParams.minRating) : undefined
  const onlyInStock = sParams.onlyInStock === 'true'
  const searchTerm = sParams.q

  // Διαχείριση των manufacturers, volume, origin (αν είναι string το κάνουμε array)
  const manufacturers = Array.isArray(sParams.manufacturer)
    ? sParams.manufacturer
    : sParams.manufacturer
      ? [sParams.manufacturer]
      : []
  const volume = Array.isArray(sParams.volume)
    ? sParams.volume
    : sParams.volume
      ? [sParams.volume]
      : []
  const origin = Array.isArray(sParams.origin)
    ? sParams.origin
    : sParams.origin
      ? [sParams.origin]
      : []
  return (
    <SidebarProvider>
      <FilterSideBar />
      <SidebarInset className="w-full">
        <SidebarTrigger className="md:hidden fixed top-35 left-4 z-50 flex h-11 w-auto items-center px-4 gap-2 bg-aegean-green! text-white! shadow-xl hover:cursor-pointer rounded-full border-none transition-transform active:scale-95 after:content-['Filters'] after:text-sm after:font-bold after:ml-1" />

        <main className="p-4 w-full">
          <ProductList
            currentPage={currentPage}
            category={category}
            maxPrice={maxPrice}
            searchTerm={searchTerm}
            manufacturers={manufacturers}
            minRating={minRating}
            onlyInStock={onlyInStock}
            volume={volume}
            origin={origin}
          />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
