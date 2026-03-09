import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'
import { Plus, Factory, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/admin/empty-state'
import { cn } from '@/lib/utils'

type OrderStatus = 'pendiente' | 'en_proceso' | 'completada' | 'cancelada'

type ProductionOrderRow = {
  id: string
  product_id: string
  planned_quantity: number
  status: OrderStatus
  assigned_to: string | null
  created_at: string
  products: { name: string } | null
  assigned_profile: { full_name: string } | null
}

const STATUS_BADGE_CLASS: Record<OrderStatus, string> = {
  pendiente: 'bg-warning/10 text-warning border-0',
  en_proceso: 'bg-primary/10 text-primary border-0',
  completada: 'bg-success/10 text-success border-0',
  cancelada: 'bg-neutral-200/80 text-neutral-700 border-0',
}

const STATUS_LABEL: Record<OrderStatus, string> = {
  pendiente: 'Pendiente',
  en_proceso: 'En proceso',
  completada: 'Completada',
  cancelada: 'Cancelada',
}

type FilterValue = 'todos' | 'pendientes' | 'en_proceso'

export default async function AdminProduccionPage({
  searchParams,
}: {
  searchParams: { filter?: string }
}) {
  const filter = (searchParams?.filter as FilterValue) ?? 'todos'

  const supabase = createAdminClient()

  let query = supabase
    .from('production_orders')
    .select(
      `
      *,
      products(name),
      assigned_profile:profiles!production_orders_assigned_to_fkey(full_name)
    `
    )
    .order('created_at', { ascending: false })

  if (filter === 'pendientes') {
    query = query.eq('status', 'pendiente')
  } else if (filter === 'en_proceso') {
    query = query.eq('status', 'en_proceso')
  }

  const { data: orders, error } = await query

  const orderList = (orders ?? []) as unknown as ProductionOrderRow[]
  const hasOrders = orderList.length > 0

  const filterLinks: { value: FilterValue; label: string }[] = [
    { value: 'todos', label: 'Todos' },
    { value: 'pendientes', label: 'Pendientes' },
    { value: 'en_proceso', label: 'En proceso' },
  ]

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-wide text-neutral-700">
            Órdenes de Producción
          </h1>
          <p className="text-sm font-medium text-neutral-700/80 mt-1">
            Gestiona y completa órdenes de producción
          </p>
        </div>
        <Button
          asChild
          className="shrink-0 rounded-2xl transition-all duration-300"
        >
          <Link href="/admin/produccion/nuevo">
            <Plus className="mr-2 h-5 w-5" />
            Nueva Orden
          </Link>
        </Button>
      </div>

      {/* Filtro tipo tabs */}
      <div className="mb-6 flex gap-1 rounded-2xl border border-accent-miel/30 bg-neutral-50/80 p-1">
        {filterLinks.map(({ value, label }) => (
          <Link
            key={value}
            href={value === 'todos' ? '/admin/produccion' : `/admin/produccion?filter=${value}`}
            className={cn(
              'rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200',
              filter === value
                ? 'bg-white text-neutral-700 shadow-sm'
                : 'text-neutral-700 hover:text-neutral-900 hover:bg-white/60'
            )}
          >
            {label}
          </Link>
        ))}
      </div>

      {/* Tabla o estado vacío */}
      {error ? (
        <div className="rounded-lg border border-danger/20 bg-danger/10 px-6 py-8 text-center text-sm font-medium text-danger">
          Error al cargar órdenes: {error.message}
        </div>
      ) : hasOrders ? (
        <div className="premium-table-wrap">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-neutral-700">Producto</TableHead>
                <TableHead className="text-neutral-700">Cantidad Planificada</TableHead>
                <TableHead className="text-neutral-700">Estado</TableHead>
                <TableHead className="text-neutral-700">Asignado a</TableHead>
                <TableHead className="text-neutral-700">Fecha creación</TableHead>
                <TableHead className="text-right text-neutral-700">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orderList.map((orden) => {
                const productName = orden.products?.name ?? '—'
                const assignedDisplay = orden.assigned_profile?.full_name ?? 'Sin asignar'
                const status = (orden.status ?? 'pendiente') as OrderStatus
                const createdDate = orden.created_at
                  ? new Date(orden.created_at).toLocaleDateString('es-MX', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })
                  : '—'
                return (
                  <TableRow key={orden.id}>
                    <TableCell className="font-medium text-neutral-700">
                      {productName}
                    </TableCell>
                    <TableCell className="text-neutral-700">
                      {Number(orden.planned_quantity).toLocaleString('es-MX')}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="pill"
                        className={cn('font-medium', STATUS_BADGE_CLASS[status])}
                      >
                        {STATUS_LABEL[status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-neutral-700">
                      {assignedDisplay}
                    </TableCell>
                    <TableCell className="text-neutral-700">
                      {createdDate}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 transition-colors duration-200"
                        asChild
                      >
                        <Link href={`/admin/produccion/${orden.id}`}>
                          <CheckCircle className="h-4 w-4" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      ) : (
        <EmptyState
          icon={Factory}
          title="Aún no hay registros."
          description={
            filter !== 'todos'
              ? 'Prueba otro filtro o crea una nueva orden'
              : 'Comienza creando uno nuevo.'
          }
        />
      )}
    </div>
  )
}
