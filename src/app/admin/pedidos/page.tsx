import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Plus, ShoppingCart } from 'lucide-react'
import { EmptyState } from '@/components/admin/empty-state'

const statusLabel: Record<string, string> = {
  borrador: 'Borrador',
  confirmado: 'Confirmado',
  en_preparacion: 'En Preparación',
  listo: 'Listo',
  entregado: 'Entregado',
  cancelado: 'Cancelado',
}

const statusColor: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  borrador: 'secondary',
  confirmado: 'default',
  en_preparacion: 'default',
  listo: 'default',
  entregado: 'default',
  cancelado: 'destructive',
}

const paymentColor: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  pendiente: 'destructive',
  parcial: 'secondary',
  pagado: 'default',
}

const paymentLabel: Record<string, string> = {
  pendiente: 'Pendiente',
  parcial: 'Parcial',
  pagado: 'Pagado',
}

type PedidoRow = {
  id: string
  order_number: string
  status: string
  payment_status: string
  total: number
  paid_amount: number
  delivery_date: string | null
  created_at: string
  customer_id: string
  customers: { business_name: string } | null
}

export default async function PedidosPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()
  const filtroStatus = params.status || 'todos'

  let query = supabase
    .from('orders')
    .select('id, order_number, status, payment_status, total, paid_amount, delivery_date, created_at, customer_id')
    .order('created_at', { ascending: false })

  if (filtroStatus !== 'todos') {
    query = query.eq('status', filtroStatus)
  }

  const { data: ordersData } = await query
  const { data: customersData } = await supabase
    .from('customers')
    .select('id, business_name')

  const pedidos: PedidoRow[] = (ordersData ?? []).map((order) => ({
    ...order,
    customers: customersData?.find((c) => c.id === order.customer_id) ?? null,
  }))

  const tabs = [
    { key: 'todos', label: 'Todos' },
    { key: 'borrador', label: 'Borrador' },
    { key: 'confirmado', label: 'Confirmados' },
    { key: 'en_preparacion', label: 'En Preparación' },
    { key: 'listo', label: 'Listos' },
    { key: 'entregado', label: 'Entregados' },
    { key: 'cancelado', label: 'Cancelados' },
  ]

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-wide text-neutral-700">Pedidos</h1>
          <p className="text-sm font-medium text-neutral-700/80 mt-1">
            {pedidos?.length ?? 0} pedido{pedidos?.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button asChild className="rounded-2xl transition-all duration-300">
          <Link href="/admin/pedidos/nuevo">
            <Plus className="w-5 h-5 mr-2" />
            Nuevo Pedido
          </Link>
        </Button>
      </div>

      {/* Tabs de filtro */}
      <div className="flex gap-2 flex-wrap">
        {tabs.map(tab => (
          <Link key={tab.key} href={`/admin/pedidos?status=${tab.key}`}>
            <Button
              variant={filtroStatus === tab.key ? 'default' : 'outline'}
              size="sm"
              className="transition-colors duration-200"
            >
              {tab.label}
            </Button>
          </Link>
        ))}
      </div>

      {/* Tabla */}
      {!pedidos || pedidos.length === 0 ? (
        <EmptyState
          icon={ShoppingCart}
          title="Aún no hay registros."
          description="Comienza creando uno nuevo."
        />
      ) : (
        <div className="premium-table-wrap">
          <table className="w-full text-sm">
            <thead className="bg-gradient-to-r from-primary/10 to-accent-miel/5">
              <tr>
                <th className="text-left p-4 font-semibold text-neutral-700">Pedido</th>
                <th className="text-left p-4 font-semibold text-neutral-700">Cliente</th>
                <th className="text-left p-4 font-semibold text-neutral-700">Estado</th>
                <th className="text-left p-4 font-semibold text-neutral-700">Pago</th>
                <th className="text-right p-4 font-semibold text-neutral-700">Total</th>
                <th className="text-right p-4 font-semibold text-neutral-700">Por cobrar</th>
                <th className="text-left p-4 font-semibold text-neutral-700">Entrega</th>
                <th className="text-left p-4 font-semibold text-neutral-700"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {pedidos.map((pedido: PedidoRow) => {
                return (
                  <tr key={pedido.id} className="border-b border-neutral-200 transition-all duration-300 hover:bg-neutral-50/80">
                    <td className="p-4 font-mono text-xs font-medium text-neutral-700">
                      {pedido.order_number}
                    </td>
                    <td className="p-4 text-neutral-700">
                      {pedido.customers?.business_name ?? '—'}
                    </td>
                    <td className="p-4">
                      <Badge variant={statusColor[pedido.status]}>
                        {statusLabel[pedido.status]}
                      </Badge>
                    </td>
                    <td className="p-4">
                      {pedido.status === 'cancelado' ? (
                        <span className="text-neutral-700/80 text-sm">—</span>
                      ) : (
                        <Badge variant={paymentColor[pedido.payment_status] ?? 'default'}>
                          {paymentLabel[pedido.payment_status] ?? pedido.payment_status}
                        </Badge>
                      )}
                    </td>
                    <td className="p-4 text-right font-medium text-neutral-700">
                      ${Number(pedido.total).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-4 text-right">
                      {pedido.status === 'cancelado' ? (
                        <span className="text-neutral-700/80">—</span>
                      ) : pedido.payment_status === 'pagado' ? (
                        <span className="text-success font-medium">Pagado</span>
                      ) : (
                        <span className="text-danger font-medium">
                          ${(Number(pedido.total) - Number(pedido.paid_amount)).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-neutral-700/80">
                      {pedido.delivery_date
                        ? new Date(pedido.delivery_date + 'T00:00:00').toLocaleDateString('es-MX')
                        : '—'}
                    </td>
                    <td className="p-4">
                      <Button asChild variant="ghost" size="sm" className="transition-colors duration-200">
                        <Link href={`/admin/pedidos/${pedido.id}`}>Ver</Link>
                      </Button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
