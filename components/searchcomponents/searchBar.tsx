'use client'
import { useState } from 'react'
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

export interface SearchBarProps {
  categories: string[]
}

export default function SearchBar({ categories }: SearchBarProps) {
  const [open, setOpen] = useState(false)

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
            <CommandInput placeholder="Search Products..." />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup heading="Suggestions">
                <CommandItem>Calendar</CommandItem>{' '}
                {/* edw tha mpoun ta search results*/}
                <CommandItem>Search Emoji</CommandItem>
                <CommandItem>Calculator</CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
          <SearchCategories categories={categories} />
        </div>
      </CommandDialog>
    </div>
  )
}
