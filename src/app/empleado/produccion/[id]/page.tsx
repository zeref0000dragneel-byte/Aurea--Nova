import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { BotonEliminarConsumoMP } from '@/app/admin/produccion/[id]/boton-eliminar-consumo-mp'
import { FormAgregarConsumoMP } from '@/app/admin/produccion/[id]/form-agregar-consumo-mp'
import { FormCompletarOrden } from '@/app/admin/produccion/[id]/form-completar-orden'
import { BotonPonerEnProceso } from './boton-poner-en-proceso'
import { cn } from '@/lib/utils'

type OrderStatus = 'pendiente' | 'en_proceso' | 'completada' | 'cancelada'

type OrderData = {
  id: string
  product_id: string
  planned_quantity: number
  status: OrderStatus
  assigned_to: string | null
  created_at: string
  notes: string | null
  actual_quantity: number | null
  waste_quantity: number | null
  waste_notes: string | null
  waste_photo_url: string | null
  completed_at: string | null
  products: { name: string; unit: string } | null
  assigned_profile: { full_name: string } | null
  production_raw_material_usage: ConsumoRow[]
}

type ConsumoRow = {
  id: string
  planned_quantity: number
  raw_materials: { name: string; unit: string } | null
}

type RawMaterialOption = { id: string; name: string; unit: string }

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

export default async function EmpleadoOrdenProduccionDetallePage({
  params,
}: {
  params: { id: string }
}) {
  const { id } = params

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: orden, error: orderError } = await supabase
    .from('production_orders')
    .select(
      `
      *,
      products(name, unit),
      assigned_profile:profiles!production_orders_assigned_to_fkey(full_name),
      production_raw_material_usage(
        id,
        planned_quantity,
        raw_materials(name, unit)
      )
    `
    )
    .eq('id', id)
    .single()

  if (orderError || !orden) {
    notFound()
  }

  const ordenTyped = orden as unknown as OrderData
  if (ordenTyped.assigned_to !== user.id) {
    redirect('/empleado/produccion')
  }

  const { data: rawMaterials } = await supabase
    .from('raw_materials')
    .select('id, name, unit')
    .eq('is_active', true)
    .order('name')

  const consumosList = ordenTyped.production_raw_material_usage ?? []
  const materiasPrimas = (rawMaterials ?? []).map((r) => ({
    id: (r as { id: string }).id,
    name: (r as { name: string }).name,
    unit: (r as { unit: string }).unit,
  })) as RawMaterialOption[]

  const productName = ordenTyped.products?.name ?? '—'
  const productUnit = ordenTyped.products?.unit ?? ''
  const status = ordenTyped.status ?? 'pendiente'
  const createdDate = ordenTyped.created_at
    ? new Date(ordenTyped.created_at).toLocaleDateString('es-MX', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : '—'
  const isFinished = status === 'completada' || status === 'cancelada'
  const canEditConsumos = !isFinished
  const showFormCompletar = status === 'en_proceso'

  return (
    <div className="p-8">
      <div className="mb-6">
        <Link
          href="/empleado/produccion"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition-colors hover:text-amber-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a mis órdenes
        </Link>
      </div>

      <Card className="mb-8 border-gray-200">
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              Orden de producción
            </h1>
            {status === 'pendiente' && (
              <BotonPonerEnProceso ordenId={id} />
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Producto
              </p>
              <p className="mt-0.5 font-medium text-gray-900">{productName}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Estado
              </p>
              <div className="mt-0.5">
                <Badge
                  variant="outline"
                  className={cn('border font-medium', STATUS_BADGE_CLASS[status])}
                >
                  {STATUS_LABEL[status]}
                </Badge>
              </div>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Cantidad planificada
              </p>
              <p className="mt-0.5 font-medium text-gray-900">
                {Number(ordenTyped.planned_quantity).toLocaleString('es-MX')}
                {productUnit ? ` ${productUnit}` : ''}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Fecha creación
              </p>
              <p className="mt-0.5 text-gray-900">{createdDate}</p>
            </div>
          </div>
          {ordenTyped.notes && (
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Notas
              </p>
              <p className="mt-0.5 text-gray-700 whitespace-pre-wrap">{ordenTyped.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="mb-8 border-gray-200">
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900">
            Materias primas a consumir
          </h2>
        </CardHeader>
        <CardContent className="space-y-6">
          {consumosList.length > 0 ? (
            <div className="rounded-lg border border-gray-200">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-200 hover:bg-transparent">
                    <TableHead className="font-semibold text-gray-700">Nombre</TableHead>
                    <TableHead className="font-semibold text-gray-700">
                      Cantidad planificada
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700">Unidad</TableHead>
                    {canEditConsumos && (
                      <TableHead className="w-14 font-semibold text-gray-700 text-right">
                        Acciones
                      </TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {consumosList.map((c) => (
                    <TableRow key={c.id} className="border-gray-100">
                      <TableCell className="font-medium text-gray-900">
                        {c.raw_materials?.name ?? '—'}
                      </TableCell>
                      <TableCell className="text-gray-700">
                        {Number(c.planned_quantity).toLocaleString('es-MX')}
                      </TableCell>
                      <TableCell className="text-gray-600 uppercase">
                        {c.raw_materials?.unit ?? '—'}
                      </TableCell>
                      {canEditConsumos && (
                        <TableCell className="text-right">
                          <BotonEliminarConsumoMP
                            usageId={c.id}
                            productionOrderId={id}
                          />
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-sm text-gray-500">
              No hay materias primas registradas para esta orden.
            </p>
          )}
          {canEditConsumos && (
            <FormAgregarConsumoMP
              produccionOrdenId={id}
              materialesPrimas={materiasPrimas}
            />
          )}
        </CardContent>
      </Card>

      {showFormCompletar && (
        <Card className="mb-8 border-gray-200">
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">Completar orden</h2>
          </CardHeader>
          <CardContent>
            <FormCompletarOrden
              ordenId={id}
              hasConsumos={consumosList.length > 0}
            />
          </CardContent>
        </Card>
      )}

      {isFinished && status === 'completada' && (
        <Card className="mb-8 border-gray-200">
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">Resumen</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Cantidad real producida
                </p>
                <p className="mt-0.5 font-medium text-gray-900">
                  {ordenTyped.actual_quantity != null
                    ? Number(ordenTyped.actual_quantity).toLocaleString('es-MX')
                    : '—'}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Merma
                </p>
                <p className="mt-0.5 font-medium text-gray-900">
                  {ordenTyped.waste_quantity != null
                    ? Number(ordenTyped.waste_quantity).toLocaleString('es-MX')
                    : '0'}
                </p>
              </div>
            </div>
            {ordenTyped.completed_at && (
              <p className="text-sm text-gray-500">
                Completada el{' '}
                {new Date(ordenTyped.completed_at).toLocaleDateString('es-MX', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {isFinished && status === 'cancelada' && (
        <Card className="mb-8 border-gray-200">
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">Resumen</h2>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">Esta orden fue cancelada.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
