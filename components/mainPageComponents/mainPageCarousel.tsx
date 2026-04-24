import getRandomProducts from '@/app/products/actions/getRandomProducts'
import { IRandomProduct } from '@/app/products/actions/getRandomProducts'
import CarouselClientWrapper from './carouselClientWrapper'

export async function MainPageCarousel() {
  const products: IRandomProduct[] = await getRandomProducts(10)
  if (products.length === 0) return null
  return <CarouselClientWrapper products={products} />
}
