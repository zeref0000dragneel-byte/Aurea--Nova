import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

type CardsSkeletonProps = {
  count?: number
  /** Si true, cada card tiene icono + 2 líneas (métrica). Si false, solo 2 líneas. */
  withIcon?: boolean
}

export function CardsSkeleton({
  count = 4,
  withIcon = true,
}: CardsSkeletonProps) {
  return (
    <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="border-slate-200/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              {withIcon && (
                <Skeleton className="h-10 w-10 shrink-0 rounded-xl" />
              )}
              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
