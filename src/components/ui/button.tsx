import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl text-sm font-medium transition-all duration-300 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-90 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-br from-primary to-[#EAB308] text-primary-foreground shadow-lg hover:from-primary-dark hover:to-[#DAA520] hover:scale-105 hover:shadow-xl active:scale-[0.98] disabled:opacity-60 disabled:scale-100 disabled:shadow-md",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 active:scale-[0.98] disabled:opacity-60",
        outline:
          "border border-neutral-200 bg-white shadow-sm hover:bg-neutral-50 hover:border-accent-miel/40 hover:shadow-md active:scale-[0.98] disabled:opacity-60 rounded-2xl",
        secondary:
          "bg-white border border-neutral-200 text-neutral-700 shadow-sm hover:bg-neutral-100 hover:border-accent-miel/30 active:scale-[0.98] disabled:opacity-60 rounded-2xl",
        ghost: "hover:bg-neutral-50 hover:text-neutral-800 disabled:opacity-60 rounded-2xl",
        link: "text-primary underline-offset-4 hover:underline hover:text-primary-dark disabled:opacity-60",
      },
      size: {
        default: "h-10 px-6 py-2.5",
        sm: "h-8 rounded-xl px-4 py-2 text-xs",
        lg: "h-11 rounded-2xl px-8 py-2.5",
        icon: "h-9 w-9 rounded-2xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
