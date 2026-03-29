'use client'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useCartStore } from '../store/useCartStore'
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

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

export default function ProductCard({ product }: ProductProps) {
  const buyItem = useCartStore((state) => state.addItem)
  const quantityHandler = useCartStore((state) => state.updateQuantity)
  const quantity = useCartStore(
    (state) => state.items.find((i) => i._id === product._id)?.quantity || 0
  )
  const stock = product.stock
  return (
    <Card
      className="mx-auto w-full max-w-sm pt-0 my-10 hover:shadow-xl hover:cursor-pointer"
      id={product._id}
    >
      {stock > 0 ? (
        <Image
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover"
          width={500}
          height={500}
        />
      ) : (
        <div className="relative">
          <span className="z-10 absolute text-4xl font-bold text-aegean-gray bottom-30 left-15">
            OUT OF STOCK
          </span>
          <Image
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover grayscale-100"
            width={500}
            height={500}
          />
        </div>
      )}

      <CardHeader>
        <CardAction>
          <Badge variant="secondary" className="text-md">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className={`text-lg leading-none ${star <= product.rating ? 'text-yellow-500' : 'text-gray-300'}`}
              >
                ★
              </span>
            ))}
          </Badge>
        </CardAction>
        <CardTitle>{product.name}</CardTitle>
        <CardDescription>{product.description}</CardDescription>
      </CardHeader>
      <CardFooter>
        {quantity === 0 ? (
          stock > 0 ? (
            <Button
              variant="buy"
              className={
                'transition-all duration-300 animate-in fade-in zoom-in-95 p-5'
              }
              onClick={() => buyItem(product)}
            >
              BUY
            </Button>
          ) : (
            <Button variant="disabledBuy" className={'p-5'}>
              BUY
            </Button>
          )
        ) : (
          <div className="flex justify-around items-center w-full bg-aegean-dark text-primary-foreground cursor-pointer rounded-2xl px-2 py-1 transition-all duration-300 animate-in slide-in-from-left-40 fade-in">
            <Button
              variant="buy"
              className="font-bold text-xl rounded-xl hover:bg-aegean-light/20"
              onClick={() => quantityHandler(product._id, -1)}
            >
              -
            </Button>
            <span className="font-bold text-lg">{quantity}</span>
            <Button
              variant="buy"
              className="font-bold text-xl rounded-xl hover:bg-aegean-light/20"
              onClick={() => quantityHandler(product._id, +1)}
            >
              +
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  )
}
