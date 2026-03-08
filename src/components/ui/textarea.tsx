import * as React from "react"

import { cn } from "@/lib/utils"

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[80px] w-full rounded-xl border border-neutral-200 bg-neutral-50/50 px-3 py-2 text-base resize-y",
        "shadow-[inset_0_1px_2px_rgba(0,0,0,0.03)]",
        "ring-offset-background transition-all duration-200",
        "placeholder:text-neutral-400 placeholder:font-normal",
        "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent-miel/50 focus-visible:border-accent-miel/40",
        "focus-visible:bg-white focus-visible:shadow-md",
        "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-neutral-50 disabled:shadow-none disabled:translate-y-0",
        "md:text-sm",
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Textarea.displayName = "Textarea"

export { Textarea }
