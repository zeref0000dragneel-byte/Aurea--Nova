'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

type TooltipProps = {
  content: React.ReactNode
  children: React.ReactNode
  side?: 'top' | 'right' | 'bottom' | 'left'
  className?: string
}

const sideClasses = {
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  left: 'right-full top-1/2 -translate-y-1/2 mr-2',
  right: 'left-full top-1/2 -translate-y-1/2 ml-2',
}

export function Tooltip({
  content,
  children,
  side = 'top',
  className,
}: TooltipProps) {
  return (
    <div className={cn('relative inline-flex group', className)}>
      {children}
      <span
        role="tooltip"
        className={cn(
          'pointer-events-none absolute z-50 whitespace-nowrap rounded px-2 py-1.5 bg-black text-white text-[10px] font-medium opacity-0 transition-opacity duration-150 delay-300 group-hover:opacity-100',
          sideClasses[side]
        )}
      >
        {content}
      </span>
    </div>
  )
}

/**
 * Envuelve el trigger (ej. botón solo icono) para que muestre tooltip al hover.
 * El trigger debe tener la clase "group" para que el delay funcione.
 */
export function TooltipTrigger({
  content,
  children,
  side = 'top',
  className,
}: TooltipProps) {
  return (
    <Tooltip content={content} side={side} className={className}>
      {children}
    </Tooltip>
  )
}
