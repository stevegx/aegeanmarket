export const STATUS_META: Record<string, { label: string; tone: string }> = {
  pending: { label: 'Pending', tone: 'terracotta' },
  processing: { label: 'Processing', tone: 'blue' },
  shipped: { label: 'Shipped', tone: 'light' },
  delivered: { label: 'Delivered', tone: 'green' },
  cancelled: { label: 'Cancelled', tone: 'destructive' },
}

export const TONE_CLASSES: Record<string, string> = {
  dark: 'bg-aegean-dark/10 text-aegean-dark',
  blue: 'bg-aegean-blue/10 text-aegean-blue',
  light: 'bg-aegean-light/40 text-aegean-dark',
  green: 'bg-aegean-green/10 text-aegean-green',
  terracotta: 'bg-aegean-terracotta/10 text-aegean-terracotta',
  destructive: 'bg-destructive/10 text-destructive',
  neutral: 'bg-muted text-foreground',
}

export const PAYMENT_STATUS_TONE: Record<string, string> = {
  paid: 'green',
  unpaid: 'terracotta',
  refunded: 'blue',
}

// Overrides the default Badge size (10px/h-5) for admin tables, where
// status/payment badges are a primary signal and need to read at a glance.
export const BADGE_CLASS =
  'h-auto rounded-full border-0 px-3 py-1 text-sm font-semibold'
