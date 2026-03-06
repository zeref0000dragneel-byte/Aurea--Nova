'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Factory, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export type OrderStatus = 'pendiente' | 'en_proceso' | 'completada' | 'cancelada'

export type OrderRow = {
  id: string
  planned_quantity: number
  actual_quantity: number | null
  status: OrderStatus
  created_at: string
  completed_at: string | null
  products: { name: string } | { name: string }[] | null
}

const STATUS_BADGE_CLASS: Record<OrderStatus, string> = {
  pendiente: 'bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-100',
  en_proceso: 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100',
  completada: 'bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-100',
  cancelada: 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-100',
}

const STATUS_LABEL: Record<OrderStatus, string> = {
  pendiente: 'Pendiente',
  en_proceso: 'En proceso',
  completada: 'Completada',
  cancelada: 'Cancelada',
}

export function TabsOrdenes({ ordenes }: { ordenes: OrderRow[] }) {
  const [activeTab, setActiveTab] = useState<'activas' | 'historial'>('activas')

  const activas = ordenes.filter(
    (o) => o.status === 'pendiente' || o.status === 'en_proceso'
  )
  const historial = ordenes.filter(
    (o) => o.status === 'completada' || o.status === 'cancelada'
  )
  const hasActivas = activas.length > 0
  const hasHistorial = historial.length > 0

  return (
    <div className="p-8">
      <h1 className="mb-2 text-2xl font-bold tracking-tight text-gray-900">
        Mis órdenes de producción
      </h1>
      <p className="mb-6 text-sm text-gray-500">
        Órdenes asignadas a ti
      </p>

      <div className="mb-6 flex gap-1 rounded-lg border border-gray-200 p-1 bg-gray-50/50">
        <button
          type="button"
          onClick={() => setActiveTab('activas')}
          className={cn(
            'flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors',
            activeTab === 'activas'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          )}
        >
          Activas
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('historial')}
          className={cn(
            'flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors',
            activeTab === 'historial'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          )}
        >
          Historial
        </button>
      </div>

      {activeTab === 'activas' && (
        <>
          {hasActivas ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {activas.map((row) => {
                const productName = Array.isArray(row.products)
                  ? row.products[0]?.name ?? '—'
                  : row.products?.name ?? '—'
                const status = row.status
                const createdDate = row.created_at
                  ? new Date(row.created_at).toLocaleDateString('es-MX', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })
                  : '—'
                return (
                  <Card
                    key={row.id}
                    className="border-gray-200 transition-shadow hover:shadow-md"
                  >
                    <CardContent className="p-5">
                      <p className="font-medium text-gray-900">{productName}</p>
                      <p className="mt-1 text-sm text-gray-600">
                        Cantidad planificada:{' '}
                        {Number(row.planned_quantity).toLocaleString('es-MX')}
                      </p>
                      <div className="mt-2">
                        <Badge
                          variant="outline"
                          className={cn(
                            'border font-medium',
                            STATUS_BADGE_CLASS[status]
                          )}
                        >
                          {STATUS_LABEL[status]}
                        </Badge>
                      </div>
                      <p className="mt-2 text-xs text-gray-500">{createdDate}</p>
                      <Button
                        asChild
                        className="mt-4 w-full bg-amber-500 text-white hover:bg-amber-600"
                      >
                        <Link href={`/empleado/produccion/${row.id}`}>
                          <Play className="mr-2 h-4 w-4" />
                          Ver / Trabajar
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50/50 py-16">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
                <Factory className="h-7 w-7 text-gray-400" />
              </div>
              <p className="mt-4 text-sm font-medium text-gray-600">
                No tienes órdenes activas
              </p>
              <p className="mt-1 text-xs text-gray-500">
                Las órdenes que te asignen aparecerán aquí
              </p>
            </div>
          )}
        </>
      )}

      {activeTab === 'historial' && (
        <>
          {hasHistorial ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {historial.map((row) => {
                const productName = Array.isArray(row.products)
                  ? row.products[0]?.name ?? '—'
                  : row.products?.name ?? '—'
                const status = row.status
                const completedDate = row.completed_at
                  ? new Date(row.completed_at).toLocaleDateString('es-MX', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })
                  : '—'
                const cantidadReal =
                  row.actual_quantity != null
                    ? Number(row.actual_quantity).toLocaleString('es-MX')
                    : '—'
                return (
                  <Card
                    key={row.id}
                    className="border-gray-200 transition-shadow hover:shadow-md"
                  >
                    <CardContent className="p-5">
                      <p className="font-medium text-gray-900">{productName}</p>
                      <p className="mt-1 text-sm text-gray-600">
                        Cantidad producida: {cantidadReal}
                      </p>
                      <div className="mt-2">
                        <Badge
                          variant="outline"
                          className={cn(
                            'border font-medium',
                            STATUS_BADGE_CLASS[status]
                          )}
                        >
                          {STATUS_LABEL[status]}
                        </Badge>
                      </div>
                      <p className="mt-2 text-xs text-gray-500">
                        {status === 'completada'
                          ? `Completada el ${completedDate}`
                          : completedDate}
                      </p>
                      <Link
                        href={`/empleado/produccion/${row.id}`}
                        className="mt-4 inline-block text-sm font-medium text-amber-600 hover:text-amber-700"
                      >
                        Ver detalle
                      </Link>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50/50 py-16">
              <p className="text-sm font-medium text-gray-600">
                No hay órdenes en el historial
              </p>
              <p className="mt-1 text-xs text-gray-500">
                Las órdenes completadas o canceladas aparecerán aquí
              </p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
