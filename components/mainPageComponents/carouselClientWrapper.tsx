'use client'

import * as React from 'react'
import Autoplay from 'embla-carousel-autoplay'
import { Card, CardContent } from '@/components/ui/card'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import Image from 'next/image'
import Link from 'next/link'
import { IRandomProduct } from '@/app/products/actions/getRandomProducts'

interface CarouselProps {
  products: IRandomProduct[]
}

export default function CarouselClientWrapper({ products }: CarouselProps) {
  return (
    <div className="w-full max-h-xl flex justify-center px-10 mt-10">
      <Carousel
        opts={{ align: 'start', loop: true }}
        className="w-full max-w-screen"
        plugins={[
          Autoplay({
            delay: 5000,
            stopOnInteraction: false,
            stopOnMouseEnter: true,
          }),
        ]}
      >
        <CarouselContent>
          {products.map((product) => (
            <CarouselItem key={product._id} className="p-2">
              <Link href={`/products/${product._id}`}>
                <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="flex aspect-video max-h-120 items-center justify-center p-0 relative">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-contain"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-2">
                      <p className="text-white text-sm font-medium truncate text-center">
                        {product.name}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hover:cursor-pointer p-6" />
        <CarouselNext className="hover:cursor-pointer p-6" />
      </Carousel>
    </div>
  )
}
