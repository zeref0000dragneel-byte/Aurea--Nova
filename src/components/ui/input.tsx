import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-9 w-full rounded-xl border border-neutral-300 border-accent-miel/40 bg-white px-3 py-2 text-base",
          "shadow-sm ring-offset-background transition-all duration-200",
          "placeholder:text-neutral-400 placeholder:font-normal",
          "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent-miel/50 focus-visible:border-accent-miel/40",
          "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-neutral-50",
          "md:text-sm",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
