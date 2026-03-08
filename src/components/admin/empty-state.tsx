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
        'flex flex-col items-center justify-center rounded-2xl',
        isCell
          ? 'py-12'
          : 'border border-accent-miel/30 bg-gradient-to-br from-neutral-50 to-white/80 shadow-lg',
        className
      )}
    >
      <div className={cn(
        'flex items-center justify-center rounded-2xl bg-primary/5',
        isCell ? 'h-12 w-12' : 'h-16 w-16'
      )}>
        <Icon className={cn('text-primary/40', isCell ? 'h-6 w-6' : 'h-8 w-8')} strokeWidth={1.25} aria-hidden />
      </div>
      <p className="mt-5 text-sm font-medium text-neutral-700">{title}</p>
      <p className="mt-1 text-xs font-medium text-neutral-700/80">{description}</p>
    </div>
  )
}
