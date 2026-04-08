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
    <div className="flex flex-col gap-4">
      <Button onClick={() => setOpen(true)} variant="outline" className="w-fit">
        Open Menu
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <div className="flex justify-around items-baseline">
          <Command>
            <CommandInput placeholder="Search Products..." />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup heading="Suggestions">
                <CommandItem>Calendar</CommandItem>
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
