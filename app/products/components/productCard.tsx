'use client'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useCartStore } from '../store/useCartStore'
import FavoriteButton from './FavoriteButton'
import { Card } from '@/components/ui/card'
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
      className="group mx-auto w-full h-[520px] max-w-sm my-2 flex flex-col gap-0 p-3 rounded-xl shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:cursor-pointer"
      id={product._id}
    >
      {/* Image sits on a soft rounded panel, ~58% of the card */}
      <Link
        href={`/products/${product._id}`}
        className="relative block h-[55%] w-full shrink-0 overflow-hidden rounded-xl bg-muted/60"
      >
        <FavoriteButton
          productId={product._id}
          className="absolute top-2.5 right-2.5 z-10 bg-background shadow-md"
        />
        {stock > 0 ? (
          <Image
            src={(product.image || '').trim().replace(/\s/g, '')}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 384px"
            className="object-contain p-4 transition-transform duration-500 group-hover:scale-105 dark:bg-white"
          />
        ) : (
          <>
            <span className="z-10 absolute text-xl font-bold text-white bg-black/70 px-3 py-1.5 rounded top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
              OUT OF STOCK
            </span>
            <Image
              src={(product.image || '').trim().replace(/\s/g, '')}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 384px"
              className="object-contain p-4 grayscale"
              loading="lazy"
            />
          </>
        )}
      </Link>

      <Link
        href={`/products/${product._id}`}
        className="flex grow min-h-0 flex-col gap-1 px-1 pt-3"
      >
        {/* Category */}
        <span className="text-sm font-semibold text-aegean-blue line-clamp-1">
          {product.category}
        </span>

        <h3 className="font-bold text-base leading-snug text-foreground line-clamp-2">
          {product.name}
        </h3>

        <div className="flex gap-0.5 text-base leading-none">
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              className={
                star <= product.rating
                  ? 'text-yellow-500'
                  : 'text-muted-foreground/30'
              }
            >
              ★
            </span>
          ))}
        </div>

        <p className="text-sm text-muted-foreground line-clamp-1">
          {product.description}
        </p>

        <span className="mt-auto text-xl font-extrabold text-foreground">
          {product.price.toFixed(2)} €
        </span>
      </Link>

      <div className="shrink-0 pt-3">
        {quantity === 0 ? (
          stock > 0 ? (
            <Button
              variant="buy"
              size="lg"
              className="w-full font-bold transition-all duration-300 animate-in fade-in zoom-in-95"
              onClick={() => buyItem(product)}
            >
              BUY
            </Button>
          ) : (
            <Button variant="disabledBuy" size="lg" className="w-full font-bold">
              BUY
            </Button>
          )
        ) : (
          <QuantityController
            product={product}
            className="w-full justify-center"
          />
        )}
      </div>
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

  // Minimal, borderless stepper: two round hit-areas with a soft light-blue
  // fill so they read as buttons against the near-white page, a plain numeral
  // between them. Sized to stay tidy in a card footer or order row.
  const stepBtn =
    'flex size-8 shrink-0 items-center justify-center rounded-full bg-aegean-light/35 text-lg leading-none text-aegean-dark transition-colors hover:bg-aegean-light/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 active:translate-y-px cursor-pointer dark:bg-aegean-light/10 dark:text-aegean-light dark:hover:bg-aegean-light/20'

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 transition-all duration-300',
        className
      )}
    >
      <button
        type="button"
        aria-label="Decrease quantity"
        className={stepBtn}
        onClick={() => quantityHandler(product._id, -1)}
      >
        {'−'}
      </button>
      <span className="min-w-8 text-center text-base font-semibold tabular-nums text-foreground">
        {quantity}
      </span>
      <button
        type="button"
        aria-label="Increase quantity"
        className={stepBtn}
        onClick={() => quantityHandler(product._id, +1)}
      >
        +
      </button>
    </div>
  )
}
