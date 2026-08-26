'use client'
import { useState, useTransition } from 'react'
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
import { CATEGORY_TAXONOMY, Subcategory } from './categoryTaxonomy'

export default function SearchCategories({ categories }: SearchBarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const activeCat = searchParams.get('category')
  const activeQuery = searchParams.get('q')
  const [isPending, startTransition] = useTransition()
  const [pendingKey, setPendingKey] = useState<string | null>(null)
  const [expandedCategory, setExpandedCategory] = useState<string | null>(
    activeCat
  )

  const handleFilter = (category: string) => {
    setPendingKey(category)
    setExpandedCategory(category)
    const params = new URLSearchParams(searchParams.toString())
    params.delete('q')
    if (activeCat === category) {
      params.delete('category')
    } else {
      params.set('category', category)
    }
    params.set('page', '1')
    startTransition(() => {
      router.push(`/products/?${params.toString()}`)
    })
  }

  const handleSubFilter = (category: string, sub: Subcategory) => {
    const key = `${category}-${sub.label}`
    setPendingKey(key)
    setExpandedCategory(category)
    const params = new URLSearchParams(searchParams.toString())
    const isActive = activeCat === category && activeQuery === sub.query
    if (isActive) {
      params.delete('category')
      params.delete('q')
    } else {
      params.set('category', category)
      params.set('q', sub.query)
    }
    params.set('page', '1')
    startTransition(() => {
      router.push(`/products/?${params.toString()}`)
    })
  }

  return (
    <div>
      <Sheet>
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
            <SheetDescription>Browse products by category</SheetDescription>
          </SheetHeader>

          <div className="flex flex-col gap-2 py-4 overflow-y-auto">
            {categories.length > 0 ? (
              categories.map((cat) => {
                const subcategories = CATEGORY_TAXONOMY[cat] ?? []
                const isExpanded = expandedCategory === cat
                const isCatActive = activeCat === cat && !activeQuery
                const isCatLoading = isPending && pendingKey === cat

                return (
                  <div
                    key={cat}
                    className="rounded-md overflow-hidden border border-border"
                  >
                    <div className="flex items-stretch">
                      <Button
                        variant="ghost"
                        disabled={isCatLoading}
                        onClick={() => handleFilter(cat)}
                        className={`flex-1 justify-between uppercase text-xs hover:cursor-pointer p-2 py-6 rounded-none ${
                          isCatActive
                            ? 'bg-aegean-green text-white'
                            : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                        }`}
                      >
                        <span className="truncate">{cat}</span>
                        {isCatLoading && (
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

                      {subcategories.length > 0 && (
                        <button
                          type="button"
                          aria-label={
                            isExpanded
                              ? `Collapse ${cat} subcategories`
                              : `Expand ${cat} subcategories`
                          }
                          onClick={() =>
                            setExpandedCategory(isExpanded ? null : cat)
                          }
                          className={`px-3 flex items-center justify-center hover:cursor-pointer transition-colors ${
                            isCatActive
                              ? 'bg-aegean-green text-white'
                              : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                          }`}
                        >
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                          >
                            <polyline points="6 9 12 15 18 9" />
                          </svg>
                        </button>
                      )}
                    </div>

                    {isExpanded && subcategories.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 p-2 bg-muted">
                        {subcategories.map((sub) => {
                          const key = `${cat}-${sub.label}`
                          const isSubActive =
                            activeCat === cat && activeQuery === sub.query
                          const isSubLoading = isPending && pendingKey === key
                          return (
                            <Button
                              key={key}
                              variant="ghost"
                              disabled={isSubLoading}
                              onClick={() => handleSubFilter(cat, sub)}
                              className={`rounded-full text-xs px-3 py-4 hover:cursor-pointer ${
                                isSubActive
                                  ? 'bg-aegean-dark text-white'
                                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                              }`}
                            >
                              {sub.label}
                              {isSubLoading && (
                                <svg
                                  className="animate-spin h-3 w-3 text-current"
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
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })
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
