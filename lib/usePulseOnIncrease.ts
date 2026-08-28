'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * Watches a numeric value (cart item count, favorites count, total price...) and
 * flips `pulsing` true for `duration` ms each time it grows. `pulseKey` bumps on
 * every increase so callers can use it as a React `key` to restart a CSS
 * animation even on rapid, consecutive additions.
 */
export function usePulseOnIncrease(value: number, duration = 1200) {
  const prev = useRef(value)
  const [pulsing, setPulsing] = useState(false)
  const [pulseKey, setPulseKey] = useState(0)

  useEffect(() => {
    if (value > prev.current) {
      setPulsing(true)
      setPulseKey((k) => k + 1)
      const timeout = setTimeout(() => setPulsing(false), duration)
      prev.current = value
      return () => clearTimeout(timeout)
    }
    prev.current = value
  }, [value, duration])

  return { pulsing, pulseKey }
}
