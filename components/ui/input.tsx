import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

interface InputProps extends React.ComponentPropsWithoutRef<typeof InputPrimitive> {
  error?: string
}

function Input({ className, type, error, ...props }: InputProps) {
  return (
    <div className="flex w-full flex-col gap-1.5">
      <InputPrimitive
        type={type}
        data-slot="input"
        aria-invalid={!!error}
        className={cn(
          "h-7 w-full min-w-0 rounded-md border border-input bg-input/20 px-2 py-4 text-sm transition-colors outline-none",
          "file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-xs/relaxed file:font-medium file:text-foreground placeholder:text-muted-foreground",
          "focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30",
          "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
          "md:text-xs/relaxed dark:bg-input/30",
          error && "border-aegean-terracotta focus-visible:border-aegean-terracotta focus-visible:ring-aegean-terracotta/20",
          className
        )}
        {...props}
      />
      {error && (<span className="text-[11px] font-medium text-aegean-terracotta mt-1">{error}</span>)}
    </div>
  )
}

export { Input }
