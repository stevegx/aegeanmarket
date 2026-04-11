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
import Image from 'next/image'
export interface SearchBarProps {
  categories: string[]
}

export default function SearchBar({ categories }: SearchBarProps) {
  const [open, setOpen] = useState<boolean>(false)
  const [searchInput, setSearchInput] = useState<string>('')
  const [results, setResults] = useState({
    products: [] as any[],
    categories: [] as string[],
    manufacturer: [] as string[],
  })
  const router = useRouter()
  useEffect(() => {
    if (searchInput?.length < 2) {
      if (
        results.products.length > 0 ||
        results.categories.length > 0 ||
        results.manufacturer.length > 0
      ) {
        setResults({ products: [], categories: [], manufacturer: [] })
      }
      return
    }
    const timer = setTimeout(() => {
      fetch(`/api/quick-search?q=${searchInput}`)
        .then((res) => res.json())
        .then((data) => {
          setResults(data)
        })
        .catch((err) => console.error('Search error:', err))
    }, 300)
    console.log('TEST: ', results)
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
    <div className="flex flex-col gap-4 ">
      <div className="flex items-center justify-between w-full max-w-2xl mx-auto rounded-2xl bg-[#F3F4F6] shadow-sm border border-transparent focus-within:border-aegean-green/30 focus-within:bg-white focus-within:shadow-md transition-all duration-300 overflow-hidden cursor-pointer">
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
              className="text-gray-500 cursor-pointer"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <span className="text-gray-400 font-medium text-sm tracking-tight hidden md:block cursor-pointer">
              Search for products
            </span>
          </Button>
        </div>
        <div className="h-6 w-[1.5px] bg-linear-to-b from-transparent via-gray-300 to-transparent opacity-50 hidden sm:block" />
        <div className="px-1 py-1 cursor-pointer">
          <SearchCategories categories={categories} />
        </div>
      </div>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <div className="flex justify-around items-baseline">
          <Command shouldFilter={false}>
            <div className="flex justify-between w-full">
              <CommandInput
                placeholder="Search Products..."
                className="w-full"
                value={searchInput}
                onValueChange={(v) => setSearchInput(v)}
                onSearchIconClick={handleSearch}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    e.stopPropagation()
                    if (searchInput?.length >= 2) {
                      router.push(
                        `/products?q=${encodeURIComponent(searchInput)}`
                      )
                      setOpen(false)
                      setSearchInput('')
                    }
                  }
                }}
              />
              <SearchCategories categories={categories} />
            </div>
            <CommandList>
              <CommandEmpty>No results found for "{searchInput}"</CommandEmpty>

              <CommandGroup heading="Suggestions" className="overflow-y-auto">
                {results.categories?.length > 0 &&
                  results.categories.map((category) => (
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
                {results.manufacturer?.length > 0 &&
                  results.manufacturer.map((manufacturers) => (
                    <CommandItem
                      key={`manufacturer-${manufacturers}`}
                      value={manufacturers}
                      onSelect={() => {
                        router.push(
                          `/products?manufacturer=${encodeURIComponent(manufacturers)}`
                        )
                        setSearchInput('')
                        setOpen(false)
                      }}
                    >
                      <div>
                        <span className="hover:pointer-cursor">
                          {manufacturers}
                        </span>
                      </div>
                    </CommandItem>
                  ))}
                {results.products?.length > 0 &&
                  results.products.map((product) => (
                    <CommandItem
                      key={product._id}
                      value={product.name}
                      onSelect={() => {
                        router.push(`/products/${product._id}`)
                        setSearchInput('')
                        setOpen(false)
                      }}
                    >
                      <div className="flex justify-around items-center w-full hover:cursor-pointer gap-1">
                        <Image
                          src={product.image}
                          height={60}
                          width={60}
                          alt={product.name}
                          className="aspect-video"
                        />
                        <span>{product.name}</span>
                        <span className="text-gray-400">{product.price}€</span>
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
