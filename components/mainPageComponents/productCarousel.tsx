'use client'
import { useEffect, useRef, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from '@/components/ui/carousel'
import Autoplay from 'embla-carousel-autoplay'
import ProductImage from '@/components/productImage'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useCartStore } from '@/app/products/store/useCartStore'
import { QuantityController } from '@/app/products/components/productCard'
import { cn } from '@/lib/utils'

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

// Deterministic accent color per category (categories come from the DB, not
// a fixed enum) so each tile's top bar visually groups by category.
const CATEGORY_ACCENTS = [
  'bg-aegean-dark',
  'bg-aegean-blue',
  'bg-aegean-green',
  'bg-aegean-terracotta',
]

function categoryAccent(category: string) {
  let hash = 0
  for (let i = 0; i < category.length; i++) {
    hash = (hash * 31 + category.charCodeAt(i)) >>> 0
  }
  return CATEGORY_ACCENTS[hash % CATEGORY_ACCENTS.length]
}

export default function ProductCarousel({
  products,
  tittle,
}: ProductCarouselProps) {
  const addItem = useCartStore((state) => state.addItem)
  const cartItems = useCartStore((state) => state.items)
  const [api, setApi] = useState<CarouselApi>()
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([])
  // Must stay referentially stable across renders — a fresh Autoplay()
  // instance on every render makes embla-carousel-react tear down and
  // reinit the whole carousel each time (e.g. every autoplay tick, since
  // that triggers a 'select' -> setSelectedIndex -> re-render loop), which
  // was silently cancelling manual scrollNext/scrollPrev/dot navigation
  // before they could finish animating.
  const autoplay = useRef(
    Autoplay({
      delay: 5000,
      stopOnInteraction: false,
      stopOnMouseEnter: true,
    })
  )

  useEffect(() => {
    if (!api) return
    setScrollSnaps(api.scrollSnapList())
    const onSelect = () => setSelectedIndex(api.selectedScrollSnap())
    onSelect()
    api.on('select', onSelect)
    api.on('reInit', onSelect)
    return () => {
      api.off('select', onSelect)
      api.off('reInit', onSelect)
    }
  }, [api])

  if (!products || products.length === 0) return null
  return (
    <div className="flex flex-col gap-6 w-full px-10 py-8">
      <div className="flex flex-col border-l-4 border-aegean-dark pl-4">
        <h2 className="font-bold text-2xl md:text-3xl text-foreground">
          {tittle}
        </h2>
        <p className="text-muted-foreground text-sm italic">
          Our latest selection for you
        </p>
      </div>

      <div className="w-full relative">
        <Carousel
          setApi={setApi}
          opts={{ align: 'start', loop: true }}
          className="w-full"
          plugins={[autoplay.current]}
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
                  <Card className="h-full overflow-hidden pt-0 hover:shadow-xl transition-all duration-300 border-none bg-card group flex flex-col">
                    <div className={cn('h-1.5 w-full', categoryAccent(product.category))} />
                    <CardContent className="flex flex-col h-full p-0">
                      {/* Product Link Area */}
                      <Link href={`/products/${product._id}`} className="grow">
                        <div className="p-4">
                          <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-border/50">
                            <ProductImage
                              src={product.image}
                              alt={product.name}
                              className="object-contain p-6 group-hover:scale-105 transition-transform duration-500"
                              sizes="(max-width: 640px) 85vw, (max-width: 1024px) 45vw, 320px"
                              fill
                            />
                          </div>
                        </div>
                        <div className="flex flex-col px-4 pb-2 gap-1">
                          <span className="text-xs uppercase tracking-widest text-muted-foreground font-bold">
                            {product.category}
                          </span>
                          <h3 className="text-sm font-semibold text-card-foreground line-clamp-2 h-10">
                            {product.name}
                          </h3>
                          <div className="mt-2 flex items-center justify-between">
                            <span className="text-lg font-bold text-card-foreground">
                              {product.price.toFixed(2)}€
                            </span>
                          </div>
                        </div>
                      </Link>

                      <div className="px-4 pb-4">
                        {quantity === 0 ? (
                          <Button
                            variant={hasStock ? 'buy' : 'disabledBuy'}
                            disabled={!hasStock}
                            size="lg"
                            className="w-full transition-all duration-300"
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

          <CarouselPrevious className="-left-4 md:-left-12 h-11 w-11 border-none bg-aegean-dark text-white shadow-md hover:bg-aegean-dark/90 hover:text-white dark:bg-aegean-dark dark:hover:bg-aegean-dark/90" />
          <CarouselNext className="-right-4 md:-right-12 h-11 w-11 border-none bg-aegean-dark text-white shadow-md hover:bg-aegean-dark/90 hover:text-white dark:bg-aegean-dark dark:hover:bg-aegean-dark/90" />
        </Carousel>

        {scrollSnaps.length > 1 && (
          <div className="flex justify-center gap-2 mt-5">
            {scrollSnaps.map((_, index) => (
              <button
                key={index}
                type="button"
                aria-label={`Go to slide ${index + 1}`}
                onClick={() => api?.scrollTo(index)}
                className={cn(
                  'h-2 rounded-full cursor-pointer transition-all duration-300',
                  index === selectedIndex
                    ? 'w-6 bg-aegean-dark'
                    : 'w-2 bg-aegean-dark/30 hover:bg-aegean-dark/60'
                )}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
