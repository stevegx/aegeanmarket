// components/productList.tsx
import getProducts from '../actions/getProducts'
import ProductCard from '../components/productCard'
import PaginationControls from '../components/PaginationControls'
import FilterCategories from './filterCategories'

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
}

interface ProductListProps {
  currentPage: number
  category?: string
  maxPrice?: number
  manufacturers?: string[]
  minRating?: number
  onlyInStock?: boolean
  searchTerm?: string
}

export default async function ProductList({
  currentPage,
  category,
  maxPrice,
  manufacturers,
  minRating,
  onlyInStock,
  searchTerm,
}: ProductListProps) {
  const { products, totalPages } = await getProducts({
    page: currentPage,
    category,
    maxPrice,
    manufacturers,
    minRating,
    onlyInStock,
    searchTerm,
  })

  return (
    <div className="flex flex-col lg:flex-row w-full max-w-360 mx-auto min-h-screen gap-2">
      <main className="flex-1 flex flex-col p-4 min-w-0">
        <div className="w-full mb-8">
          <FilterCategories />
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 justify-items-center">
            {products.map((p: IProduct) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500">
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
