import { QuantityController } from '@/app/products/components/productCard'
import { useCartStore } from '@/app/products/store/useCartStore'
import ProductImage from '@/components/productImage'
import Link from 'next/link'
import { SheetClose } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
type CartItem = {
  _id: string
  name: string
  price: number
  quantity: number
  stock: number
  image: string
}
interface CartItemsProps {
  item: CartItem
}
export default function CartItems({ item }: CartItemsProps) {
  const removeCartItem = useCartStore((state) => state.removeItem)
  return (
    <div className="relative flex flex-col sm:grid sm:grid-cols-12 items-center bg-muted p-4 sm:p-3 my-3 gap-3 rounded-xl shadow-sm border border-border hover:border-aegean-blue/20 transition-all">
      <SheetClose
        className="w-full sm:col-span-5"
        render={
          <Link
            href={`/products/${item._id}`}
            className="flex items-center gap-4 sm:grid sm:grid-cols-5 sm:gap-3 hover:opacity-80 transition-opacity"
          />
        }
      >
        <div className="sm:col-span-2 flex justify-center shrink-0">
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border border-border bg-card">
            <ProductImage
              src={item.image}
              alt={item.name}
              fill
              sizes="80px"
              className="object-contain p-1"
            />
          </div>
        </div>

        <div className="sm:col-span-3 flex flex-col justify-center">
          <h1 className="font-bold text-sm sm:text-xs md:text-sm leading-tight text-foreground uppercase tracking-tight line-clamp-2">
            {item.name}
          </h1>
          <span className="sm:hidden text-xs text-muted-foreground mt-1">
            {item.price.toFixed(2)}€ / unit
          </span>
        </div>
      </SheetClose>

      <div className="flex items-center justify-between w-full sm:col-span-7 gap-2 mt-2 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-none border-border">
        <div className="flex-1 sm:col-span-3 flex justify-center">
          <QuantityController product={item as CartItem} />
        </div>

        <div className="flex-1 sm:col-span-2 text-center sm:text-right">
          <p className="text-[10px] uppercase text-muted-foreground font-medium sm:hidden">
            Total
          </p>
          <h3 className="font-bold text-base sm:text-sm text-foreground">
            {(item.price * item.quantity).toFixed(2)}€
          </h3>
        </div>

        <div className="sm:col-span-2 flex justify-end">
          <Button
            variant="destructive"
            size="icon-lg"
            onClick={(e) => {
              e.preventDefault()
              removeCartItem(item._id)
            }}
            aria-label="Remove item"
          >
            <svg
              className="size-5 sm:size-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
          </Button>
        </div>
      </div>
    </div>
  )
}
