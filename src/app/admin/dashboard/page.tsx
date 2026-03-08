import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { Factory, AlertTriangle, Package, Clock, TrendingDown, TrendingUp } from 'lucide-react'
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
import { cn } from '@/lib/utils'

type RawMaterialRow = {
  id: string
  name: string
  unit: string
  current_stock: number
  min_stock: number
}

type LotRow = {
  id: string
  lot_number: string | null
  current_quantity: number
  expiry_date: string | null
  products: { name: string } | null
}

export default async function AdminDashboardPage() {
  const supabase = await createClient()
  const supabaseAdmin = createAdminClient()

  const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
  const todayStart = new Date().toISOString()

  const [
    { count: ordersActiveCount },
    { data: rawMaterialsData },
    { data: lotsExpiringData },
    { count: lotsInStockCount },
    { data: purchasesDeudaData },
    { data: ordersPorCobrarData },
  ] = await Promise.all([
    supabase
      .from('production_orders')
      .select('id', { count: 'exact', head: true })
      .in('status', ['pendiente', 'en_proceso']),
    supabase
      .from('raw_materials')
      .select('id, name, unit, current_stock, min_stock')
      .eq('is_active', true),
    supabase
      .from('inventory_lots')
      .select('*, products(name)')
      .not('expiry_date', 'is', null)
      .gte('expiry_date', todayStart)
      .lte('expiry_date', thirtyDaysFromNow)
      .gt('current_quantity', 0),
    supabase
      .from('inventory_lots')
      .select('id', { count: 'exact', head: true })
      .gt('current_quantity', 0),
    supabaseAdmin
      .from('purchases')
      .select('total, paid_amount')
      .in('payment_status', ['pendiente', 'parcial']),
    supabaseAdmin
      .from('orders')
      .select('total, paid_amount')
      .neq('payment_status', 'pagado')
      .neq('status', 'cancelado'),
  ])

  const mpEnAlerta = (rawMaterialsData ?? []).filter(
    (mp: RawMaterialRow) => mp.current_stock <= mp.min_stock
  ) as unknown as RawMaterialRow[]
  const lotesPorVencer = (lotsExpiringData ?? []) as unknown as LotRow[]

  const deudaProveedores = (purchasesDeudaData ?? []).reduce(
    (sum: number, p: { total: number; paid_amount: number }) =>
      sum + (Number(p.total) - Number(p.paid_amount)),
    0
  )
  const deudaClientes = (ordersPorCobrarData ?? []).reduce(
    (sum: number, p: { total: number; paid_amount: number }) =>
      sum + (Number(p.total) - Number(p.paid_amount)),
    0
  )

  const sevenDaysFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
  const lotesVencenEn7Dias = lotesPorVencer.filter(
    (l) => l.expiry_date != null && l.expiry_date <= sevenDaysFromNow
  )

  const ordersCount = ordersActiveCount ?? 0
  const mpAlertaCount = mpEnAlerta.length
  const lotsStockCount = lotsInStockCount ?? 0
  const lotsExpiringCount = lotesPorVencer.length

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold tracking-wide text-neutral-700">
          Dashboard
        </h1>
        <p className="mt-2 text-sm font-medium text-neutral-700/80">
          Resumen operativo
        </p>
      </div>

      {/* Fila de 4 Cards métricas */}
      <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-3xl border border-accent-miel/30 shadow-xl bg-gradient-to-br from-neutral-50 to-white p-0 transition-all duration-300 hover:shadow-2xl hover:rotate-0 rotate-1">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Factory className="h-6 w-6" strokeWidth={1.5} />
            </div>
            <div className="min-w-0">
              <p className="text-3xl font-semibold font-mono tabular-nums tracking-tight text-neutral-700">{ordersCount}</p>
              <p className="text-sm font-medium text-neutral-700/80">Órdenes Activas</p>
            </div>
          </CardContent>
        </Card>

        <Card
          className={cn(
            'rounded-3xl border shadow-xl bg-gradient-to-br from-neutral-50 to-white p-0 transition-all duration-300 hover:shadow-2xl hover:rotate-0 rotate-1',
            mpAlertaCount > 0 ? 'border-danger/30 bg-danger/5' : 'border-accent-miel/30'
          )}
        >
          <CardContent className="flex items-center gap-4 p-6">
            <div
              className={cn(
                'flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl',
                mpAlertaCount > 0 ? 'bg-danger/10 text-danger' : 'bg-success/10 text-success'
              )}
            >
              <AlertTriangle className="h-6 w-6" strokeWidth={1.5} />
            </div>
            <div className="min-w-0">
              <p className="text-3xl font-semibold font-mono tabular-nums tracking-tight text-neutral-700">{mpAlertaCount}</p>
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-neutral-700/80">MP en Alerta</p>
                {mpAlertaCount > 0 && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-danger/10 px-2 py-0.5 text-xs font-medium text-danger">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="absolute inline-flex h-full w-full animate-pulse rounded-full bg-danger opacity-75" />
                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-danger" />
                    </span>
                    Urgente
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border border-accent-miel/30 shadow-xl bg-gradient-to-br from-neutral-50 to-white p-0 transition-all duration-300 hover:shadow-2xl hover:rotate-0 rotate-1">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Package className="h-6 w-6" strokeWidth={1.5} />
            </div>
            <div className="min-w-0">
              <p className="text-3xl font-semibold font-mono tabular-nums tracking-tight text-neutral-700">{lotsStockCount}</p>
              <p className="text-sm font-medium text-neutral-700/80">Lotes en Stock</p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border border-accent-miel/30 shadow-xl bg-gradient-to-br from-neutral-50 to-white p-0 transition-all duration-300 hover:shadow-2xl hover:rotate-0 rotate-1">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Clock className="h-6 w-6" strokeWidth={1.5} />
            </div>
            <div className="min-w-0">
              <p className="text-3xl font-semibold font-mono tabular-nums tracking-tight text-neutral-700">{lotsExpiringCount}</p>
              <p className="text-sm font-medium text-neutral-700/80">Lotes por Vencer</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Links rápidos */}
      <div className="mb-8 flex flex-wrap gap-4">
        <Button asChild className="transition-all duration-300 rounded-2xl">
          <Link href="/admin/produccion">
            <Factory className="mr-2 h-5 w-5" />
            Ver Producción
          </Link>
        </Button>
        <Button asChild variant="outline" className="transition-all duration-300 rounded-2xl">
          <Link href="/admin/inventario/lotes">
            <Package className="mr-2 h-5 w-5" />
            Ver Inventario
          </Link>
        </Button>
      </div>

      {/* Materias Primas en Alerta */}
      {mpEnAlerta.length > 0 && (
        <Card className="mb-8 rounded-3xl border border-accent-miel/30 shadow-xl bg-gradient-to-br from-neutral-50 to-white transition-all duration-300 hover:shadow-2xl">
          <CardHeader className="p-6 pb-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-display text-2xl font-bold tracking-wide text-neutral-700">
                Materias Primas en Alerta
              </h2>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-danger/10 px-2.5 py-1 text-sm font-medium text-danger">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-pulse rounded-full bg-danger opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-danger" />
                </span>
                Stock bajo mínimo
              </span>
            </div>
            <p className="mt-1 text-sm font-medium text-neutral-700/80">
              Stock actual ≤ stock mínimo
            </p>
          </CardHeader>
          <CardContent className="p-6">
            <div className="rounded-2xl border border-accent-miel/30 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-neutral-200 hover:bg-transparent">
                    <TableHead className="py-4 text-neutral-700">Nombre</TableHead>
                    <TableHead className="py-4 text-neutral-700">Stock actual</TableHead>
                    <TableHead className="py-4 text-neutral-700">Stock mínimo</TableHead>
                    <TableHead className="py-4 text-neutral-700">Unidad</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mpEnAlerta.map((mp) => (
                    <TableRow key={mp.id} className="border-b border-neutral-100 transition-colors duration-200 hover:bg-neutral-50">
                      <TableCell className="py-4 font-medium text-neutral-700">{mp.name}</TableCell>
                      <TableCell className="py-4">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-danger/10 px-2 py-0.5 font-mono tabular-nums text-sm font-medium text-danger">
                          <span className="relative flex h-1.5 w-1.5">
                            <span className="absolute inline-flex h-full w-full animate-pulse rounded-full bg-danger opacity-70" />
                            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-danger" />
                          </span>
                          {mp.current_stock}
                        </span>
                      </TableCell>
                      <TableCell className="py-4 font-mono tabular-nums text-neutral-700">{mp.min_stock}</TableCell>
                      <TableCell className="py-4 font-mono text-xs uppercase text-neutral-700/80">{mp.unit}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lotes próximos a vencer */}
      {lotesPorVencer.length > 0 && (
        <Card className="mb-8 rounded-3xl border border-accent-miel/30 shadow-xl bg-gradient-to-br from-neutral-50 to-white transition-all duration-300 hover:shadow-2xl">
          <CardHeader className="p-6 pb-0">
            <h2 className="font-display text-2xl font-bold tracking-wide text-neutral-700">
              Lotes próximos a vencer
            </h2>
            <p className="text-sm font-medium text-neutral-700/80">
              Vencen en los próximos 30 días
            </p>
          </CardHeader>
          <CardContent className="p-6">
            <div className="rounded-2xl border border-accent-miel/30 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-neutral-200 hover:bg-transparent">
                    <TableHead className="py-4 text-neutral-700">Producto</TableHead>
                    <TableHead className="py-4 text-neutral-700">Lote</TableHead>
                    <TableHead className="py-4 text-neutral-700">Fecha vencimiento</TableHead>
                    <TableHead className="py-4 text-neutral-700">Cantidad disponible</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lotesPorVencer.map((lot) => (
                    <TableRow key={lot.id} className="border-b border-neutral-100 transition-colors duration-200 hover:bg-neutral-50">
                      <TableCell className="py-4 font-medium text-neutral-700">
                        {lot.products?.name ?? '—'}
                      </TableCell>
                      <TableCell className="py-4 font-mono text-xs text-neutral-700/80">{lot.lot_number ?? '—'}</TableCell>
                      <TableCell className="py-4 text-neutral-700">
                        {lot.expiry_date
                          ? new Date(lot.expiry_date).toLocaleDateString('es-MX', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })
                          : '—'}
                      </TableCell>
                      <TableCell className="py-4 font-mono tabular-nums text-neutral-700">
                        {Number(lot.current_quantity).toLocaleString('es-MX')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resumen Financiero */}
      <div className="mb-8">
        <h2 className="font-display mb-6 text-2xl font-bold tracking-wide text-neutral-700">Resumen Financiero</h2>
        <div className="grid gap-6 sm:grid-cols-2">
          <Card
            className={cn(
              'rounded-3xl border shadow-xl bg-gradient-to-br from-neutral-50 to-white p-0 transition-all duration-300 hover:shadow-2xl',
              deudaProveedores > 0 ? 'border-danger/30 bg-danger/5' : 'border-accent-miel/30'
            )}
          >
            <CardContent className="flex items-center gap-4 p-6">
              <div
                className={cn(
                  'flex h-11 w-11 shrink-0 items-center justify-center rounded-lg',
                  deudaProveedores > 0 ? 'bg-danger/10 text-danger' : 'bg-success/10 text-success'
                )}
              >
                <TrendingDown className="h-5 w-5" strokeWidth={1.5} />
              </div>
              <div className="min-w-0">
                {deudaProveedores > 0 ? (
                  <p className="text-3xl font-semibold font-mono tabular-nums tracking-tight text-neutral-700">
                    ${deudaProveedores.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </p>
                ) : (
                  <p className="text-xl font-semibold font-mono text-success">Al día</p>
                )}
                <p className="text-sm font-medium text-neutral-700/80">Deuda con Proveedores</p>
              </div>
            </CardContent>
          </Card>
          <Card
            className={cn(
              'rounded-3xl border shadow-xl bg-gradient-to-br from-neutral-50 to-white p-0 transition-all duration-300 hover:shadow-2xl',
              deudaClientes > 0 ? 'border-danger/30 bg-danger/5' : 'border-accent-miel/30'
            )}
          >
            <CardContent className="flex items-center gap-4 p-6">
              <div
                className={cn(
                  'flex h-11 w-11 shrink-0 items-center justify-center rounded-lg',
                  deudaClientes > 0 ? 'bg-danger/10 text-danger' : 'bg-success/10 text-success'
                )}
              >
                <TrendingUp className="h-5 w-5" strokeWidth={1.5} />
              </div>
              <div className="min-w-0">
                {deudaClientes > 0 ? (
                  <p className="text-3xl font-semibold font-mono tabular-nums tracking-tight text-neutral-700">
                    ${deudaClientes.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </p>
                ) : (
                  <p className="text-xl font-semibold font-mono text-success">Sin deuda</p>
                )}
                <p className="text-sm font-medium text-neutral-700/80">Por Cobrar a Clientes</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Alertas Operativas */}
      {(deudaProveedores > 0 || mpEnAlerta.length > 0 || lotesVencenEn7Dias.length > 0) && (
        <div className="space-y-6">
          <h2 className="font-display text-2xl font-bold tracking-wide text-neutral-700">Alertas Operativas</h2>
          {deudaProveedores > 0 && (
            <div className="rounded-2xl border border-primary/30 bg-primary/10 px-5 py-4 transition-all duration-300">
              <p className="text-sm font-medium text-primary">
                Tienes deuda pendiente con proveedores por $
                {deudaProveedores.toLocaleString('es-MX', { minimumFractionDigits: 2 })}.{' '}
                <Link
                  href="/admin/compras"
                  className="font-medium text-neutral-700 underline hover:no-underline transition-colors duration-200"
                >
                  Ve a Compras
                </Link>{' '}
                para registrar pagos.
              </p>
            </div>
          )}
          {mpEnAlerta.length > 0 && (
            <div className="rounded-2xl border border-danger/20 bg-danger/10 px-5 py-4 transition-all duration-300">
              <p className="text-sm font-medium text-danger">
                {mpEnAlerta.length} materia{mpEnAlerta.length === 1 ? '' : 's'} prima
                {mpEnAlerta.length === 1 ? ' está' : 's están'} bajo el stock mínimo.{' '}
                <Link
                  href="/admin/inventario"
                  className="font-medium text-neutral-700 underline hover:no-underline transition-colors duration-200"
                >
                  Ver Inventario
                </Link>
              </p>
            </div>
          )}
          {lotesVencenEn7Dias.length > 0 && (
            <div className="rounded-2xl border border-danger/20 bg-danger/10 px-5 py-4 transition-all duration-300">
              <p className="text-sm font-medium text-danger">
                {lotesVencenEn7Dias.length} lote{lotesVencenEn7Dias.length === 1 ? '' : 's'}{' '}
                vence{lotesVencenEn7Dias.length === 1 ? '' : 'n'} en menos de 7 días.{' '}
                <Link
                  href="/admin/inventario/lotes"
                  className="font-medium text-neutral-700 underline hover:no-underline transition-colors duration-200"
                >
                  Ver Lotes
                </Link>
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
