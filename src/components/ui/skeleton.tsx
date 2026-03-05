import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse-slow rounded-md bg-slate-200/40", className)}
      {...props}
    />
  )
}

export { Skeleton }
