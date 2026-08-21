'use client'

import { useTransition, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  adminSearchProducts,
  type AdminProductOption,
} from '@/app/actions/adminSearchProducts'

export type EditableItem = {
  productId: string
  name: string
  priceAtpurchase: number
  quantity: number
}

export default function OrderItemsEditor({
  items,
  onChange,
}: {
  items: EditableItem[]
  onChange: (items: EditableItem[]) => void
}) {
  const [, startTransition] = useTransition()
  const [productQuery, setProductQuery] = useState('')
  const [productResults, setProductResults] = useState<AdminProductOption[]>(
    []
  )

  const total = items.reduce(
    (sum, i) => sum + i.priceAtpurchase * i.quantity,
    0
  )

  const handleSearch = (value: string) => {
    setProductQuery(value)
    if (value.trim().length < 2) {
      setProductResults([])
      return
    }
    startTransition(async () => {
      const results = await adminSearchProducts(value)
      setProductResults(
        results.filter((p) => !items.some((i) => i.productId === p._id))
      )
    })
  }

  const addItem = (product: AdminProductOption) => {
    onChange([
      ...items,
      {
        productId: product._id,
        name: product.name,
        priceAtpurchase: product.price,
        quantity: 1,
      },
    ])
    setProductQuery('')
    setProductResults([])
  }

  const removeItem = (productId: string) => {
    onChange(items.filter((i) => i.productId !== productId))
  }

  const updateQuantity = (productId: string, quantity: number) => {
    onChange(
      items.map((i) => (i.productId === productId ? { ...i, quantity } : i))
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <span className="text-sm font-medium">Items</span>

      {items.length === 0 && (
        <p className="text-xs text-muted-foreground">
          No items yet — search below to add one.
        </p>
      )}

      {items.map((item) => (
        <div key={item.productId} className="flex items-center gap-3 text-sm">
          <span className="flex-1">{item.name}</span>
          <span className="text-muted-foreground text-xs">
            €{item.priceAtpurchase.toFixed(2)}
          </span>
          <input
            type="number"
            min={1}
            value={item.quantity}
            onChange={(e) =>
              updateQuantity(
                item.productId,
                Math.max(1, Number(e.target.value) || 1)
              )
            }
            className="w-16 px-2 py-1.5 border rounded-md text-sm"
          />
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => removeItem(item.productId)}
            disabled={items.length === 1}
          >
            ✕
          </Button>
        </div>
      ))}

      <div className="relative">
        <input
          value={productQuery}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Add a product..."
          className="w-full px-3 py-2 text-sm border rounded-md"
        />
        {productResults.length > 0 && (
          <div className="absolute z-10 w-full bg-popover ring-1 ring-foreground/10 rounded-md mt-1 max-h-40 overflow-y-auto">
            {productResults.map((p) => (
              <button
                key={p._id}
                type="button"
                onClick={() => addItem(p)}
                className="w-full text-left px-3 py-2 text-sm hover:bg-muted flex justify-between"
              >
                <span>{p.name}</span>
                <span className="text-muted-foreground text-xs">
                  €{p.price.toFixed(2)} · stock {p.stock}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="text-right text-base font-bold">
        Total: €{total.toFixed(2)}
      </div>
    </div>
  )
}
