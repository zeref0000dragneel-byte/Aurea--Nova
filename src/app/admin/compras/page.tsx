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
  raw_materials: { name: string; unit: string } | null
}

type ReceptionFilter = 'todas' | 'pendientes' | 'recibidas' | 'canceladas'

const RECEPTION_BADGE: Record<string, { className: string; label: string }> = {
  pendiente: { className: 'bg-amber-500/10 text-amber-800 border-amber-200/50 hover:bg-amber-500/10', label: '⏳ Pendiente de recibir' },
  recibido_completo: { className: 'bg-emerald-500/10 text-emerald-800 border-emerald-200/50 hover:bg-emerald-500/10', label: '✓ Recibido completo' },
  recibido_parcial: { className: 'bg-blue-500/10 text-blue-800 border-blue-200/50 hover:bg-blue-500/10', label: '⚠ Recibido parcial' },
  cancelado: { className: 'bg-red-500/10 text-red-800 border-red-200/50 hover:bg-red-500/10', label: '✗ Cancelado' },
}

const PAYMENT_BADGE: Record<string, { variant: 'destructive' | 'secondary' | 'default'; className: string }> = {
  pendiente: { variant: 'destructive', className: 'bg-red-500/10 text-red-800 border-red-200/50 hover:bg-red-500/10' },
  parcial: { variant: 'secondary', className: 'bg-amber-500/10 text-amber-800 border-amber-200/50 hover:bg-amber-500/10' },
  pagado: { variant: 'default', className: 'bg-emerald-500/10 text-emerald-800 border-emerald-200/50 hover:bg-emerald-500/10' },
  cancelado: { variant: 'destructive', className: 'bg-slate-500/10 text-slate-600 border-slate-200/50 hover:bg-slate-500/10' },
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
  searchParams?: { status?: string }
}) {
  const supabase = createAdminClient()
  const statusFilter = (searchParams?.status as ReceptionFilter) ?? 'todas'

  const [
    { data: purchasesData },
  ] = await Promise.all([
    supabase
      .from('purchases')
      .select(`
        id,
        raw_material_id,
        supplier,
        quantity,
        unit_cost,
        total,
        paid_amount,
        payment_status,
        purchase_date,
        invoice_number,
        created_at,
        reception_status,
        raw_materials(name, unit)
      `)
      .order('created_at', { ascending: false }),
  ])

  let purchases = (purchasesData ?? []) as unknown as PurchaseRow[]

  if (statusFilter === 'pendientes') {
    purchases = purchases.filter((p) => (p.reception_status ?? 'pendiente') === 'pendiente')
  } else if (statusFilter === 'recibidas') {
    purchases = purchases.filter(
      (p) => p.reception_status === 'recibido_completo' || p.reception_status === 'recibido_parcial'
    )
  } else if (statusFilter === 'canceladas') {
    purchases = purchases.filter((p) => p.reception_status === 'cancelado')
  }

  const allPurchases = (purchasesData ?? []) as unknown as PurchaseRow[]
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
    <div className="p-16">
      <div className="mb-16 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-4xl font-light tracking-tight text-slate-900">
            Compras a Proveedores
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Registro de compras de materias primas
          </p>
        </div>
        <Button asChild className="shrink-0 sm:mt-0">
          <Link href="/admin/compras/nuevo">
            <ShoppingBag className="mr-2 h-4 w-4" />
            Nueva Compra
          </Link>
        </Button>
      </div>

      <div className="mb-16 grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-slate-200/50">
          <CardContent className="pt-6">
            <p className="text-[11px] font-medium uppercase tracking-widest text-slate-500">
              Total Comprado este Mes
            </p>
            <p className="mt-1 text-2xl font-mono tabular-nums text-slate-900">
              ${totalCompradoEsteMes.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>
        <Card className={cn('border-slate-200/50', deudaTotal > 0 && 'border-red-200/50')}>
          <CardContent className="pt-6">
            <p className="text-[11px] font-medium uppercase tracking-widest text-slate-500">
              Deuda con Proveedores
            </p>
            <p
              className={cn(
                'mt-1 text-2xl font-mono tabular-nums',
                deudaTotal > 0 ? 'text-red-600' : 'text-slate-900'
              )}
            >
              ${deudaTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>
        <Card className="border-slate-200/50">
          <CardContent className="pt-6">
            <p className="text-[11px] font-medium uppercase tracking-widest text-slate-500">
              Compras este Mes
            </p>
            <p className="mt-1 text-2xl font-mono tabular-nums text-slate-900">
              {comprasEsteMes.length}
            </p>
          </CardContent>
        </Card>
        <Card
          className={cn(
            'border-slate-200/50',
            pendientesRecibirCount > 0 && 'border-amber-200/50 bg-amber-500/5'
          )}
        >
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Clock className={`h-5 w-5 ${pendientesRecibirCount > 0 ? 'text-amber-600' : 'text-slate-400'}`} />
              <div>
                <p className="text-2xl font-mono tabular-nums text-slate-900">{pendientesRecibirCount}</p>
                <p className="text-xs font-medium text-slate-500">Pendientes de recibir</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mb-6 flex gap-1 rounded-xl border border-slate-200/50 bg-slate-50/80 p-1">
        {filterLinks.map(({ value, label }) => (
          <Link
            key={value}
            href={value === 'todas' ? '/admin/compras' : `/admin/compras?status=${value}`}
            className={cn(
              'rounded-lg px-4 py-2 text-sm font-medium transition-colors',
              statusFilter === value
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:bg-white/60 hover:text-slate-900'
            )}
          >
            {label}
          </Link>
        ))}
      </div>

      <div className="mb-16 rounded-xl border border-slate-200/50 bg-white shadow-premium shadow-[inset_0_1px_1px_rgba(255,255,255,0.6)]">
        <Table>
          <TableHeader>
            <TableRow className="border-slate-200/50 hover:bg-transparent">
              <TableHead className="py-5 text-[11px] font-medium uppercase tracking-widest text-slate-500">Fecha</TableHead>
              <TableHead className="py-5 text-[11px] font-medium uppercase tracking-widest text-slate-500">Materia Prima</TableHead>
              <TableHead className="py-5 text-[11px] font-medium uppercase tracking-widest text-slate-500">Proveedor</TableHead>
              <TableHead className="py-5 text-[11px] font-medium uppercase tracking-widest text-slate-500">Cantidad</TableHead>
              <TableHead className="py-5 text-[11px] font-medium uppercase tracking-widest text-slate-500">Recepción</TableHead>
              <TableHead className="py-5 text-[11px] font-medium uppercase tracking-widest text-slate-500">Costo Unit.</TableHead>
              <TableHead className="py-5 text-[11px] font-medium uppercase tracking-widest text-slate-500">Total</TableHead>
              <TableHead className="py-5 text-[11px] font-medium uppercase tracking-widest text-slate-500">Pagado</TableHead>
              <TableHead className="py-5 text-[11px] font-medium uppercase tracking-widest text-slate-500">Por pagar</TableHead>
              <TableHead className="py-5 text-[11px] font-medium uppercase tracking-widest text-slate-500">Estado pago</TableHead>
              <TableHead className="py-5 text-[11px] font-medium uppercase tracking-widest text-slate-500">Factura</TableHead>
              <TableHead className="text-right py-5 text-[11px] font-medium uppercase tracking-widest text-slate-500">Acciones</TableHead>
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
                  <TableRow key={p.id} className="hover:bg-slate-50/80">
                    <TableCell className="py-5 text-slate-700">
                      {new Date(p.purchase_date).toLocaleDateString('es-MX', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </TableCell>
                    <TableCell className="py-5 font-medium text-slate-900">
                      {p.raw_materials?.name ?? '—'}
                    </TableCell>
                    <TableCell className="py-5 text-slate-700">{p.supplier}</TableCell>
                    <TableCell className="py-5 text-slate-700">
                      {Number(p.quantity).toLocaleString('es-MX')}{' '}
                      <span className="font-mono text-[12px] uppercase text-slate-500">{p.raw_materials?.unit ?? ''}</span>
                    </TableCell>
                    <TableCell className="py-5">
                      <Badge variant="outline" className={cn('border', receptionConf.className)}>
                        {receptionConf.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-5 font-semibold tracking-tighter text-slate-700">
                      ${Number(p.unit_cost).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell className="py-5 font-mono tabular-nums text-slate-900">
                      ${Number(p.total).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell className="py-5 text-slate-700 font-mono tabular-nums">
                      ${Number(p.paid_amount).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell
                      className={cn(
                        'py-5 font-mono tabular-nums',
                        porPagar > 0 && 'text-red-600'
                      )}
                    >
                      ${porPagar.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell className="py-5">
                      <Badge variant={statusConf.variant} className={cn('border', statusConf.className)}>
                        {PAYMENT_LABEL[p.payment_status] ?? p.payment_status}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-5 font-mono text-[12px] text-slate-500">
                      {p.invoice_number ?? '—'}
                    </TableCell>
                    <TableCell className="py-5 text-right">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/admin/compras/${p.id}`}>
                          <Eye className="mr-1 h-4 w-4" />
                          Ver
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

      <Card className="border-slate-200/50">
        <CardContent className="pt-6">
          <h2 className="mb-6 text-2xl font-light tracking-tight text-slate-900">Deuda por Proveedor</h2>
          {proveedoresConDeuda.length === 0 ? (
            <p className="rounded-xl border border-emerald-200/50 bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-800">
              Sin deuda con proveedores
            </p>
          ) : (
            <ul className="space-y-2">
              {proveedoresConDeuda.map(({ supplier, amount }) => (
                <li
                  key={supplier}
                  className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-2"
                >
                  <span className="font-medium text-slate-900">{supplier}</span>
                  <span className="font-mono tabular-nums text-red-600">
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
