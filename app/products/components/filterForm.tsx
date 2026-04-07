'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'

interface FilterFormProps {
  minPrice: number
  maxPrice: number
  manufacturers: string[]
  totalStock: number
  maxRating: number
}

export default function FilterForm({
  minPrice,
  maxPrice,
  manufacturers,
  totalStock,
  maxRating,
}: FilterFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  // --- STATE ΓΙΑ ΤΙΜΗ (Slider + Input) ---
  const [priceInput, setPriceInput] = useState(
    searchParams.get('maxPrice') || maxPrice.toString()
  )

  // --- HELPER ΓΙΑ URL UPDATE ---
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

  // --- HANDLERS ---
  const handleManufacturerToggle = (brand: string) => {
    const current = searchParams.getAll('manufacturer')
    const next = current.includes(brand)
      ? current.filter((b) => b !== brand)
      : [...current, brand]
    updateURL({ manufacturer: next })
  }

  return (
    <div className="flex flex-col gap-8 py-4">
      {/* 1. PRICE (Slider & Number Input) */}
      <div className="space-y-4">
        <h4 className="font-bold text-sm">Price Range</h4>
        <div className="flex items-center gap-4">
          <input
            type="number"
            value={priceInput}
            onChange={(e) => setPriceInput(e.target.value)}
            onBlur={() => updateURL({ maxPrice: priceInput })}
            className="w-20 p-1 border rounded text-sm hover:cursor-pointer "
          />
          <span className="text-xs text-gray-500">Up to {maxPrice}€</span>
        </div>
        <input
          type="range"
          min={minPrice}
          max={maxPrice}
          value={priceInput}
          onChange={(e) => setPriceInput(e.target.value)}
          onMouseUp={() => updateURL({ maxPrice: priceInput })}
          className="w-full accent-aegean-green hover:cursor-pointer "
        />
      </div>

      {/* 2. RATING (Κάθετη διάταξη με αστεράκια) */}
      <div className="space-y-3">
        <h4 className="font-bold text-sm uppercase text-gray-700 tracking-wider">
          Βαθμολογία
        </h4>
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
                className={`flex items-center gap-3 p-2 rounded-md transition-all group hover:bg-gray-50 hover:cursor-pointer ${
                  isSelected
                    ? 'bg-aegean-green/10 ring-1 ring-aegean-green/30'
                    : ''
                }`}
              >
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((index) => (
                    <span
                      key={index}
                      className={`text-lg transition-colors ${
                        index <= starCount ? 'text-yellow-400' : 'text-gray-200'
                      }`}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* 3. STOCK (Checkbox) */}
      <div className="space-y-2">
        <h4 className="font-bold text-sm">Availability</h4>
        <label className="flex items-center gap-2 cursor-pointer text-sm">
          <input
            type="checkbox"
            checked={searchParams.get('onlyInStock') === 'true'}
            onChange={(e) =>
              updateURL({ onlyInStock: e.target.checked ? 'true' : null })
            }
            className="w-4 h-4 accent-aegean-green"
          />
          Show only in-stock items
        </label>
      </div>

      {/* 4. MANUFACTURERS (Multiple Selection) */}
      <div className="space-y-2">
        <h4 className="font-bold text-sm">Manufacturers</h4>
        <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-2">
          {manufacturers.map((m) => (
            <label
              key={m}
              className="flex items-center gap-2 text-sm cursor-pointer group"
            >
              <input
                type="checkbox"
                checked={searchParams.getAll('manufacturer').includes(m)}
                onChange={() => handleManufacturerToggle(m)}
                className="w-4 h-4 accent-aegean-green"
              />
              <span className="group-hover:text-aegean-green">{m}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  )
}
