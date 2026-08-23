'use client'

import * as React from 'react'
import Autoplay from 'embla-carousel-autoplay'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from '@/components/ui/carousel'
import ProductImage from '@/components/productImage'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { IRandomProduct } from '@/app/products/actions/getRandomProducts'

interface CarouselProps {
  products: IRandomProduct[]
}

const AUTOPLAY_DELAY = 6000

export default function CarouselClientWrapper({ products }: CarouselProps) {
  const [api, setApi] = React.useState<CarouselApi>()
  const [current, setCurrent] = React.useState(0)

  React.useEffect(() => {
    if (!api) return
    const onSelect = () => setCurrent(api.selectedScrollSnap())
    api.on('select', onSelect)
    return () => {
      api.off('select', onSelect)
    }
  }, [api])

  return (
    <div className="w-full relative">
      <Carousel
        setApi={setApi}
        opts={{ align: 'start', loop: true }}
        className="w-full"
        plugins={[
          Autoplay({
            delay: AUTOPLAY_DELAY,
            stopOnInteraction: false,
            stopOnMouseEnter: true,
          }),
        ]}
      >
        <CarouselContent className="ml-0">
          {products.map((product, index) => (
            <CarouselItem key={product._id} className="pl-0 basis-full">
              <Link
                href={`/products/${product._id}`}
                className="group relative block h-[60vh] max-h-[620px] min-h-[380px] w-full overflow-hidden bg-aegean-dark"
              >
                <div
                  className={cn(
                    'absolute inset-0 ease-out',
                    current === index
                      ? 'scale-110 transition-transform duration-[6500ms]'
                      : 'scale-100 transition-none'
                  )}
                >
                  <ProductImage
                    src={product.image}
                    alt={product.name}
                    fill
                    priority={index === 0}
                    className="object-cover"
                    sizes="100vw"
                  />
                </div>

                <div className="absolute inset-0 bg-gradient-to-t from-aegean-dark/95 via-aegean-dark/25 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-aegean-dark/40 via-transparent to-transparent" />

                <div className="absolute inset-x-0 bottom-0 flex flex-col items-start gap-2 p-8 md:p-16">
                  <span className="text-xs md:text-sm uppercase tracking-[0.3em] text-aegean-light font-medium">
                    {product.category}
                  </span>
                  <h2 className="max-w-2xl font-serif text-3xl md:text-5xl font-semibold leading-tight text-white drop-shadow-md">
                    {product.name}
                  </h2>
                  <span className="mt-1 text-xs md:text-sm uppercase tracking-widest text-white/70 group-hover:text-white transition-colors">
                    View product →
                  </span>
                </div>
              </Link>
            </CarouselItem>
          ))}
        </CarouselContent>

        <CarouselPrevious className="left-4 md:left-8 h-11 w-11 border-white/40 bg-black/20 text-white backdrop-blur-sm hover:bg-white hover:text-aegean-dark cursor-pointer" />
        <CarouselNext className="right-4 md:right-8 h-11 w-11 border-white/40 bg-black/20 text-white backdrop-blur-sm hover:bg-white hover:text-aegean-dark cursor-pointer" />

        <div className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 gap-2">
          {products.map((_, index) => (
            <button
              key={index}
              type="button"
              aria-label={`Go to slide ${index + 1}`}
              onClick={() => api?.scrollTo(index)}
              className={cn(
                'h-2 rounded-full cursor-pointer transition-all duration-300',
                current === index
                  ? 'w-6 bg-white'
                  : 'w-2 bg-white/50 hover:bg-white/80'
              )}
            />
          ))}
        </div>
      </Carousel>
    </div>
  )
}
