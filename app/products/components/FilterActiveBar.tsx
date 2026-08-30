'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { HugeiconsIcon } from '@hugeicons/react'
import { Cancel01Icon } from '@hugeicons/core-free-icons'

const FILTER_KEYS = [
  'category',
  'minPrice',
  'maxPrice',
  'manufacturer',
  'minRating',
  'onlyInStock',
  'volume',
  'origin',
] as const

interface Chip {
  key: string
  value?: string
  label: string
}

export default function FilterActiveBar() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const chips: Chip[] = []

  const category = searchParams.get('category')
  if (category) {
    chips.push({
      key: 'category',
      label: category.charAt(0) + category.slice(1).toLowerCase(),
    })
  }

  const minPrice = searchParams.get('minPrice')
  if (minPrice) chips.push({ key: 'minPrice', label: `From ${minPrice}€` })

  const maxPrice = searchParams.get('maxPrice')
  if (maxPrice) chips.push({ key: 'maxPrice', label: `Up to ${maxPrice}€` })

  searchParams.getAll('manufacturer').forEach((m) => {
    chips.push({ key: 'manufacturer', value: m, label: m })
  })

  const minRating = searchParams.get('minRating')
  if (minRating) chips.push({ key: 'minRating', label: `${minRating}★ & up` })

  if (searchParams.get('onlyInStock') === 'true')
    chips.push({ key: 'onlyInStock', label: 'In stock' })

  searchParams.getAll('volume').forEach((v) => {
    chips.push({ key: 'volume', value: v, label: v })
  })

  const origin = searchParams.get('origin')
  if (origin) chips.push({ key: 'origin', label: origin })

  if (chips.length === 0) return null

  const removeChip = (chip: Chip) => {
    const params = new URLSearchParams(searchParams.toString())
    if (chip.value !== undefined) {
      const remaining = params
        .getAll(chip.key)
        .filter((v) => v !== chip.value)
      params.delete(chip.key)
      remaining.forEach((v) => params.append(chip.key, v))
    } else {
      params.delete(chip.key)
    }
    params.set('page', '1')
    router.push(`?${params.toString()}`, { scroll: false })
  }

  const clearAll = () => {
    const params = new URLSearchParams(searchParams.toString())
    FILTER_KEYS.forEach((k) => params.delete(k))
    params.set('page', '1')
    router.push(`?${params.toString()}`, { scroll: false })
  }

  return (
    <div className="space-y-2 border-b border-border px-4 pb-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Active filters
        </span>
        <button
          type="button"
          onClick={clearAll}
          className="text-xs font-semibold text-destructive transition-colors hover:cursor-pointer hover:underline"
        >
          Clear all
        </button>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {chips.map((chip) => (
          <button
            key={`${chip.key}:${chip.value ?? ''}`}
            type="button"
            onClick={() => removeChip(chip)}
            className="group flex items-center gap-1 rounded-full bg-aegean-dark/10 py-1 pl-2.5 pr-1.5 text-xs font-medium text-aegean-dark transition-colors hover:cursor-pointer hover:bg-aegean-dark/20"
          >
            <span className="max-w-32 truncate">{chip.label}</span>
            <HugeiconsIcon
              icon={Cancel01Icon}
              strokeWidth={2.5}
              className="size-3 shrink-0 opacity-60 group-hover:opacity-100"
            />
          </button>
        ))}
      </div>
    </div>
  )
}
