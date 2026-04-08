import { QuantityController } from '@/app/products/components/productCard'
import { useCartStore } from '@/app/products/store/useCartStore'
import Image from 'next/image'

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
    <div className="grid grid-cols-12 items-center bg-aegean-gray p-3 my-4 gap-2 rounded-lg shadow-sm border border-aegean-dark/5">
      <div className="col-span-2 flex justify-center">
        <Image
          src={item.image}
          alt={item.name}
          width={80}
          height={80}
          className="rounded-md object-cover border"
        />
      </div>

      <div className="col-span-3 px-2">
        <h1 className="font-bold text-sm leading-tight line-clamp-2 uppercase tracking-tighter">
          {item.name}
        </h1>
      </div>

      {/* 3. Controller (3/12 του χώρου) */}
      <div className="col-span-3 flex justify-center">
        <QuantityController
          product={item as any}
          className="w-full max-w-25 py-1 text-xs bg-aegean-dark"
        />
      </div>

      <div className="col-span-2 text-right px-2">
        <h3 className="font-medium text-sm">
          {(item.price * item.quantity).toFixed(2)}€
        </h3>
      </div>

      <div className="col-span-2 flex justify-end">
        <button
          onClick={() => removeCartItem(item._id)}
          className="p-2 text-red-500/90 bg-red-400/20 rounded-4xl hover:text-red-700 hover:bg-red-300 hover:cursor-pointer active:text-red500/60 active:bg-red-600/60  transition-colors"
        >
          <svg
            className="w-5 h-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
        </button>
      </div>
    </div>
  )
}
