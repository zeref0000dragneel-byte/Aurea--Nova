import { createClient } from '@/lib/supabase/server'
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
  Tag,
  DollarSign,
  Package,
  ArrowRight,
  Sparkles,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const statusLabel: Record<string, string> = {
  borrador: 'Borrador',
  confirmado: 'Confirmado',
  en_preparacion: 'En Preparación',
  listo: 'Listo',
  entregado: 'Entregado',
  cancelado: 'Cancelado',
}

const statusColor: Record<string, string> = {
  borrador: 'secondary',
  confirmado: 'default',
  en_preparacion: 'default',
  listo: 'default',
  entregado: 'default',
  cancelado: 'destructive',
}

const paymentColor: Record<string, string> = {
  pendiente: 'destructive',
  parcial: 'secondary',
  pagado: 'default',
}

export default async function ClienteWelcomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.email) redirect('/login')

  const { data: customer } = await supabase
    .from('customers')
    .select('id, business_name')
    .eq('email', user.email)
    .eq('is_active', true)
    .maybeSingle()

  if (!customer) {
    return (
      <div className="p-8 max-w-2xl mx-auto">
        <Card className="rounded-3xl border border-accent-miel/30 shadow-xl bg-gradient-to-br from-neutral-50 to-white">
          <CardContent className="pt-6">
            <p className="text-neutral-700 font-medium">
              Tu cuenta no está vinculada a ningún cliente. Contacta al administrador.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const customerId = customer.id
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const thirtyDaysAgoIso = thirtyDaysAgo.toISOString()

  const [
    { data: pedidosActivos },
    { data: todosPedidosParaDeuda },
    { count: conteoEntregadosRaw },
  ] = await Promise.all([
    supabase
      .from('orders')
      .select('id, order_number, status, payment_status, total, paid_amount, delivery_date')
      .eq('customer_id', customerId)
      .in('status', ['borrador', 'confirmado', 'en_preparacion', 'listo'])
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('orders')
      .select('total, paid_amount, payment_status')
      .eq('customer_id', customerId)
      .neq('status', 'cancelado')
      .neq('payment_status', 'pagado'),
    supabase
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .eq('customer_id', customerId)
      .eq('status', 'entregado')
      .gte('created_at', thirtyDaysAgoIso),
  ])

  const deudaTotal =
    (todosPedidosParaDeuda ?? []).reduce(
      (sum: number, o: { total: number; paid_amount: number }) =>
        sum + (Number(o.total) - Number(o.paid_amount)),
      0
    )
  const conteoEntregados = conteoEntregadosRaw ?? 0
  const activos = (pedidosActivos ?? []) as Array<{
    id: string
    order_number: string
    status: string
    payment_status: string
    total: number
    paid_amount: number
    delivery_date: string | null
  }>

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-8">
      {/* Hero bienvenida */}
      <div className="text-center md:text-left">
        <div className="inline-flex items-center gap-2 rounded-2xl bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-4">
          <Sparkles className="h-4 w-4" />
          Portal Cliente
        </div>
        <h1 className="font-display text-3xl md:text-4xl font-bold tracking-wide text-neutral-800">
          Bienvenido, {customer.business_name}
        </h1>
        <p className="text-neutral-600 mt-2 text-base font-medium max-w-xl">
          Aquí puedes ver tu resumen, pedidos y precios. Usa los accesos rápidos para ir a cada sección.
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
                <p className="text-2xl font-bold text-neutral-700">{activos.length}</p>
                <p className="text-xs font-medium text-neutral-700/80">Pedidos activos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className={cn(
            'rounded-3xl shadow-xl transition-all duration-300 hover:shadow-2xl',
            deudaTotal > 0 ? 'border-danger/30 bg-danger/5' : 'border-success/30 bg-success/5'
          )}
        >
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  'flex h-12 w-12 items-center justify-center rounded-2xl',
                  deudaTotal > 0 ? 'bg-danger/10 text-danger' : 'bg-success/10 text-success'
                )}
              >
                <DollarSign className="h-6 w-6" />
              </div>
              <div>
                <p
                  className={cn(
                    'text-2xl font-bold',
                    deudaTotal > 0 ? 'text-danger' : 'text-success'
                  )}
                >
                  ${deudaTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-xs font-medium text-neutral-700/80">Saldo pendiente</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border border-accent-miel/30 shadow-xl bg-gradient-to-br from-neutral-50 to-white transition-all duration-300 hover:shadow-2xl">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Package className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-neutral-700">{conteoEntregados}</p>
                <p className="text-xs font-medium text-neutral-700/80">Entregas este mes</p>
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
            Accede a tus pedidos y precios personalizados
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <Button asChild variant="outline" size="lg" className="h-auto flex-col gap-2 py-6 rounded-2xl border-2 border-accent-miel/40 hover:border-primary/50 hover:bg-primary/5">
              <Link href="/cliente/pedidos" className="flex items-center gap-3 w-full">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <ShoppingCart className="h-6 w-6" />
                </div>
                <div className="flex-1 text-left">
                  <span className="font-semibold text-neutral-800 block">Mis pedidos</span>
                  <span className="text-sm text-neutral-600 font-normal">
                    Ver estado, filtrar y ver detalle de cada pedido
                  </span>
                </div>
                <ArrowRight className="h-5 w-5 text-primary shrink-0" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-auto flex-col gap-2 py-6 rounded-2xl border-2 border-accent-miel/40 hover:border-primary/50 hover:bg-primary/5">
              <Link href="/cliente/precios" className="flex items-center gap-3 w-full">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Tag className="h-6 w-6" />
                </div>
                <div className="flex-1 text-left">
                  <span className="font-semibold text-neutral-800 block">Mis precios</span>
                  <span className="text-sm text-neutral-600 font-normal">
                    Precios especiales y catálogo para tu cuenta
                  </span>
                </div>
                <ArrowRight className="h-5 w-5 text-primary shrink-0" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Vista previa pedidos activos */}
      <Card className="rounded-3xl border border-accent-miel/30 shadow-xl bg-gradient-to-br from-neutral-50 to-white transition-all duration-300 hover:shadow-2xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <h2 className="font-display text-lg font-bold tracking-wide text-neutral-700">
              Pedidos activos
            </h2>
            <p className="text-sm font-medium text-neutral-700/80 mt-0.5">
              Últimos pedidos en curso
            </p>
          </div>
          <Button asChild variant="default" size="sm">
            <Link href="/cliente/pedidos">Ver todos</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {activos.length === 0 ? (
            <p className="text-neutral-700/80 text-sm py-8 text-center font-medium">
              No tienes pedidos activos.
            </p>
          ) : (
            <div className="rounded-2xl border border-accent-miel/30 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-neutral-200 hover:bg-transparent bg-muted/50">
                    <TableHead className="font-semibold text-neutral-700">Pedido</TableHead>
                    <TableHead className="font-semibold text-neutral-700">Estado</TableHead>
                    <TableHead className="font-semibold text-neutral-700">Pago</TableHead>
                    <TableHead className="font-semibold text-neutral-700 text-right">Total</TableHead>
                    <TableHead className="font-semibold text-neutral-700 w-[100px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activos.map((pedido) => {
                    const porPagar = Number(pedido.total) - Number(pedido.paid_amount)
                    return (
                      <TableRow key={pedido.id} className="border-neutral-200">
                        <TableCell className="font-mono text-sm font-medium">
                          {pedido.order_number}
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusColor[pedido.status] as 'secondary' | 'default' | 'destructive'}>
                            {statusLabel[pedido.status]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={paymentColor[pedido.payment_status] as 'secondary' | 'default' | 'destructive'}>
                            {pedido.payment_status.charAt(0).toUpperCase() + pedido.payment_status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          ${Number(pedido.total).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                          {porPagar > 0 && (
                            <span className="text-danger text-xs block">
                              Por pagar: ${porPagar.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button asChild variant="outline" size="sm">
                            <Link href={`/cliente/pedidos/${pedido.id}`}>Ver detalle</Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
