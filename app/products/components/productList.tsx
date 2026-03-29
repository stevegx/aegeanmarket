import getProduct from '../actions/getProducts'
import ProductCard from '../components/productCard'

export default async function ProductList() {
  const product = await getProduct()
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6 bg-aegean-gray">
      {product.map((products) => (
        <ProductCard key={products._id} product={products} />
      ))}
    </div>
  )
}
