import Link from 'next/link'
import { HugeiconsIcon } from '@hugeicons/react'
import { ArrowRight01Icon } from '@hugeicons/core-free-icons'

interface BreadcrumbsProps {
  category?: string
}

export default function Breadcrumbs({ category }: BreadcrumbsProps) {
  const prettyCategory = category
    ? category.charAt(0).toUpperCase() + category.slice(1).toLowerCase()
    : null

  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
        <li>
          <Link
            href="/"
            className="transition-colors hover:text-aegean-green-text"
          >
            Home
          </Link>
        </li>
        <li aria-hidden className="text-muted-foreground/50">
          <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} className="size-4" />
        </li>
        <li>
          {prettyCategory ? (
            <Link
              href="/products"
              className="transition-colors hover:text-aegean-green-text"
            >
              Products
            </Link>
          ) : (
            <span className="font-semibold text-foreground">Products</span>
          )}
        </li>
        {prettyCategory && (
          <>
            <li aria-hidden className="text-muted-foreground/50">
              <HugeiconsIcon
                icon={ArrowRight01Icon}
                strokeWidth={2}
                className="size-4"
              />
            </li>
            <li>
              <span className="font-semibold text-foreground">
                {prettyCategory}
              </span>
            </li>
          </>
        )}
      </ol>
    </nav>
  )
}
