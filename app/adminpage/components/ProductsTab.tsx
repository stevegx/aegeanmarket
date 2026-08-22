'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import PaginationControls from '@/app/products/components/PaginationControls'
import type { AdminProductListItem } from '@/lib/db'
import ProductEditDialog from './ProductEditDialog'
import CreateProductDialog from './CreateProductDialog'

interface ProductsTabProps {
  products: AdminProductListItem[]
  totalPages: number
  currentPage: number
  search?: string
}

export default function ProductsTab({
  products,
  totalPages,
  currentPage,
  search,
}: ProductsTabProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchInput, setSearchInput] = useState(search ?? '')

  const updateParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('tab', 'products')
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === '') params.delete(key)
      else params.set(key, value)
    })
    params.set('productPage', '1')
    router.push(`?${params.toString()}`, { scroll: false })
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== (search ?? '')) {
        updateParams({ productSearch: searchInput })
      }
    }, 400)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput])

  return (
    <div className="w-full flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search by name, category or manufacturer..."
          className="flex-1 min-w-64 px-3 py-2 text-sm border rounded-md"
        />

        <CreateProductDialog />
      </div>

      <div className="w-full overflow-x-auto rounded-lg ring-1 ring-foreground/10">
        <Table className="text-sm">
          <TableHeader>
            <TableRow>
              <TableHead></TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead></TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  No products found
                </TableCell>
              </TableRow>
            )}
            {products.map((product) => (
              <TableRow key={product._id}>
                <TableCell>
                  <div className="relative size-10 rounded-md overflow-hidden ring-1 ring-foreground/10 bg-muted">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover"
                      sizes="40px"
                    />
                  </div>
                </TableCell>
                <TableCell className="max-w-xs truncate">
                  {product.name}
                </TableCell>
                <TableCell>{product.category}</TableCell>
                <TableCell>{product.price.toFixed(2)}&euro;</TableCell>
                <TableCell>{product.stock}</TableCell>
                <TableCell>{product.rating.toFixed(1)}</TableCell>
                <TableCell>
                  {product.isFeatured && (
                    <Badge variant="secondary">Featured</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <ProductEditDialog product={product} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          paramName="productPage"
        />
      )}
    </div>
  )
}
