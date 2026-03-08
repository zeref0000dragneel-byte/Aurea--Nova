import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  ShoppingCart,
  Factory,
  ArrowRight,
  Sparkles,
  Package,
  ClipboardList,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const statusLabelPedidos: Record<string, string> = {
  confirmado: 'Confirmado',
  en_preparacion: 'En Preparación',
  listo: 'Listo',
  entregado: 'Entregado',
  cancelado: 'Cancelado',
}

const statusColorPedidos: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  confirmado: 'default',
  en_preparacion: 'default',
  listo: 'default',
  entregado: 'default',
  cancelado: 'destructive',
}

type PedidoRow = {
  id: string
  order_number: string
  status: string
  delivery_date: string | null
  customers: { business_name: string } | null
}

type OrdenProdRow = {
  id: string
  planned_quantity: number
  status: string
  created_at: string
  products: { name: string } | { name: string }[] | null
}

export default async function EmpleadoWelcomePage() {
  const supabase = await createClient()
  const supabaseAdmin = createAdminClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  let nombreEmpleado = 'Empleado'
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single()
  if (profile?.full_name) {
    nombreEmpleado = profile.full_name
  }

  const [
    { data: pedidosData },
    { data: ordenesProdData },
  ] = await Promise.all([
    supabaseAdmin
      .from('orders')
      .select('id, order_number, status, delivery_date, customers(business_name)')
      .not('status', 'eq', 'borrador')
      .not('status', 'eq', 'cancelado')
      .order('created_at', { ascending: false })
      .limit(8),
    supabase
      .from('production_orders')
      .select('id, planned_quantity, status, created_at, products(name)')
      .eq('assigned_to', user.id)
      .in('status', ['pendiente', 'en_proceso'])
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  const pedidos = (pedidosData ?? []) as unknown as PedidoRow[]
  const ordenesProd = (ordenesProdData ?? []) as unknown as OrdenProdRow[]

  const pedidosEnCurso = pedidos.filter((p) =>
    ['confirmado', 'en_preparacion', 'listo'].includes(p.status)
  )
  const ordenesActivas = ordenesProd.length

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-8">
      {/* Hero bienvenida */}
      <div className="text-center md:text-left">
        <div className="inline-flex items-center gap-2 rounded-2xl bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-4">
          <Sparkles className="h-4 w-4" />
          Panel Empleado
        </div>
        <h1 className="font-display text-3xl md:text-4xl font-bold tracking-wide text-neutral-800">
          Bienvenido, {nombreEmpleado}
        </h1>
        <p className="text-neutral-600 mt-2 text-base font-medium max-w-xl">
          Aquí tienes el resumen de pedidos y órdenes de producción. Usa los accesos rápidos para trabajar en cada sección.
        </p>
      </div>

      {/* Resumen en números */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="rounded-3xl border border-accent-miel/30 shadow-xl bg-gradient-to-br from-neutral-50 to-white transition-all duration-300 hover:shadow-2xl">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <ShoppingCart className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-neutral-700">{pedidosEnCurso.length}</p>
                <p className="text-xs font-medium text-neutral-700/80">Pedidos en curso</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border border-accent-miel/30 shadow-xl bg-gradient-to-br from-neutral-50 to-white transition-all duration-300 hover:shadow-2xl">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Factory className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-neutral-700">{ordenesActivas}</p>
                <p className="text-xs font-medium text-neutral-700/80">Órdenes de producción asignadas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border border-accent-miel/30 shadow-xl bg-gradient-to-br from-neutral-50 to-white transition-all duration-300 hover:shadow-2xl">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <ClipboardList className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-neutral-700">{pedidos.length}</p>
                <p className="text-xs font-medium text-neutral-700/80">Total pedidos visibles</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Acciones rápidas */}
      <Card className="rounded-3xl border border-accent-miel/30 shadow-xl bg-gradient-to-br from-neutral-50 to-white transition-all duration-300 hover:shadow-2xl">
        <CardHeader>
          <h2 className="font-display text-lg font-bold tracking-wide text-neutral-700">
            Acciones rápidas
          </h2>
          <p className="text-sm font-medium text-neutral-700/80">
            Ir a pedidos asignados o a tus órdenes de producción
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-auto flex-col gap-2 py-6 rounded-2xl border-2 border-accent-miel/40 hover:border-primary/50 hover:bg-primary/5"
            >
              <Link href="/empleado/pedidos" className="flex items-center gap-3 w-full">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <ShoppingCart className="h-6 w-6" />
                </div>
                <div className="flex-1 text-left">
                  <span className="font-semibold text-neutral-800 block">Pedidos asignados</span>
                  <span className="text-sm text-neutral-600 font-normal">
                    Ver estado, filtrar por confirmado, preparación, listo o entregado
                  </span>
                </div>
                <ArrowRight className="h-5 w-5 text-primary shrink-0" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-auto flex-col gap-2 py-6 rounded-2xl border-2 border-accent-miel/40 hover:border-primary/50 hover:bg-primary/5"
            >
              <Link href="/empleado/produccion" className="flex items-center gap-3 w-full">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Factory className="h-6 w-6" />
                </div>
                <div className="flex-1 text-left">
                  <span className="font-semibold text-neutral-800 block">Producción</span>
                  <span className="text-sm text-neutral-600 font-normal">
                    Órdenes asignadas a ti: trabajar y registrar cantidades
                  </span>
                </div>
                <ArrowRight className="h-5 w-5 text-primary shrink-0" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Vista previa pedidos */}
      <Card className="rounded-3xl border border-accent-miel/30 shadow-xl bg-gradient-to-br from-neutral-50 to-white transition-all duration-300 hover:shadow-2xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <h2 className="font-display text-lg font-bold tracking-wide text-neutral-700">
              Últimos pedidos
            </h2>
            <p className="text-sm font-medium text-neutral-700/80 mt-0.5">
              Pedidos confirmados, en preparación o listos
            </p>
          </div>
          <Button asChild variant="default" size="sm">
            <Link href="/empleado/pedidos">Ver todos</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {pedidos.length === 0 ? (
            <p className="text-neutral-700/80 text-sm py-8 text-center font-medium">
              No hay pedidos en esta vista.
            </p>
          ) : (
            <div className="rounded-2xl border border-accent-miel/30 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-neutral-200 hover:bg-transparent bg-muted/50">
                    <TableHead className="font-semibold text-neutral-700">Pedido</TableHead>
                    <TableHead className="font-semibold text-neutral-700">Cliente</TableHead>
                    <TableHead className="font-semibold text-neutral-700">Estado</TableHead>
                    <TableHead className="font-semibold text-neutral-700">Fecha entrega</TableHead>
                    <TableHead className="font-semibold text-neutral-700 w-[100px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pedidos.map((pedido) => (
                    <TableRow key={pedido.id} className="border-neutral-200">
                      <TableCell className="font-mono text-sm font-medium">
                        {pedido.order_number}
                      </TableCell>
                      <TableCell className="text-neutral-700">
                        {pedido.customers?.business_name ?? '—'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusColorPedidos[pedido.status] ?? 'default'}>
                          {statusLabelPedidos[pedido.status] ?? pedido.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {pedido.delivery_date
                          ? new Date(pedido.delivery_date + 'T00:00:00').toLocaleDateString('es-MX')
                          : '—'}
                      </TableCell>
                      <TableCell>
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/empleado/pedidos/${pedido.id}`}>Ver</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Vista previa órdenes de producción asignadas */}
      {ordenesProd.length > 0 && (
        <Card className="rounded-3xl border border-accent-miel/30 shadow-xl bg-gradient-to-br from-neutral-50 to-white transition-all duration-300 hover:shadow-2xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <h2 className="font-display text-lg font-bold tracking-wide text-neutral-700">
                Tus órdenes de producción
              </h2>
              <p className="text-sm font-medium text-neutral-700/80 mt-0.5">
                Pendientes o en proceso asignadas a ti
              </p>
            </div>
            <Button asChild variant="default" size="sm">
              <Link href="/empleado/produccion">Ir a producción</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="rounded-2xl border border-accent-miel/30 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-neutral-200 hover:bg-transparent bg-muted/50">
                    <TableHead className="font-semibold text-neutral-700">Producto</TableHead>
                    <TableHead className="font-semibold text-neutral-700">Cantidad planificada</TableHead>
                    <TableHead className="font-semibold text-neutral-700">Estado</TableHead>
                    <TableHead className="font-semibold text-neutral-700 w-[120px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ordenesProd.map((orden) => {
                    const productName = Array.isArray(orden.products)
                      ? orden.products[0]?.name ?? '—'
                      : orden.products?.name ?? '—'
                    return (
                      <TableRow key={orden.id} className="border-neutral-200">
                        <TableCell className="font-medium text-neutral-800">
                          {productName}
                        </TableCell>
                        <TableCell className="text-neutral-700">
                          {Number(orden.planned_quantity).toLocaleString('es-MX')}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={cn(
                              'border font-medium',
                              orden.status === 'en_proceso'
                                ? 'bg-primary/15 text-primary border-primary/40'
                                : 'bg-warning/20 text-neutral-800 border-warning/50'
                            )}
                          >
                            {orden.status === 'en_proceso' ? 'En proceso' : 'Pendiente'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button asChild variant="default" size="sm">
                            <Link href={`/empleado/produccion/${orden.id}`}>
                              <Package className="h-4 w-4 mr-1.5 inline" />
                              Trabajar
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
