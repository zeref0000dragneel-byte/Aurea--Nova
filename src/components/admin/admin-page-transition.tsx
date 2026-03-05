'use client'

import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

type AdminPageTransitionProps = {
  children: React.ReactNode
  className?: string
}

/**
 * Envuelve el contenido de las páginas admin para aplicar una transición
 * de opacidad suave (fade-in duration-500) en cada navegación.
 */
export function AdminPageTransition({
  children,
  className,
}: AdminPageTransitionProps) {
  const pathname = usePathname()

  return (
    <div
      key={pathname}
      className={cn(
        'animate-in fade-in duration-500',
        className
      )}
    >
      {children}
    </div>
  )
}
