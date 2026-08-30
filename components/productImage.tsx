'use client'

import { useState } from 'react'
import Image, { type ImageProps } from 'next/image'
import { cn } from '@/lib/utils'

type ProductImageProps = Omit<ImageProps, 'src' | 'onError'> & {
  src: string
}

/**
 * Wraps next/image for product photos, which are hotlinked from the
 * external ekava.gr feed. Falls back to a local placeholder glyph if that
 * host 404s/500s/times out, instead of leaving a broken image in the UI.
 */
export default function ProductImage({
  src,
  alt,
  className,
  fill,
  width,
  height,
  ...props
}: ProductImageProps) {
  const [failed, setFailed] = useState(false)
  const [lastSrc, setLastSrc] = useState(src)

  // Reset the failed flag when a new src comes in (e.g. list re-renders with
  // a different product), without needing an effect for it.
  if (src !== lastSrc) {
    setLastSrc(src)
    setFailed(false)
  }

  if (failed) {
    return (
      <div
        className={cn(
          'flex items-center justify-center bg-muted',
          fill && 'absolute inset-0',
          className
        )}
        style={!fill ? { width, height } : undefined}
        role="img"
        aria-label={typeof alt === 'string' ? alt : undefined}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.25"
          className="w-1/3 h-1/3 min-w-6 min-h-6 text-foreground/25"
        >
          <path
            d="M9.5 2h5M10 2v3.9c0 .4-.13.79-.38 1.1L8.1 8.9c-.71.9-1.1 2-1.1 3.14V20a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-7.96c0-1.14-.39-2.24-1.1-3.14l-1.52-1.9A1.77 1.77 0 0 1 14 5.9V2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M7.5 14h9" strokeLinecap="round" />
        </svg>
      </div>
    )
  }

  return (
    <Image
      src={src}
      alt={alt}
      // Catalog photos are shot on white; in dark mode a transparent PNG or a
      // white-on-white product would otherwise sit on the dark card. Paint the
      // image element white so object-contain letterboxing stays white too.
      className={cn('dark:bg-white', className)}
      fill={fill}
      width={width}
      height={height}
      onError={() => setFailed(true)}
      {...props}
    />
  )
}
