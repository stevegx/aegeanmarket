'use client'

import { useSidebar } from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'

export default function ShowResultsButton() {
  const { isMobile, setOpenMobile } = useSidebar()

  if (!isMobile) return null

  return (
    <div className="border-t border-border p-4">
      <Button
        type="button"
        variant="buy"
        onClick={() => setOpenMobile(false)}
        className="h-11 w-full rounded-md text-base font-bold"
      >
        Show results
      </Button>
    </div>
  )
}
