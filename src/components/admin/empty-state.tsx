import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

type EmptyStateProps = {
  icon: LucideIcon
  title?: string
  description?: string
  className?: string
  /** Si true, estilo compacto sin borde para usar dentro de una tabla */
  variant?: 'standalone' | 'cell'
}

const DEFAULT_TITLE = 'Aún no hay registros.'
const DEFAULT_DESCRIPTION = 'Comienza creando uno nuevo.'

export function EmptyState({
  icon: Icon,
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  className,
  variant = 'standalone',
}: EmptyStateProps) {
  const isCell = variant === 'cell'
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center',
        isCell
          ? 'py-12'
          : 'rounded-xl border border-dashed border-slate-200/50 bg-slate-50/50 py-20',
        className
      )}
    >
      <div className={cn(
        'flex items-center justify-center rounded-full bg-slate-100/80',
        isCell ? 'h-12 w-12' : 'h-16 w-16'
      )}>
        <Icon className={cn('text-slate-500 opacity-10', isCell ? 'h-6 w-6' : 'h-8 w-8')} strokeWidth={1.25} aria-hidden />
      </div>
      <p className="mt-5 text-sm font-medium text-slate-600">{title}</p>
      <p className="mt-1 text-xs text-slate-500">{description}</p>
    </div>
  )
}
