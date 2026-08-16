import * as React from 'react'
import { cn } from '@/lib/utils'

interface SliderProps {
  className?: string
  min?: number
  max?: number
  step?: number
  value?: string | number
  onChange?: (e: { target: { value: string } }) => void
  onMouseUp?: () => void
}

export function Slider({
  className,
  min = 0,
  max = 100,
  step = 1,
  value = 0,
  onChange,
  onMouseUp,
}: SliderProps) {
  const percentage = ((Number(value) - min) / (max - min)) * 100

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange({ target: { value: e.target.value } })
    }
  }

  return (
    <div
      className={cn(
        'relative flex w-full items-center py-4 select-none',
        className
      )}
    >
      <div className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-gray-200">
        <div
          className="absolute h-full bg-aegean-blue transition-all duration-75"
          style={{ width: `${percentage}%` }}
        />
      </div>

      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={handleChange}
        onMouseUp={onMouseUp}
        className="absolute w-full h-1.5 opacity-0 cursor-pointer appearance-none z-20"
      />

      <div
        className="absolute h-5 w-5 rounded-full border-2 border-aegean-blue bg-white shadow-md pointer-events-none z-10 transition-all duration-75"
        style={{
          left: `calc(${percentage}% - 10px)`,
        }}
      />
    </div>
  )
}
