import { QuantityController } from '@/app/products/components/productCard'
import { useCartStore } from '@/app/products/store/useCartStore'
import Image from 'next/image'
import Link from 'next/link'
import { SheetClose } from '@/components/ui/sheet'
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
    <div className="relative flex flex-col sm:grid sm:grid-cols-12 items-center bg-aegean-gray p-4 sm:p-3 my-3 gap-3 rounded-xl shadow-sm border border-aegean-dark/5 hover:border-aegean-blue/20 transition-all">
      <SheetClose className="w-full sm:col-span-5">
        <Link
          href={`/products/${item._id}`}
          className="flex items-center gap-4 sm:grid sm:grid-cols-5 sm:gap-3 hover:opacity-80 transition-opacity"
        >
          <div className="sm:col-span-2 flex justify-center shrink-0">
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border border-gray-100 bg-white">
              <Image
                src={item.image}
                alt={item.name}
                fill
                className="object-contain p-1"
              />
            </div>
          </div>

          <div className="sm:col-span-3 flex flex-col justify-center">
            <h1 className="font-bold text-sm sm:text-xs md:text-sm leading-tight text-aegean-dark uppercase tracking-tight line-clamp-2">
              {item.name}
            </h1>
            <span className="sm:hidden text-xs text-gray-500 mt-1">
              {item.price.toFixed(2)}€ / μονάδα
            </span>
          </div>
        </Link>
      </SheetClose>

      <div className="flex items-center justify-between w-full sm:col-span-7 gap-2 mt-2 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-none border-gray-100">
        <div className="flex-1 sm:col-span-3 flex justify-center">
          <QuantityController
            product={item as CartItem}
            className="w-full max-w-28 py-1.5 bg-aegean-blue text-black rounded-lg shadow-sm"
          />
        </div>

        <div className="flex-1 sm:col-span-2 text-center sm:text-right">
          <p className="text-[10px] uppercase text-gray-400 font-medium sm:hidden">
            Σύνολο
          </p>
          <h3 className="font-bold text-base sm:text-sm text-aegean-dark">
            {(item.price * item.quantity).toFixed(2)}€
          </h3>
        </div>

        <div className="sm:col-span-2 flex justify-end">
          <button
            onClick={(e) => {
              e.preventDefault()
              removeCartItem(item._id)
            }}
            className="p-2.5 text-red-500 bg-red-50 rounded-xl hover:bg-red-500 hover:text-white active:scale-95 transition-all shadow-sm hover:cursor-pointer"
            aria-label="Remove item"
          >
            <svg
              className="w-5 h-5 sm:w-4 sm:h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
