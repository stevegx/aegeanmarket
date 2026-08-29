// components/productList.tsx
import getProducts from '../actions/getProducts'
import ProductCard from '../components/productCard'
import PaginationControls from '../components/PaginationControls'
import FilterCategories from './filterCategories'
import Breadcrumbs from './Breadcrumbs'

export interface IProduct {
  _id: string
  name: string
  price: number
  description: string
  category: string
  image: string
  stock: number
  rating: number
  manufacturer?: string
  volume?: string
  origin?: string
}

interface ProductListProps {
  currentPage: number
  category?: string
  minPrice?: number
  maxPrice?: number
  manufacturers?: string[]
  minRating?: number
  onlyInStock?: boolean
  searchTerm?: string
  volume?: string[]
  origin?: string[]
}

export default async function ProductList({
  currentPage,
  category,
  minPrice,
  maxPrice,
  manufacturers,
  minRating,
  onlyInStock,
  searchTerm,
  volume,
  origin,
}: ProductListProps) {
  const { products, totalPages, total } = await getProducts({
    page: currentPage,
    category,
    minPrice,
    maxPrice,
    manufacturers,
    minRating,
    onlyInStock,
    searchTerm,
    volume,
    origin,
  })
  return (
    <div className="flex flex-col lg:flex-row w-full max-w-360 mx-auto min-h-screen gap-2">
      <main className="flex-1 flex flex-col min-w-0">
        <Breadcrumbs category={category} />

        <div className="w-full mb-8">
          <FilterCategories />
        </div>

        <div className="mb-4 flex items-baseline justify-between gap-4">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {category
              ? category.charAt(0).toUpperCase() +
                category.slice(1).toLowerCase()
              : searchTerm
                ? `Results for “${searchTerm}”`
                : 'All Products'}
          </h1>
          <p className="shrink-0 text-sm text-muted-foreground">
            {total} {total === 1 ? 'product' : 'products'}
          </p>
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 justify-items-center">
            {products.map((p: IProduct) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <p className="text-xl font-semibold">No products found!</p>
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-auto py-12">
            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
            />
          </div>
        )}
      </main>
    </div>
  )
}
