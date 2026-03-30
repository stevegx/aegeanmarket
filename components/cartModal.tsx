import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { useCartStore } from '@/app/products/store/useCartStore'
import CartItems from './cart components/cartItems'

export default function CartModal() {
  const cartTotalItems = useCartStore((state) => state.getTotalItems())
  const cartToggle = useCartStore((state) => state.toggleCart)
  const cartItems = useCartStore((state) => state.items)
  const cartTotal = useCartStore((state) => state.getTotalPrice())
  console.log(cartItems)
  return (
    <Sheet>
      <SheetTrigger asChild>
        <button
          onClick={cartToggle}
          className="relative flex items-center justify-center w-10 h-10 rounded-full bg-aegean-light/30 hover:cursor-pointer transition-colors pr-1 active:bg-aegean-light"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24" // Σημαντικό για να ξέρει το SVG πώς να κεντραριστεί
            fill="currentColor"
          >
            <path d="M7 4h-2l-1 2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2h-11.42c-.14 0-.25-.11-.25-.25l.03-.12 .9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49a1 1 0 0 0-.87-1.48h-14.31l-.94-2zm3 16a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm10 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" />
          </svg>
          {cartTotalItems > 0 && (
            <span className="absolute -top-1.5 -right-2.5 flex h-5 w-5 items-center justify-center rounded-full bg-aegean-terracotta text-[11px] text-aegean-gray font-bold">
              {cartTotalItems}
            </span>
          )}
        </button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle className="font-bold text-2xl">
            Your Cart ({cartTotalItems})
          </SheetTitle>
        </SheetHeader>
        <div className="flex-row overflow-y-auto w-full h-full overflow-x-clip">
          {cartItems.map((items) => (
            <CartItems item={items} key={items._id} />
          ))}
        </div>
        <SheetFooter>
          <div className="flex items-center justify-between">
            <span className="text-l">
              Your Total is:{' '}
              <span className="font-bold text-xl">
                {Math.floor(cartTotal * 100) / 100} €
              </span>
            </span>
            <Button type="submit" variant={'buy'}>
              Checkout
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
