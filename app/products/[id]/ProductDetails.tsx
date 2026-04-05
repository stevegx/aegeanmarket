'use client'

import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { QuantityController } from '../components/productCard'
import { useCartStore } from '../store/useCartStore'
import { PageProduct } from './page'
import Link from 'next/link'

export default function ProductDetails({ product }: { product: PageProduct }) {
  const buyItem = useCartStore((state) => state.addItem)
  const cartItems = useCartStore((state) => state.items)

  const quantity = cartItems.find((i) => i._id === product._id)?.quantity || 0

  return (
    <div className="flex flex-col lg:flex-row p-5 md:p-10 max-w-7xl mx-auto w-full items-center">
      <div className="w-full flex items-center justify-around rounded-lg p-4">
        <Image
          src={product.image}
          alt={product.name}
          className="object-contain"
          quality={85}
          priority
          height={400}
          width={400}
        />
      </div>

      <div className="w-full flex flex-col">
        <div className="space-y-2">
          <div className="flex items-center space-x-2 mb-4">
            <Link
              href="/products"
              className="text-gray-500 hover:text-blue-600 text-sm font-medium uppercase tracking-wider transition-colors"
            >
              Products
            </Link>
            <span className="text-gray-400 text-sm">/</span>
            <Link
              href={`/products?category=${product.category}`}
              className="text-blue-600 hover:text-blue-700 text-sm font-semibold uppercase tracking-wider transition-colors"
            >
              {product.category}
            </Link>
          </div>
          <h1 className="font-bold text-3xl md:text-4xl text-gray-900 leading-tight">
            {product.name}
          </h1>
          <div className="flex items-baseline justify-start gap-5">
            <div className="flex items-center gap-2 border w-fit rounded-full px-3 py-1 bg-white shadow-sm mt-2">
              <span className="font-bold text-lg">{product.rating}</span>
              <span className="text-yellow-500 text-xl">★</span>
            </div>
            {product.stock === 0 ? (
              <div className=" text-red-500  font-bold text-sm">
                ● OUT OF STOCK
              </div>
            ) : (
              <></>
            )}
          </div>
        </div>

        <div className="mt-6">
          <h2 className="font-extrabold text-3xl text-gray-900">
            {product.price} €
          </h2>
          <p className="text-gray-600 font-light mt-4 leading-relaxed line-clamp-4 lg:line-clamp-none">
            {product.description}
          </p>
        </div>

        <hr className="my-6 border-gray-100" />

        <div className="w-full">
          {quantity === 0 ? (
            product.stock > 0 ? (
              <Button
                variant="buy"
                className="w-full transition-all duration-300 animate-in fade-in zoom-in-95 p-5"
                onClick={() => buyItem(product)}
              >
                BUY
              </Button>
            ) : (
              <Button variant="disabledBuy" className="p-5 w-full" disabled>
                BUY
              </Button>
            )
          ) : (
            <QuantityController product={product} />
          )}
        </div>

        <hr className="my-6 border-gray-100" />

        <div className="border rounded-xl divide-y divide-gray-100 overflow-hidden">
          {/* Free Delivery Section */}
          <div className="flex items-start p-4 gap-4 bg-white">
            <div className="mt-1 text-gray-600">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="w-8 h-8"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.806H14.25M16.5 18.75h-2.25m0-11.25v11.25m-10.5-11.25h10.5a2.25 2.25 0 0 1 2.25 2.25v6.75a2.25 2.25 0 0 1-2.25 2.25H3.75a2.25 2.25 0 0 1-2.25-2.25V9.75a2.25 2.25 0 0 1 2.25-2.25Z"
                />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-lg">Free Delivery</h3>
              <p className="text-sm text-gray-500 font-light">
                Enter your postal code for delivery Availability
              </p>
            </div>
          </div>

          {/* Return Delivery Section */}
          <div className="flex items-start p-4 gap-4 bg-white">
            <div className="mt-1 text-gray-600">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="w-8 h-8"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3"
                />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-lg">Return Delivery</h3>
              <p className="text-sm text-gray-500 font-light">
                Free 30 Days Delivery Returns.{' '}
                <span className="underline cursor-pointer hover:text-black transition-colors">
                  Details
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
