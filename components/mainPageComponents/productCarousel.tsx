'use client'
import { Card, CardContent } from '@/components/ui/card'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import Autoplay from 'embla-carousel-autoplay'
import ProductImage from '@/components/productImage'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useCartStore } from '@/app/products/store/useCartStore'
import { QuantityController } from '@/app/products/components/productCard'

export interface RandomProduct {
  _id: string
  name: string
  image: string
  price: number
  category: string
  stock: number
}

interface ProductCarouselProps {
  products: RandomProduct[]
  tittle: string
}

export default function ProductCarousel({
  products,
  tittle,
}: ProductCarouselProps) {
  const addItem = useCartStore((state) => state.addItem)
  const cartItems = useCartStore((state) => state.items)
  if (!products || products.length === 0) return null
  return (
    <div className="flex flex-col gap-6 w-full px-10 py-8">
      <div className="flex flex-col border-l-4 border-aegean-dark pl-4">
        <h2 className="font-bold text-2xl md:text-3xl text-aegean-dark">
          {tittle}
        </h2>
        <p className="text-muted-foreground text-sm italic">
          Our latest selection for you
        </p>
      </div>

      <div className="w-full relative">
        <Carousel
          opts={{ align: 'start', loop: true }}
          className="w-full"
          plugins={[
            Autoplay({
              delay: 5000,
              stopOnInteraction: false,
              stopOnMouseEnter: true,
            }),
          ]}
        >
          <CarouselContent>
            {products.map((product) => {
              const itemInCart = cartItems.find((i) => i._id === product._id)
              const quantity = itemInCart ? itemInCart.quantity : 0
              const hasStock = product.stock > 0

              return (
                <CarouselItem
                  key={product._id}
                  className="pl-4 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4"
                >
                  <Card className="h-full overflow-hidden hover:shadow-xl transition-all duration-300 border-none bg-white group flex flex-col">
                    <CardContent className="flex flex-col h-full p-0">
                      {/* Product Link Area */}
                      <Link href={`/products/${product._id}`} className="grow">
                        <div className="relative aspect-square w-full bg-white overflow-hidden">
                          <ProductImage
                            src={product.image}
                            alt={product.name}
                            className="object-contain p-6 group-hover:scale-105 transition-transform duration-500"
                            sizes="(max-width: 640px) 85vw, (max-width: 1024px) 45vw, 320px"
                            fill
                          />
                        </div>
                        <div className="flex flex-col p-4 gap-1 border-t border-border">
                          <span className="text-xs uppercase tracking-widest text-muted-foreground font-bold">
                            {product.category}
                          </span>
                          <h3 className="text-sm font-semibold text-aegean-dark line-clamp-2 h-10">
                            {product.name}
                          </h3>
                          <div className="mt-2 flex items-center justify-between">
                            <span className="text-lg font-bold text-aegean-dark">
                              {product.price.toFixed(2)}€
                            </span>
                          </div>
                        </div>
                      </Link>

                      <div>
                        {quantity === 0 ? (
                          <Button
                            variant={hasStock ? 'buy' : 'disabledBuy'}
                            disabled={!hasStock}
                            className="w-full transition-all duration-300 p-5 text-lg"
                            onClick={() => addItem(product)}
                          >
                            {hasStock ? 'BUY' : 'OUT OF STOCK'}
                          </Button>
                        ) : (
                          <div className="w-full animate-in fade-in zoom-in-95">
                            <QuantityController product={product} />
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </CarouselItem>
              )
            })}
          </CarouselContent>

          <CarouselPrevious className="-left-4 md:-left-12 h-10 w-10 border-aegean-dark text-aegean-dark hover:bg-aegean-dark hover:text-white" />
          <CarouselNext className="-right-4 md:-right-12 h-10 w-10 border-aegean-dark text-aegean-dark hover:bg-aegean-dark hover:text-white" />
        </Carousel>
      </div>
    </div>
  )
}
