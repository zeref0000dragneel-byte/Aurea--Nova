import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center border px-3 py-1 text-xs font-medium rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "rounded-full border-transparent bg-primary text-primary-foreground shadow-sm hover:bg-primary/90",
        secondary:
          "rounded-full border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "rounded-full border-transparent bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline: "rounded-full text-foreground border-neutral-200",
        pill: "rounded-full border-transparent bg-transparent",
        activo:
          "rounded-full border-transparent bg-success/10 text-success before:content-[''] before:inline-block before:h-1.5 before:w-1.5 before:shrink-0 before:rounded-full before:mr-1.5 before:bg-success before:align-middle",
        pendiente:
          "rounded-full border-transparent bg-warning/10 text-warning before:content-[''] before:inline-block before:h-1.5 before:w-1.5 before:shrink-0 before:rounded-full before:mr-1.5 before:bg-warning before:align-middle",
        alerta:
          "rounded-full border-transparent bg-danger/10 text-danger before:content-[''] before:inline-block before:h-1.5 before:w-1.5 before:shrink-0 before:rounded-full before:mr-1.5 before:bg-danger before:align-middle",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
