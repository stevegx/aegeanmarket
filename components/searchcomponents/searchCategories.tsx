'use client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
  return (
    <div>
      <Sheet>
        <SheetTrigger>
          <div className="inline-flex items-center justify-center rounded-md bg-secondary px-4 py-2 hover:cursor-pointer mb-2 gap-2 text-secondary-foreground hover:bg-secondary/80 h-10">
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
            <span className="font-medium">Categories</span>
          </div>
        </SheetTrigger>

        <SheetContent>
          <SheetHeader>
            <SheetTitle>Categories</SheetTitle>
            <SheetDescription>Select a category</SheetDescription>
          </SheetHeader>

          <div className="flex flex-col gap-2 py-4">
            {categories.length > 0 ? (
              categories.map((cat) => (
                <Button
                  key={cat}
                  variant="ghost"
                  className="justify-start uppercase text-xs hover:cursor-pointer p-2 hover:bg-aegean-dark hover:text-aegean-gray"
                >
                  {cat}
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
              <div className="border border-input bg-background hover:bg-accent hover:text-accent-foreground px-4 py-2 rounded-md text-sm font-medium cursor-pointer">
                Close
              </div>
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  )
}
