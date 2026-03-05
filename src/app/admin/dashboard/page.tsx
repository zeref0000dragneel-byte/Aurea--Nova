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
    <div className="p-16">
      <div className="mb-16">
        <h1 className="text-4xl font-light tracking-tight text-slate-900">
          Dashboard
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Resumen operativo
        </p>
      </div>

      {/* Fila de 4 Cards métricas */}
      <div className="mb-16 grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-slate-200/50 shadow-premium">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Factory className="h-5 w-5 text-slate-400" strokeWidth={1.5} />
              <div>
                <p className="text-2xl font-semibold font-mono tabular-nums tracking-tighter text-slate-900">{ordersCount}</p>
                <p className="text-xs font-medium text-slate-500">Órdenes Activas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className={cn(
            'border-slate-200/50 shadow-premium',
            mpAlertaCount > 0 ? 'border-red-200/50' : 'border-emerald-200/50'
          )}
        >
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <AlertTriangle className={`h-5 w-5 ${mpAlertaCount > 0 ? 'text-red-600' : 'text-emerald-600'}`} strokeWidth={1.5} />
              <div>
                <p className="text-2xl font-semibold font-mono tabular-nums tracking-tighter text-slate-900">{mpAlertaCount}</p>
                <p className="text-xs font-medium text-slate-500">MP en Alerta</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/50 shadow-premium">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Package className="h-5 w-5 text-slate-400" strokeWidth={1.5} />
              <div>
                <p className="text-2xl font-semibold font-mono tabular-nums tracking-tighter text-slate-900">{lotsStockCount}</p>
                <p className="text-xs font-medium text-slate-500">Lotes en Stock</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/50 shadow-premium">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Clock className="h-5 w-5 text-slate-400" strokeWidth={1.5} />
              <div>
                <p className="text-2xl font-semibold font-mono tabular-nums tracking-tighter text-slate-900">{lotsExpiringCount}</p>
                <p className="text-xs font-medium text-slate-500">Lotes por Vencer</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Links rápidos — solo un CTA dorado (acento 5%) */}
      <div className="mb-16 flex flex-wrap gap-4">
        <Button asChild>
          <Link href="/admin/produccion">
            <Factory className="mr-2 h-4 w-4" />
            Ver Producción
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/admin/inventario/lotes">
            <Package className="mr-2 h-4 w-4" />
            Ver Inventario
          </Link>
        </Button>
      </div>

      {/* Materias Primas en Alerta */}
      {mpEnAlerta.length > 0 && (
        <Card className="mb-16 border-slate-200/50 shadow-premium">
          <CardHeader>
            <h2 className="text-2xl font-light tracking-tight text-slate-900">
              Materias Primas en Alerta
            </h2>
            <p className="text-sm text-slate-500">
              Stock actual ≤ stock mínimo
            </p>
          </CardHeader>
          <CardContent>
            <div className="rounded-xl border border-slate-200/50">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-slate-200/50 hover:bg-transparent">
                    <TableHead className="py-5 text-[11px] font-medium uppercase tracking-widest text-slate-500">Nombre</TableHead>
                    <TableHead className="py-5 text-[11px] font-medium uppercase tracking-widest text-slate-500">Stock actual</TableHead>
                    <TableHead className="py-5 text-[11px] font-medium uppercase tracking-widest text-slate-500">Stock mínimo</TableHead>
                    <TableHead className="py-5 text-[11px] font-medium uppercase tracking-widest text-slate-500">Unidad</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mpEnAlerta.map((mp) => (
                    <TableRow key={mp.id} className="border-b border-slate-100 hover:bg-slate-50/80">
                      <TableCell className="py-5 font-medium text-slate-900">{mp.name}</TableCell>
                      <TableCell className="py-5 font-mono tabular-nums text-red-600">{mp.current_stock}</TableCell>
                      <TableCell className="py-5 font-mono tabular-nums text-slate-700">{mp.min_stock}</TableCell>
                      <TableCell className="py-5 font-mono text-[12px] uppercase text-slate-500">{mp.unit}</TableCell>
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
        <Card className="mb-16 border-slate-200/50 shadow-premium">
          <CardHeader>
            <h2 className="text-2xl font-light tracking-tight text-slate-900">
              Lotes próximos a vencer
            </h2>
            <p className="text-sm text-slate-500">
              Vencen en los próximos 30 días
            </p>
          </CardHeader>
          <CardContent>
            <div className="rounded-xl border border-slate-200/50">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-slate-200/50 hover:bg-transparent">
                    <TableHead className="py-5 text-[11px] font-medium uppercase tracking-widest text-slate-500">Producto</TableHead>
                    <TableHead className="py-5 text-[11px] font-medium uppercase tracking-widest text-slate-500">Lote</TableHead>
                    <TableHead className="py-5 text-[11px] font-medium uppercase tracking-widest text-slate-500">Fecha vencimiento</TableHead>
                    <TableHead className="py-5 text-[11px] font-medium uppercase tracking-widest text-slate-500">Cantidad disponible</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lotesPorVencer.map((lot) => (
                    <TableRow key={lot.id} className="border-b border-slate-100 hover:bg-slate-50/80">
                      <TableCell className="py-5 font-medium text-slate-900">
                        {lot.products?.name ?? '—'}
                      </TableCell>
                      <TableCell className="py-5 font-mono text-[12px] text-slate-500">{lot.lot_number ?? '—'}</TableCell>
                      <TableCell className="py-5 text-slate-600">
                        {lot.expiry_date
                          ? new Date(lot.expiry_date).toLocaleDateString('es-MX', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })
                          : '—'}
                      </TableCell>
                      <TableCell className="py-5 font-mono tabular-nums text-slate-700">
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
      <div className="mb-16">
        <h2 className="mb-6 text-2xl font-light tracking-tight text-slate-900">Resumen Financiero</h2>
        <div className="grid gap-12 sm:grid-cols-2">
          <Card
            className={cn(
              'border-slate-200/50 shadow-premium',
              deudaProveedores > 0 ? 'border-red-200/50' : 'border-emerald-200/50'
            )}
          >
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <TrendingDown className={`h-5 w-5 ${deudaProveedores > 0 ? 'text-red-600' : 'text-emerald-600'}`} strokeWidth={1.5} />
                <div>
                  {deudaProveedores > 0 ? (
                    <p className="text-2xl font-semibold font-mono tabular-nums tracking-tighter text-red-600">
                      ${deudaProveedores.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </p>
                  ) : (
                    <p className="text-lg font-mono text-emerald-700">Al día</p>
                  )}
                  <p className="text-xs font-medium text-slate-500">Deuda con Proveedores</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card
            className={cn(
              'border-slate-200/50 shadow-premium',
              deudaClientes > 0 ? 'border-red-200/50' : 'border-emerald-200/50'
            )}
          >
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <TrendingUp className={`h-5 w-5 ${deudaClientes > 0 ? 'text-red-600' : 'text-emerald-600'}`} strokeWidth={1.5} />
                <div>
                  {deudaClientes > 0 ? (
                    <p className="text-2xl font-semibold font-mono tabular-nums tracking-tighter text-red-600">
                      ${deudaClientes.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </p>
                  ) : (
                    <p className="text-lg font-mono text-emerald-700">Sin deuda</p>
                  )}
                  <p className="text-xs font-medium text-slate-500">Por Cobrar a Clientes</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Alertas Operativas */}
      {(deudaProveedores > 0 || mpEnAlerta.length > 0 || lotesVencenEn7Dias.length > 0) && (
        <div className="space-y-6">
          <h2 className="text-2xl font-light tracking-tight text-slate-900">Alertas Operativas</h2>
          {deudaProveedores > 0 && (
            <div className="rounded-xl border border-amber-200/50 bg-amber-500/10 px-5 py-4">
              <p className="text-sm font-medium text-amber-800">
                Tienes deuda pendiente con proveedores por $
                {deudaProveedores.toLocaleString('es-MX', { minimumFractionDigits: 2 })}.{' '}
                <Link
                  href="/admin/compras"
                  className="font-medium text-slate-700 underline hover:no-underline"
                >
                  Ve a Compras
                </Link>{' '}
                para registrar pagos.
              </p>
            </div>
          )}
          {mpEnAlerta.length > 0 && (
            <div className="rounded-xl border border-red-200/50 bg-red-500/10 px-5 py-4">
              <p className="text-sm font-medium text-red-800">
                {mpEnAlerta.length} materia{mpEnAlerta.length === 1 ? '' : 's'} prima
                {mpEnAlerta.length === 1 ? ' está' : 's están'} bajo el stock mínimo.{' '}
                <Link
                  href="/admin/inventario"
                  className="font-medium text-slate-700 underline hover:no-underline"
                >
                  Ver Inventario
                </Link>
              </p>
            </div>
          )}
          {lotesVencenEn7Dias.length > 0 && (
            <div className="rounded-xl border border-red-200/50 bg-red-500/10 px-5 py-4">
              <p className="text-sm font-medium text-red-800">
                {lotesVencenEn7Dias.length} lote{lotesVencenEn7Dias.length === 1 ? '' : 's'}{' '}
                vence{lotesVencenEn7Dias.length === 1 ? '' : 'n'} en menos de 7 días.{' '}
                <Link
                  href="/admin/inventario/lotes"
                  className="font-medium text-slate-700 underline hover:no-underline"
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
