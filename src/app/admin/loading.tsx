import { Skeleton } from '@/components/ui/skeleton'
import { CardsSkeleton } from '@/components/admin/cards-skeleton'
import { TableSkeleton } from '@/components/admin/table-skeleton'

/**
 * Loading UI para rutas bajo /admin.
 * Imita la estructura de dashboard: título, cards y tabla,
 * con skeletons de pulso lento (duration 1000) y bg-slate-200/40.
 */
export default function AdminLoading() {
  return (
    <div className="p-16 animate-in fade-in duration-500">
      {/* Header skeleton */}
      <div className="mb-16">
        <Skeleton className="mb-2 h-10 w-48" />
        <Skeleton className="h-4 w-36" />
      </div>

      {/* Cards row */}
      <div className="mb-16">
        <CardsSkeleton count={4} withIcon />
      </div>

      {/* Table skeleton */}
      <div className="mb-16">
        <Skeleton className="mb-6 h-7 w-56" />
        <TableSkeleton columns={6} rows={6} />
      </div>
    </div>
  )
}
