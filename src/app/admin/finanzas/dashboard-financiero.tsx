'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'

const formatMoneda = (n: number) =>
  `$${n.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

const MESES_ES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

const statusLabel: Record<string, string> = {
  borrador: 'Borrador',
  confirmado: 'Confirmado',
  en_preparacion: 'En Preparación',
  listo: 'Listo',
  entregado: 'Entregado',
  cancelado: 'Cancelado',
}

const statusVariant: Record<string, 'default' | 'secondary' | 'destructive'> = {
  borrador: 'secondary',
  cancelado: 'destructive',
  confirmado: 'default',
  en_preparacion: 'default',
  listo: 'default',
  entregado: 'default',
}

const paymentLabel: Record<string, string> = {
  pendiente: 'Pendiente',
  parcial: 'Parcial',
  pagado: 'Pagado',
}

const paymentVariant: Record<string, 'default' | 'secondary' | 'destructive'> = {
  pendiente: 'destructive',
  parcial: 'secondary',
  pagado: 'default',
}

export type DeudaCliente = { business_name: string; deuda: number }
export type ProductoVendido = {
  product_id: string
  name: string
  unit: string
  quantity: number
  subtotal: number
}
export type PedidoReciente = {
  order_number: string
  status: string
  payment_status: string
  total: number
  paid_amount: number
  created_at: string
  customers: { business_name: string } | null
}

type Props = {
  ventasMesActual: number
  ventasMesAnterior: number
  pedidosMesActual: number
  ticketPromedio: number
  totalCobrado: number
  deudaTotal: number
  pedidosPendientesPago: number
  deudaPorCliente: DeudaCliente[]
  productosMasVendidos: ProductoVendido[]
  pedidosRecientes: PedidoReciente[]
}

export function DashboardFinanciero({
  ventasMesActual,
  ventasMesAnterior,
  pedidosMesActual,
  ticketPromedio,
  totalCobrado,
  deudaTotal,
  pedidosPendientesPago,
  deudaPorCliente,
  productosMasVendidos,
  pedidosRecientes,
}: Props) {
  const now = new Date()
  const mesAnioLabel = `${MESES_ES[now.getMonth()]} ${now.getFullYear()}`

  const variacionVentas =
    ventasMesAnterior > 0
      ? ((ventasMesActual - ventasMesAnterior) / ventasMesAnterior) * 100
      : null
  const porcentajeCobrado =
    ventasMesActual > 0 ? (totalCobrado / ventasMesActual) * 100 : 0
  const maxQuantity =
    productosMasVendidos.length > 0
      ? Math.max(...productosMasVendidos.map((p) => p.quantity))
      : 1

  return (
    <div className="p-6 space-y-8">
      {/* Sección 1 — Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-wide text-neutral-700">
            Dashboard Financiero
          </h1>
          <p className="text-sm font-medium text-neutral-700/80">{mesAnioLabel}</p>
        </div>
        <Badge className="bg-success/90 text-white border-0 rounded-2xl">
          En tiempo real
        </Badge>
      </div>

      {/* Sección 2 — Cards métricas principales */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-3xl border border-accent-miel/30 shadow-xl bg-gradient-to-br from-neutral-50 to-white p-0 transition-all duration-300 hover:shadow-2xl">
          <CardContent className="p-6">
            <p className="text-3xl font-semibold font-mono tabular-nums tracking-tight text-neutral-700">
              {formatMoneda(ventasMesActual)}
            </p>
            <p className="mt-1 text-sm font-medium text-neutral-700/80">
              Ventas del Mes
            </p>
            <p className="mt-0.5 text-xs text-neutral-700/80">
              {variacionVentas === null ? (
                <span>Primer registro</span>
              ) : variacionVentas > 0 ? (
                <span className="text-success">
                  ↑ {variacionVentas.toFixed(1)}% vs mes anterior
                </span>
              ) : variacionVentas < 0 ? (
                <span className="text-danger">
                  ↓ {Math.abs(variacionVentas).toFixed(1)}% vs mes anterior
                </span>
              ) : (
                <span>Sin variación</span>
              )}
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border border-accent-miel/30 shadow-xl bg-gradient-to-br from-neutral-50 to-white p-0 transition-all duration-300 hover:shadow-2xl">
          <CardContent className="p-6">
            <p className="text-3xl font-semibold font-mono tabular-nums tracking-tight text-neutral-700">
              {formatMoneda(totalCobrado)}
            </p>
            <p className="mt-1 text-sm font-medium text-neutral-700/80">
              Cobrado este Mes
            </p>
            <p className="mt-0.5 text-xs text-neutral-700/80">
              De {formatMoneda(ventasMesActual)} en ventas
              {ventasMesActual > 0 && (
                <> ({porcentajeCobrado.toFixed(0)}% cobrado)</>
              )}
            </p>
          </CardContent>
        </Card>

        <Card
          className={cn(
            'rounded-3xl border p-0 shadow-xl bg-gradient-to-br from-neutral-50 to-white transition-all duration-300 hover:shadow-2xl',
            deudaTotal > 0 ? 'border-danger/30 bg-danger/5' : 'border-success/30 bg-success/5'
          )}
        >
          <CardContent className="p-6">
            <p
              className={cn(
                'text-3xl font-semibold font-mono tabular-nums tracking-tight',
                deudaTotal > 0 ? 'text-neutral-700' : 'text-success'
              )}
            >
              {deudaTotal > 0 ? formatMoneda(deudaTotal) : 'Al día'}
            </p>
            <p className="mt-1 text-sm font-medium text-neutral-700/80">
              Deuda Total
            </p>
            <p className="mt-0.5 text-xs text-neutral-700/80">
              {pedidosPendientesPago} pedidos sin cobrar
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border border-accent-miel/30 shadow-xl bg-gradient-to-br from-neutral-50 to-white p-0 transition-all duration-300 hover:shadow-2xl">
          <CardContent className="p-6">
            <p className="text-3xl font-semibold font-mono tabular-nums tracking-tight text-neutral-700">
              {formatMoneda(ticketPromedio)}
            </p>
            <p className="mt-1 text-sm font-medium text-neutral-700/80">
              Ticket Promedio
            </p>
            <p className="mt-0.5 text-xs text-neutral-700/80">
              {pedidosMesActual} pedidos este mes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Sección 3 — Dos columnas */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card className="rounded-3xl border border-accent-miel/30 shadow-xl bg-gradient-to-br from-neutral-50 to-white transition-all duration-300 hover:shadow-2xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 p-6 pb-2">
              <CardTitle className="font-display text-lg font-bold tracking-wide text-neutral-700">Últimos Pedidos</CardTitle>
              <Link
                href="/admin/pedidos"
                className="text-sm font-medium text-primary hover:text-primary/90 transition-colors duration-200"
              >
                Ver todos
              </Link>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-neutral-200 hover:bg-transparent">
                    <TableHead className="font-semibold text-neutral-700">
                      Pedido
                    </TableHead>
                    <TableHead className="font-semibold text-neutral-700">
                      Cliente
                    </TableHead>
                    <TableHead className="font-semibold text-neutral-700">
                      Estado
                    </TableHead>
                    <TableHead className="font-semibold text-neutral-700">
                      Pago
                    </TableHead>
                    <TableHead className="font-semibold text-neutral-700 text-right">
                      Total
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pedidosRecientes.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-neutral-700/80">
                        No hay pedidos recientes
                      </TableCell>
                    </TableRow>
                  ) : (
                    pedidosRecientes.map((p) => (
                      <TableRow key={p.order_number} className="border-neutral-200">
                        <TableCell className="font-mono text-xs text-neutral-700">
                          {p.order_number}
                        </TableCell>
                        <TableCell className="text-neutral-700">
                          {(p.customers as { business_name: string } | null)?.business_name ?? '—'}
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusVariant[p.status] ?? 'default'}>
                            {statusLabel[p.status] ?? p.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {p.status === 'cancelado' ? (
                            <span className="text-neutral-700/80">—</span>
                          ) : (
                            <Badge variant={paymentVariant[p.payment_status] ?? 'default'}>
                              {paymentLabel[p.payment_status] ?? p.payment_status}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right font-medium text-neutral-700">
                          {formatMoneda(Number(p.total))}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="rounded-3xl border border-accent-miel/30 shadow-xl bg-gradient-to-br from-neutral-50 to-white transition-all duration-300 hover:shadow-2xl">
            <CardHeader className="p-6 pb-2">
              <CardTitle className="font-display text-lg font-bold tracking-wide text-neutral-700">Mayor Deuda por Cliente</CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              {deudaPorCliente.length === 0 ? (
                <p className="text-sm font-medium text-success">
                  Sin deuda pendiente
                </p>
              ) : (
                <ul className="space-y-3">
                  {deudaPorCliente.map((c, idx) => (
                    <li key={idx} className="flex flex-col gap-0.5">
                      <span className="font-semibold text-neutral-700">
                        {c.business_name}
                      </span>
                      <span className="text-sm font-medium text-danger">
                        {formatMoneda(c.deuda)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Sección 4 — Productos más vendidos */}
      <Card className="rounded-3xl border border-accent-miel/30 shadow-xl bg-gradient-to-br from-neutral-50 to-white transition-all duration-300 hover:shadow-2xl">
        <CardHeader className="p-6 pb-2">
          <CardTitle className="font-display text-lg font-bold tracking-wide text-neutral-700">
            Productos Más Vendidos — {mesAnioLabel}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          {productosMasVendidos.length === 0 ? (
            <p className="text-sm text-neutral-700/80">No hay ventas este mes.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-neutral-200 hover:bg-transparent">
                  <TableHead className="font-semibold text-neutral-700">
                    Producto
                  </TableHead>
                  <TableHead className="font-semibold text-neutral-700">
                    Unidades vendidas
                  </TableHead>
                  <TableHead className="font-semibold text-neutral-700">
                    Ingresos generados
                  </TableHead>
                  <TableHead className="font-semibold text-neutral-700 w-40">
                    Progreso
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {productosMasVendidos.map((p) => {
                  const pct = maxQuantity > 0 ? (p.quantity / maxQuantity) * 100 : 0
                  return (
                    <TableRow key={p.product_id} className="border-neutral-200">
                      <TableCell className="font-medium text-neutral-700">
                        {p.name}
                      </TableCell>
                      <TableCell className="text-neutral-700">
                        {p.quantity.toLocaleString('es-MX')} {p.unit}
                      </TableCell>
                      <TableCell className="text-neutral-700">
                        {formatMoneda(p.subtotal)}
                      </TableCell>
                      <TableCell>
                        <div className="w-full rounded-full h-2 bg-primary/20">
                          <div
                            className="h-2.5 rounded-full bg-primary transition-all duration-300"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
