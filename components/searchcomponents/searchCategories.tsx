'use client'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { SearchBarProps } from './searchBar'

export default function SearchCategories({ categories }: SearchBarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const activeCat = searchParams.get('category')
  const [loadingCategory, setLoadingCategory] = useState<string | null>(null)

  useEffect(() => {
    setLoadingCategory(null)
  }, [searchParams])

  const handleFilter = (category: string) => {
    setLoadingCategory(category)
    const params = new URLSearchParams(searchParams.toString())
    if (activeCat === category) {
      params.delete('category')
    } else {
      params.set('category', category)
    }
    params.set('page', '1')
    router.push(`/products/?${params.toString()}`)
  }

  return (
    <div>
      <Sheet onOpenChange={(open) => !open && setLoadingCategory(null)}>
        <SheetTrigger>
          <div className="inline-flex items-center justify-center rounded-md bg-secondary px-3 hover:cursor-pointer gap-2 text-secondary-foreground hover:bg-secondary/80 h-10">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
            <span className="font-medium text-sm md:block hidden">
              Categories
            </span>
          </div>
        </SheetTrigger>

        <SheetContent>
          <SheetHeader>
            <SheetTitle>Categories</SheetTitle>
            <SheetDescription>Select a category</SheetDescription>
          </SheetHeader>

          <div className="flex flex-col gap-2 py-4 overflow-y-auto">
            {categories.length > 0 ? (
              categories.map((cat) => (
                <Button
                  key={cat}
                  variant="ghost"
                  disabled={loadingCategory === cat}
                  onClick={() => handleFilter(cat)}
                  className={`justify-between uppercase text-xs hover:cursor-pointer p-2 py-6 ${
                    activeCat === cat
                      ? 'bg-aegean-green text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <span className="truncate">{cat}</span>
                  {loadingCategory === cat && (
                    <svg
                      className="animate-spin h-4 w-4 text-current"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                  )}
                </Button>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center">
                No categories found
              </p>
            )}
          </div>

          <SheetFooter>
            <SheetClose>
              <Button variant="outline" className="w-full">
                Close
              </Button>
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  )
}
