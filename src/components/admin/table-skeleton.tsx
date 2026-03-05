import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'

type TableSkeletonProps = {
  /** Número de columnas en el header */
  columns?: number
  /** Número de filas de contenido */
  rows?: number
  /** Clases adicionales para el contenedor */
  className?: string
}

export function TableSkeleton({
  columns = 5,
  rows = 8,
  className,
}: TableSkeletonProps) {
  return (
    <div
      className={
        className ??
        'rounded-xl border border-slate-200/50 bg-white shadow-premium shadow-[inset_0_1px_1px_rgba(255,255,255,0.6)]'
      }
    >
      <Table>
        <TableHeader>
          <TableRow className="border-slate-200/50 hover:bg-transparent">
            {Array.from({ length: columns }).map((_, i) => (
              <TableHead key={i} className="py-5">
                <Skeleton className="h-3 w-16" />
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <TableRow key={rowIndex} className="border-b border-slate-100">
              {Array.from({ length: columns }).map((_, colIndex) => (
                <TableCell key={colIndex} className="py-5">
                  <Skeleton
                    className={
                      colIndex === 0
                        ? 'h-4 w-24'
                        : colIndex === columns - 1
                          ? 'h-8 w-16'
                          : 'h-4 w-full max-w-[120px]'
                    }
                  />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
