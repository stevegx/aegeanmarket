'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { ArrowDown01Icon, Search01Icon } from '@hugeicons/core-free-icons'
import { cn } from '@/lib/utils'

interface FilterFormProps {
  minPrice: number
  maxPrice: number
  manufacturers: string[]
  totalStock: number
  maxRating: number
  origin: string[]
  volume: string[]
}

function FilterSection({
  title,
  children,
  defaultOpen = true,
}: {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-b border-border last:border-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between py-3 hover:cursor-pointer"
      >
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          {title}
        </span>
        <HugeiconsIcon
          icon={ArrowDown01Icon}
          strokeWidth={2}
          className={cn(
            'size-4 text-muted-foreground transition-transform',
            open && 'rotate-180'
          )}
        />
      </button>
      {open && <div className="pb-4 pt-1">{children}</div>}
    </div>
  )
}

export default function FilterForm({
  minPrice,
  maxPrice,
  manufacturers,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- reserved for a future stock filter UI
  totalStock,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- reserved for a future rating filter UI
  maxRating,
  origin,
  volume,
}: FilterFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const updateURL = (newParams: Record<string, string | string[] | null>) => {
    const params = new URLSearchParams(searchParams.toString())
    Object.entries(newParams).forEach(([key, value]) => {
      if (value === null || value === '') {
        params.delete(key)
      } else if (Array.isArray(value)) {
        params.delete(key)
        value.forEach((v) => params.append(key, v))
      } else {
        params.set(key, value)
      }
    })
    params.set('page', '1')
    router.push(`?${params.toString()}`, { scroll: false })
  }

  // --- PRICE RANGE (dual handle) ---
  const [range, setRange] = useState<[number, number]>([
    Number(searchParams.get('minPrice')) || minPrice,
    Number(searchParams.get('maxPrice')) || maxPrice,
  ])

  const commitRange = ([lo, hi]: [number, number]) => {
    const clampedLo = Math.max(minPrice, Math.min(lo, maxPrice))
    const clampedHi = Math.min(maxPrice, Math.max(hi, clampedLo))
    if (clampedLo !== range[0] || clampedHi !== range[1]) {
      setRange([clampedLo, clampedHi])
    }
    updateURL({
      minPrice: clampedLo > minPrice ? String(clampedLo) : null,
      maxPrice: clampedHi < maxPrice ? String(clampedHi) : null,
    })
  }

  const clamp = (n: number) =>
    Math.max(0, Math.min(((n - minPrice) / (maxPrice - minPrice)) * 100, 100))
  const lowPct = clamp(range[0])
  const highPct = clamp(range[1])

  // --- MANUFACTURER SEARCH ---
  const [brandQuery, setBrandQuery] = useState('')
  const filteredBrands = manufacturers.filter((m) =>
    m.toLowerCase().includes(brandQuery.toLowerCase())
  )

  // --- HANDLERS ---
  const handleManufacturerToggle = (brand: string) => {
    const current = searchParams.getAll('manufacturer')
    const next = current.includes(brand)
      ? current.filter((b) => b !== brand)
      : [...current, brand]
    updateURL({ manufacturer: next })
  }

  const handleOriginSelect = (selectedOrigin: string) => {
    const current = searchParams.get('origin')
    updateURL({ origin: current === selectedOrigin ? null : selectedOrigin })
  }

  const handleVolumeToggle = (vol: string) => {
    const current = searchParams.getAll('volume')
    const next = current.includes(vol)
      ? current.filter((v) => v !== vol)
      : [...current, vol]
    updateURL({ volume: next })
  }

  return (
    <div className="flex flex-col">
      {/* PRICE */}
      <FilterSection title="Price">
        <div className="space-y-4 px-1">
          <div className="flex items-center justify-between text-sm font-semibold text-foreground">
            <span className="tabular-nums">{range[0]}€</span>
            <span className="tabular-nums">{range[1]}€</span>
          </div>

          <div className="relative h-5">
            <div className="absolute top-1/2 h-1.5 w-full -translate-y-1/2 rounded-full bg-muted" />
            <div
              className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-aegean-green"
              style={{ left: `${lowPct}%`, right: `${100 - highPct}%` }}
            />
            <input
              type="range"
              min={minPrice}
              max={maxPrice}
              value={range[0]}
              onChange={(e) => {
                const lo = Math.min(Number(e.target.value), range[1] - 1)
                setRange([lo, range[1]])
              }}
              onMouseUp={() => commitRange(range)}
              onTouchEnd={() => commitRange(range)}
              className="pointer-events-none absolute h-5 w-full appearance-none bg-transparent accent-aegean-green [&::-moz-range-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:cursor-pointer"
            />
            <input
              type="range"
              min={minPrice}
              max={maxPrice}
              value={range[1]}
              onChange={(e) => {
                const hi = Math.max(Number(e.target.value), range[0] + 1)
                setRange([range[0], hi])
              }}
              onMouseUp={() => commitRange(range)}
              onTouchEnd={() => commitRange(range)}
              className="pointer-events-none absolute h-5 w-full appearance-none bg-transparent accent-aegean-green [&::-moz-range-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:cursor-pointer"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="number"
              min={minPrice}
              max={range[1]}
              value={range[0]}
              onChange={(e) => setRange([Number(e.target.value), range[1]])}
              onBlur={() => commitRange(range)}
              className="w-full rounded border border-border bg-background p-1.5 text-sm text-foreground"
            />
            <span className="text-muted-foreground">–</span>
            <input
              type="number"
              min={range[0]}
              max={maxPrice}
              value={range[1]}
              onChange={(e) => setRange([range[0], Number(e.target.value)])}
              onBlur={() => commitRange(range)}
              className="w-full rounded border border-border bg-background p-1.5 text-sm text-foreground"
            />
          </div>
        </div>
      </FilterSection>

      {/* RATING */}
      <FilterSection title="Rating">
        <div className="flex flex-col gap-1">
          {[5, 4, 3, 2, 1].map((starCount) => {
            const isSelected =
              searchParams.get('minRating') === starCount.toString()
            return (
              <button
                key={starCount}
                type="button"
                onClick={() =>
                  updateURL({
                    minRating: isSelected ? null : starCount.toString(),
                  })
                }
                className={cn(
                  'flex items-center gap-2 rounded-md p-2 transition-all hover:cursor-pointer hover:bg-muted',
                  isSelected && 'bg-aegean-dark/10 ring-1 ring-aegean-dark/30'
                )}
              >
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((index) => (
                    <span
                      key={index}
                      className={cn(
                        'text-lg',
                        index <= starCount ? 'text-yellow-400' : 'text-muted'
                      )}
                    >
                      ★
                    </span>
                  ))}
                </div>
                <span className="text-xs text-muted-foreground">& up</span>
              </button>
            )
          })}
        </div>
      </FilterSection>

      {/* AVAILABILITY */}
      <FilterSection title="Availability">
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={searchParams.get('onlyInStock') === 'true'}
            onChange={(e) =>
              updateURL({ onlyInStock: e.target.checked ? 'true' : null })
            }
            className="h-4 w-4 accent-aegean-green"
          />
          Show only in-stock items
        </label>
      </FilterSection>

      {/* MANUFACTURERS */}
      <FilterSection title="Manufacturers">
        <div className="space-y-2">
          <div className="relative">
            <HugeiconsIcon
              icon={Search01Icon}
              strokeWidth={2}
              className="pointer-events-none absolute left-2 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <input
              type="text"
              value={brandQuery}
              onChange={(e) => setBrandQuery(e.target.value)}
              placeholder="Search brands…"
              className="w-full rounded border border-border bg-background py-1.5 pl-8 pr-2 text-sm text-foreground"
            />
          </div>
          <div className="custom-scrollbar flex max-h-48 flex-col gap-2 overflow-y-auto pr-2">
            {filteredBrands.length === 0 ? (
              <p className="py-2 text-xs text-muted-foreground">No matches</p>
            ) : (
              filteredBrands.map((m) => (
                <label
                  key={m}
                  className="flex cursor-pointer items-center gap-2 text-sm"
                >
                  <input
                    type="checkbox"
                    checked={searchParams.getAll('manufacturer').includes(m)}
                    onChange={() => handleManufacturerToggle(m)}
                    className="h-4 w-4 shrink-0 accent-aegean-green"
                  />
                  <span className="hover:text-aegean-green-text">{m}</span>
                </label>
              ))
            )}
          </div>
        </div>
      </FilterSection>

      {/* ORIGIN */}
      <FilterSection title="Origin" defaultOpen={false}>
        <div className="custom-scrollbar flex max-h-48 flex-col gap-2 overflow-y-auto pr-2">
          {origin.map((o) => {
            const isSelected = searchParams.get('origin') === o
            return (
              <label
                key={o}
                className="flex cursor-pointer items-center gap-2 text-sm"
              >
                <input
                  type="radio"
                  name="origin-group"
                  checked={isSelected}
                  onChange={() => handleOriginSelect(o)}
                  className="h-3.5 w-3.5 accent-aegean-green"
                />
                <span
                  className={cn(
                    'transition-colors',
                    isSelected
                      ? 'font-bold text-aegean-green-text'
                      : 'text-muted-foreground hover:text-aegean-green-text'
                  )}
                >
                  {o}
                </span>
              </label>
            )
          })}
        </div>
      </FilterSection>

      {/* VOLUME */}
      <FilterSection title="Volume" defaultOpen={false}>
        <div className="flex flex-wrap gap-2">
          {volume.map((v) => {
            const isSelected = searchParams.getAll('volume').includes(v)
            return (
              <button
                key={v}
                type="button"
                onClick={() => handleVolumeToggle(v)}
                className={cn(
                  'rounded-full border px-3 py-1 text-xs transition-all hover:cursor-pointer',
                  isSelected
                    ? 'border-aegean-dark bg-aegean-dark text-white'
                    : 'border-border bg-background text-muted-foreground hover:border-aegean-dark'
                )}
              >
                {v}
              </button>
            )
          })}
        </div>
      </FilterSection>
    </div>
  )
}
