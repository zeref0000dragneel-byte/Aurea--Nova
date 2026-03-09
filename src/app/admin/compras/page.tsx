import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'
import { ShoppingBag, Eye, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
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

type PurchaseRow = {
  id: string
  raw_material_id: string
  supplier: string
  quantity: number
  unit_cost: number
  total: number
  paid_amount: number
  payment_status: 'pendiente' | 'parcial' | 'pagado' | 'cancelado'
  purchase_date: string
  invoice_number: string | null
  reception_status: 'pendiente' | 'recibido_completo' | 'recibido_parcial' | 'cancelado' | null
  raw_materials: { name: string; unit: string; purchase_unit?: string; operative_unit?: string } | null
}

type ReceptionFilter = 'todas' | 'pendientes' | 'recibidas' | 'canceladas'

const RECEPTION_BADGE: Record<string, { className: string; label: string }> = {
  pendiente: { className: 'bg-primary/10 text-primary border-primary/30 hover:bg-primary/10', label: '⏳ Pendiente de recibir' },
  recibido_completo: { className: 'bg-emerald-500/10 text-emerald-800 border-emerald-200/50 hover:bg-emerald-500/10', label: '✓ Recibido completo' },
  recibido_parcial: { className: 'bg-blue-500/10 text-blue-800 border-blue-200/50 hover:bg-blue-500/10', label: '⚠ Recibido parcial' },
  cancelado: { className: 'bg-red-500/10 text-red-800 border-red-200/50 hover:bg-red-500/10', label: '✗ Cancelado' },
}

const PAYMENT_BADGE: Record<string, { variant: 'destructive' | 'secondary' | 'default'; className: string }> = {
  pendiente: { variant: 'destructive', className: 'bg-red-500/10 text-red-800 border-red-200/50 hover:bg-red-500/10' },
  parcial: { variant: 'secondary', className: 'bg-primary/10 text-primary border-primary/30 hover:bg-primary/10' },
  pagado: { variant: 'default', className: 'bg-emerald-500/10 text-emerald-800 border-emerald-200/50 hover:bg-emerald-500/10' },
  cancelado: { variant: 'destructive', className: 'bg-neutral-200/80 text-neutral-700 border-0' },
}

const PAYMENT_LABEL: Record<string, string> = {
  pendiente: 'Pendiente',
  parcial: 'Parcial',
  pagado: 'Pagado',
  cancelado: 'Cancelado',
}

export default async function AdminComprasPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const params = await searchParams
  const supabase = createAdminClient()
  const statusFilter = (params.status as ReceptionFilter) ?? 'todas'

  const { data: purchasesData } = await supabase
    .from('purchases')
    .select('id, supplier, quantity, unit_cost, total, paid_amount, payment_status, purchase_date, invoice_number, received_quantity, reception_status, raw_material_id, conversion_factor, operative_quantity, created_at')
    .order('created_at', { ascending: false })

  const { data: rawMatsData } = await supabase
    .from('raw_materials')
    .select('id, name, unit, purchase_unit, operative_unit')

  const allPurchases: PurchaseRow[] = (purchasesData ?? []).map((p) => ({
    ...p,
    raw_materials: rawMatsData?.find((r) => r.id === p.raw_material_id) ?? null,
  }))

  let purchases = allPurchases

  if (statusFilter === 'pendientes') {
    purchases = purchases.filter((p) => (p.reception_status ?? 'pendiente') === 'pendiente')
  } else if (statusFilter === 'recibidas') {
    purchases = purchases.filter(
      (p) => p.reception_status === 'recibido_completo' || p.reception_status === 'recibido_parcial'
    )
  } else if (statusFilter === 'canceladas') {
    purchases = purchases.filter((p) => p.reception_status === 'cancelado')
  }

  const pendientesRecibirCount = allPurchases.filter(
    (p) => (p.reception_status ?? 'pendiente') === 'pendiente'
  ).length

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)

  const comprasEsteMes = allPurchases.filter((p) => {
    const d = new Date(p.purchase_date)
    return d >= startOfMonth && d <= endOfMonth
  })
  const totalCompradoEsteMes = comprasEsteMes.reduce((s, p) => s + Number(p.total), 0)

  // Compras con deuda activa: solo pendiente o parcial (excluir pagado y cancelado)
  const comprasConDeudaActiva = allPurchases.filter(
    (p) => p.payment_status === 'pendiente' || p.payment_status === 'parcial'
  )
  const deudaTotal = comprasConDeudaActiva.reduce(
    (s, p) => s + (Number(p.total) - Number(p.paid_amount)),
    0
  )
  const deudaPorProveedor: Record<string, number> = {}
  comprasConDeudaActiva.forEach((p) => {
    const saldo = Number(p.total) - Number(p.paid_amount)
    deudaPorProveedor[p.supplier] = (deudaPorProveedor[p.supplier] ?? 0) + saldo
  })
  const proveedoresConDeuda = Object.entries(deudaPorProveedor).map(([supplier, amount]) => ({
    supplier,
    amount,
  }))

  const filterLinks: { value: ReceptionFilter; label: string }[] = [
    { value: 'todas', label: 'Todas' },
    { value: 'pendientes', label: 'Pendientes de recibir' },
    { value: 'recibidas', label: 'Recibidas' },
    { value: 'canceladas', label: 'Canceladas' },
  ]

  return (
    <div className="p-6">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-wide text-neutral-700">
            Compras a Proveedores
          </h1>
          <p className="mt-2 text-sm font-medium text-neutral-700/80">
            Registro de compras de materias primas
          </p>
        </div>
        <Button asChild className="shrink-0 sm:mt-0 transition-colors duration-200">
          <Link href="/admin/compras/nuevo">
            <ShoppingBag className="mr-2 h-4 w-4" />
            Nueva Compra
          </Link>
        </Button>
      </div>

      <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-3xl border border-accent-miel/30 shadow-xl bg-gradient-to-br from-neutral-50 to-white transition-all duration-300 hover:shadow-2xl">
          <CardContent className="pt-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-700/80">
              Total Comprado este Mes
            </p>
            <p className="mt-1 text-2xl font-mono tabular-nums text-neutral-700">
              ${totalCompradoEsteMes.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>
        <Card className={cn('rounded-3xl border shadow-xl bg-gradient-to-br from-neutral-50 to-white transition-all duration-300 hover:shadow-2xl', deudaTotal > 0 && 'border-danger/30')}>
          <CardContent className="pt-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-700/80">
              Deuda con Proveedores
            </p>
            <p
              className={cn(
                'mt-1 text-2xl font-mono tabular-nums',
                deudaTotal > 0 ? 'text-danger' : 'text-neutral-700'
              )}
            >
              ${deudaTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-3xl border border-accent-miel/30 shadow-xl bg-gradient-to-br from-neutral-50 to-white transition-all duration-300 hover:shadow-2xl">
          <CardContent className="pt-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-700/80">
              Compras este Mes
            </p>
            <p className="mt-1 text-2xl font-mono tabular-nums text-neutral-700">
              {comprasEsteMes.length}
            </p>
          </CardContent>
        </Card>
        <Card
          className={cn(
            'rounded-3xl border shadow-xl bg-gradient-to-br from-neutral-50 to-white transition-all duration-300 hover:shadow-2xl',
            pendientesRecibirCount > 0 ? 'border-primary/30 bg-primary/5' : 'border-accent-miel/30'
          )}
        >
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Clock className={`h-5 w-5 transition-colors duration-200 ${pendientesRecibirCount > 0 ? 'text-primary' : 'text-neutral-400'}`} />
              <div>
                <p className="text-2xl font-mono tabular-nums text-neutral-700">{pendientesRecibirCount}</p>
                <p className="text-sm font-medium text-neutral-700/80">Pendientes de recibir</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mb-6 flex gap-1 rounded-2xl border border-accent-miel/30 bg-neutral-50/80 p-1">
        {filterLinks.map(({ value, label }) => (
          <Link
            key={value}
            href={value === 'todas' ? '/admin/compras' : `/admin/compras?status=${value}`}
            className={cn(
              'rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-200',
              statusFilter === value
                ? 'bg-white text-neutral-700 shadow-sm'
                : 'text-neutral-700 hover:bg-white/60 hover:text-neutral-900'
            )}
          >
            {label}
          </Link>
        ))}
      </div>

      <div className="mb-8 premium-table-wrap">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Fecha</TableHead>
              <TableHead>Materia Prima</TableHead>
              <TableHead>Proveedor</TableHead>
              <TableHead>Cantidad</TableHead>
              <TableHead>Recepción</TableHead>
              <TableHead>Costo Unit.</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Pagado</TableHead>
              <TableHead>Por pagar</TableHead>
              <TableHead>Estado pago</TableHead>
              <TableHead>Factura</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {purchases.length === 0 ? (
              <TableRow>
                <TableCell colSpan={12} className="p-0">
                  <EmptyState icon={ShoppingBag} variant="cell" />
                </TableCell>
              </TableRow>
            ) : (
              purchases.map((p) => {
                const porPagar = Number(p.total) - Number(p.paid_amount)
                const statusConf = PAYMENT_BADGE[p.payment_status] ?? PAYMENT_BADGE.pendiente
                const receptionStatus = (p.reception_status ?? 'pendiente') as keyof typeof RECEPTION_BADGE
                const receptionConf = RECEPTION_BADGE[receptionStatus] ?? RECEPTION_BADGE.pendiente
                return (
                  <TableRow key={p.id}>
                    <TableCell className="text-neutral-700">
                      {new Date(p.purchase_date).toLocaleDateString('es-MX', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </TableCell>
                    <TableCell className="font-medium text-neutral-800">
                      {p.raw_materials?.name ?? '—'}
                    </TableCell>
                    <TableCell className="text-neutral-700">{p.supplier}</TableCell>
                    <TableCell className="text-neutral-700">
                      {Number(p.quantity).toLocaleString('es-MX')}{' '}
                      <span className="font-mono text-[12px] uppercase text-zinc-500">{p.raw_materials?.unit ?? ''}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="pill" className={cn('border-0', receptionConf.className)}>
                        {receptionConf.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-semibold tracking-tight text-neutral-700">
                      ${Number(p.unit_cost).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell className="font-mono tabular-nums text-neutral-800">
                      ${Number(p.total).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell className="font-mono tabular-nums text-neutral-700">
                      ${Number(p.paid_amount).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell
                      className={cn(
                        'font-mono tabular-nums',
                        porPagar > 0 && 'text-danger'
                      )}
                    >
                      ${porPagar.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell>
                      <Badge variant="pill" className={cn('border-0', statusConf.className)}>
                        {PAYMENT_LABEL[p.payment_status] ?? p.payment_status}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-[12px] text-zinc-500">
                      {p.invoice_number ?? '—'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 transition-colors duration-200"
                        asChild
                      >
                        <Link href={`/admin/compras/${p.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      <Card className="rounded-3xl border border-accent-miel/30 shadow-xl bg-gradient-to-br from-neutral-50 to-white transition-all duration-300 hover:shadow-2xl">
        <CardContent className="pt-6">
          <h2 className="font-display mb-6 text-2xl font-bold tracking-wide text-neutral-700">Deuda por Proveedor</h2>
          {proveedoresConDeuda.length === 0 ? (
            <p className="rounded-lg border border-success/20 bg-success/10 px-4 py-3 text-sm font-medium text-success">
              Sin deuda con proveedores
            </p>
          ) : (
            <ul className="space-y-2">
              {proveedoresConDeuda.map(({ supplier, amount }) => (
                <li
                  key={supplier}
                  className="flex items-center justify-between rounded-lg border border-neutral-200 bg-neutral-50/50 px-4 py-2"
                >
                  <span className="font-medium text-neutral-700">{supplier}</span>
                  <span className="font-mono tabular-nums text-danger">
                    ${amount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
