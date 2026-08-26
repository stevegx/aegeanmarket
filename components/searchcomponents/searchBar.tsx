'use client'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import SearchCategories from './searchCategories'
import { useRouter } from 'next/navigation'
import ProductImage from '@/components/productImage'

interface SearchProduct {
  _id: string
  name: string
  image: string
  price: number
}

export interface SearchBarProps {
  categories: string[]
}

export default function SearchBar({ categories }: SearchBarProps) {
  const [open, setOpen] = useState<boolean>(false)
  const [searchInput, setSearchInput] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false) // Loading state για το API
  const [results, setResults] = useState({
    products: [] as SearchProduct[],
    categories: [] as string[],
    manufacturer: [] as string[],
  })
  const router = useRouter()

  useEffect(() => {
    if (searchInput?.length < 2) {
      // Clears results left over from the previous (longer) query.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setResults({ products: [], categories: [], manufacturer: [] })
      setIsLoading(false)
      return
    }

    setIsLoading(true) // Ξεκινάει το φόρτωμα
    const timer = setTimeout(() => {
      fetch(`/api/quick-search?q=${searchInput}`)
        .then((res) => res.json())
        .then((data) => {
          setResults(data)
          setIsLoading(false) // Τελείωσε το φόρτωμα
        })
        .catch((err) => {
          console.error('Search error:', err)
          setIsLoading(false)
        })
    }, 300)

    return () => clearTimeout(timer)
  }, [searchInput])

  const handleSearch = () => {
    if (searchInput.length > 2) {
      router.push(`/products?q=${encodeURIComponent(searchInput)}`)
      setOpen(false)
      setSearchInput('')
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between w-full max-w-2xl mx-auto rounded-2xl bg-muted shadow-sm border border-border focus-within:border-aegean-green/30 focus-within:bg-background focus-within:shadow-md transition-all duration-300 overflow-hidden cursor-pointer">
        <div className="flex-1 cursor-pointer">
          <Button
            onClick={() => setOpen(true)}
            variant="ghost"
            className="w-full h-12 justify-start gap-4 px-5 border-none hover:bg-transparent active:scale-[0.98] transition-transform cursor-pointer"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-muted-foreground cursor-pointer"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <span className="text-foreground font-medium text-sm tracking-tight hidden md:block cursor-pointer">
              Search for products
            </span>
          </Button>
        </div>
        <div className="h-6 w-[1.5px] bg-linear-to-b from-transparent via-border to-transparent opacity-50 hidden sm:block" />
        <div className="px-1 py-1 cursor-pointer">
          <SearchCategories categories={categories} />
        </div>
      </div>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <div className="flex flex-col">
          <Command shouldFilter={false}>
            <div className="relative flex items-center w-full pr-2">
              <CommandInput
                placeholder="Search Products..."
                className="w-full"
                value={searchInput}
                onValueChange={(v) => setSearchInput(v)}
                onSearchIconClick={handleSearch}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && searchInput?.length >= 2) {
                    router.push(
                      `/products?q=${encodeURIComponent(searchInput)}`
                    )
                    setOpen(false)
                    setSearchInput('')
                  }
                }}
              />

              <SearchCategories categories={categories} />
            </div>

            <CommandList>
              <CommandEmpty>
                {isLoading ? (
                  <div className="absolute right-1/2 top-1/2 -translate-y-1/2 text-aegean-green">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
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
                  </div>
                ) : (
                  `No results found for "${searchInput}"`
                )}
              </CommandEmpty>

              <CommandGroup heading="Suggestions" className="overflow-y-auto">
                {results.categories?.map((category) => (
                  <CommandItem
                    key={`category-${category}`}
                    value={category}
                    onSelect={() => {
                      router.push(
                        `/products?category=${encodeURIComponent(category)}`
                      )
                      setSearchInput('')
                      setOpen(false)
                    }}
                  >
                    <span className="hover:pointer-cursor">{category}</span>
                  </CommandItem>
                ))}

                {results.manufacturer?.map((m) => (
                  <CommandItem
                    key={`manufacturer-${m}`}
                    value={m}
                    onSelect={() => {
                      router.push(
                        `/products?manufacturer=${encodeURIComponent(m)}`
                      )
                      setSearchInput('')
                      setOpen(false)
                    }}
                  >
                    <span className="hover:pointer-cursor">{m}</span>
                  </CommandItem>
                ))}

                {results.products?.map((product) => (
                  <CommandItem
                    key={product._id}
                    value={product.name}
                    onSelect={() => {
                      router.push(`/products/${product._id}`)
                      setSearchInput('')
                      setOpen(false)
                    }}
                  >
                    <div className="flex justify-between items-center w-full hover:cursor-pointer gap-2">
                      <div className="flex items-center gap-2">
                        <ProductImage
                          src={product.image}
                          height={40}
                          width={40}
                          alt={product.name}
                          className="aspect-square object-contain bg-muted rounded-md"
                        />
                        <span>{product.name}</span>
                      </div>
                      <span className="text-aegean-blue font-bold">
                        {product.price}€
                      </span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </div>
      </CommandDialog>
    </div>
  )
}
