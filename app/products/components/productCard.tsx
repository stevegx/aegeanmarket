'use client'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useCartStore } from '../store/useCartStore'
import FavoriteButton from './FavoriteButton'
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import Link from 'next/link'
interface ProductValue {
  _id: string
  name: string
  description: string
  category: string
  stock: number
  rating: number
  price: number
  image: string
}

interface ProductProps {
  product: ProductValue
}
export interface QuantityControllerProps {
  product: {
    _id: string
    stock: number
  }
  className?: string
}

export default function ProductCard({ product }: ProductProps) {
  const buyItem = useCartStore((state) => state.addItem)

  const quantity = useCartStore(
    (state) => state.items.find((i) => i._id === product._id)?.quantity || 0
  )
  const stock = product.stock
  return (
    <Card
      className="mx-auto w-full h-auto overflow-hidden max-w-sm pt-0 my-10 hover:shadow-xl hover:cursor-pointer flex flex-col"
      id={product._id}
    >
      <Link href={`/products/${product._id}`} className="block h-full">
        {stock > 0 ? (
          <div className="relative aspect-video w-full">
            <FavoriteButton
              productId={product._id}
              className="absolute top-2 right-2 z-10"
            />
            <Image
              src={(product.image || '').trim().replace(/\s/g, '')}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 384px"
              className="object-contain"
            />
          </div>
        ) : (
          <div className="relative aspect-video w-full">
            <FavoriteButton
              productId={product._id}
              className="absolute top-2 right-2 z-10"
            />
            <span className="z-10 absolute text-5xl font-bold text-black top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2  text-center">
              OUT OF STOCK
            </span>
            <Image
              src={(product.image || '').trim().replace(/\s/g, '')}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 384px"
              className="object-cover grayscale-100"
              loading="lazy"
            />
          </div>
        )}

        <CardHeader className="flex-none p-5 pb-2">
          <div className="flex flex-col items-start gap-y-2">
            {/* Category */}
            <span className="text-sm font-light text-muted-foreground uppercase tracking-wider">
              {product.category}
            </span>

            <CardTitle className="font-bold text-xl line-clamp-2 text-left leading-tight">
              {product.name}
            </CardTitle>

            <CardAction className="p-0">
              <Badge variant="secondary" className="flex gap-0.5 px-2 py-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className={`text-lg leading-none ${
                      star <= product.rating
                        ? 'text-yellow-500'
                        : 'text-muted'
                    }`}
                  >
                    ★
                  </span>
                ))}
              </Badge>
            </CardAction>

            <span className="font-bold text-3xl text-aegean-blue">
              {product.price}€
            </span>

            <CardDescription className="text-left line-clamp-3 mt-1">
              {product.description}
            </CardDescription>
          </div>
        </CardHeader>
      </Link>
      <CardFooter className="mt-auto">
        <div className="w-full">
          {quantity === 0 ? (
            stock > 0 ? (
              <Button
                variant="buy"
                className={
                  'w-full transition-all duration-300 animate-in fade-in zoom-in-95 p-5 font-bold text-lg'
                }
                onClick={() => buyItem(product)}
              >
                BUY
              </Button>
            ) : (
              <Button
                variant="disabledBuy"
                className={'p-5 w-full font-bold text-lg'}
              >
                BUY
              </Button>
            )
          ) : (
            <QuantityController product={product} />
          )}
        </div>
      </CardFooter>
    </Card>
  )
}

export function QuantityController({
  product,
  className,
}: QuantityControllerProps) {
  const quantity = useCartStore(
    (state) => state.items.find((i) => i._id === product._id)?.quantity || 0
  )
  const quantityHandler = useCartStore((state) => state.updateQuantity)
  return (
    <div
      className={cn(
        'flex justify-around items-center w-full bg-aegean-dark text-primary-foreground rounded-2xl px-2 py-1 transition-all duration-300',
        className
      )}
    >
      <Button
        variant="buy"
        className="font-bold text-xl rounded-xl "
        onClick={() => quantityHandler(product._id, -1)}
      >
        -
      </Button>
      <span className="font-bold text-lg">{quantity}</span>
      <Button
        variant="buy"
        className="font-bold text-xl rounded-xl"
        onClick={() => quantityHandler(product._id, +1)}
      >
        +
      </Button>
    </div>
  )
}
