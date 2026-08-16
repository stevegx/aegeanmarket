import Link from 'next/link'
import ProductCard from '@/app/products/components/productCard'

export interface FavoriteProduct {
  _id: string
  name: string
  description: string
  category: string
  stock: number
  rating: number
  price: number
  image: string
}

export default function FavoritesTab({
  favorites,
}: {
  favorites: FavoriteProduct[]
}) {
  if (favorites.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 border border-aegean-gray rounded-lg p-10 text-center">
        <p className="text-lg font-semibold text-aegean-dark">
          Δεν έχεις προσθέσει αγαπημένα προϊόντα ακόμα.
        </p>
        <p className="text-sm text-gray-500">
          Πάτησε την καρδούλα σε ένα προϊόν για να το αποθηκεύσεις εδώ.
        </p>
        <Link
          href="/products"
          className="text-aegean-terracotta font-medium hover:underline"
        >
          Δες τα προϊόντα μας
        </Link>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 justify-items-center w-full">
      {favorites.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  )
}
