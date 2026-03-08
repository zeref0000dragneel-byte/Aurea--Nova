import { createClient } from '@/lib/supabase/server'
import { Package } from 'lucide-react'
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
import { FormFilterProductoLotes } from './form-filter-producto-lotes'

type LotRow = {
  id: string
  product_id: string
  lot_number: string | null
  production_date: string | null
  initial_quantity: number
  current_quantity: number
  committed_quantity: number
  expiry_date: string | null
  products: { name: string; unit: string } | null
}

function getEstadoBadge(lot: LotRow) {
  const { current_quantity, expiry_date } = lot
  if (current_quantity <= 0) {
    return (
      <Badge variant="pill" className="border-0 bg-danger/10 text-danger">
        Agotado
      </Badge>
    )
  }
  if (expiry_date) {
    const expiry = new Date(expiry_date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const daysUntil = (expiry.getTime() - today.getTime()) / (24 * 60 * 60 * 1000)
    if (daysUntil >= 0 && daysUntil <= 30) {
      return (
        <Badge variant="pill" className="border-0 bg-warning/10 text-warning">
          Por vencer
        </Badge>
      )
    }
  }
  return (
    <Badge variant="pill" className="border-0 bg-success/10 text-success">
      Disponible
    </Badge>
  )
}

export default async function AdminInventarioLotesPage({
  searchParams,
}: {
  searchParams: { product_id?: string }
}) {
  const productId = (searchParams.product_id as string)?.trim() ?? ''

  const supabase = await createClient()

  const { data: lots } = await supabase
    .from('inventory_lots')
    .select('*, products(name, unit)')
    .order('production_date', { ascending: true })

  const allLots = (lots ?? []) as unknown as LotRow[]
  const filteredLots = productId ? allLots.filter((l) => l.product_id === productId) : allLots

  const productOptions = Array.from(
    new Map(allLots.map((l) => [l.product_id, { id: l.product_id, name: l.products?.name ?? 'Sin nombre' }])).values()
  ).sort((a, b) => a.name.localeCompare(b.name))

  const hasLots = filteredLots.length > 0

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-semibold tracking-tight text-neutral-700">
          Inventario de Producto Terminado
        </h1>
        <p className="text-sm text-neutral-700/80 mt-1">
          Lotes ordenados FIFO — el más antiguo primero
        </p>
      </div>

      <FormFilterProductoLotes productOptions={productOptions} currentProductId={productId} />

      {hasLots ? (
        <div className="premium-table-wrap">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-neutral-700">Producto</TableHead>
                <TableHead className="text-neutral-700">Lote</TableHead>
                <TableHead className="text-neutral-700">Fecha Producción</TableHead>
                <TableHead className="text-neutral-700">Cantidad Inicial</TableHead>
                <TableHead className="text-neutral-700">Disponible</TableHead>
                <TableHead className="text-neutral-700">Comprometido</TableHead>
                <TableHead className="text-neutral-700">Vencimiento</TableHead>
                <TableHead className="text-neutral-700">Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLots.map((lot) => (
                <TableRow key={lot.id}>
                  <TableCell className="font-medium text-neutral-700">
                    {lot.products?.name ?? '—'}
                  </TableCell>
                  <TableCell className="text-neutral-700">
                    {lot.lot_number ?? '—'}
                  </TableCell>
                  <TableCell className="text-neutral-700">
                    {lot.production_date
                      ? new Date(lot.production_date).toLocaleDateString('es-MX', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })
                      : '—'}
                  </TableCell>
                  <TableCell className="text-neutral-700">
                    {Number(lot.initial_quantity).toLocaleString('es-MX')}
                  </TableCell>
                  <TableCell className="text-neutral-700">
                    {Number(lot.current_quantity).toLocaleString('es-MX')}
                  </TableCell>
                  <TableCell className="text-neutral-700">
                    {Number(lot.committed_quantity).toLocaleString('es-MX')}
                  </TableCell>
                  <TableCell className="text-neutral-700">
                    {lot.expiry_date
                      ? new Date(lot.expiry_date).toLocaleDateString('es-MX', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })
                      : '—'}
                  </TableCell>
                  <TableCell>{getEstadoBadge(lot)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <EmptyState
          icon={Package}
          title="Aún no hay registros."
          description={
            productId
              ? 'No hay lotes para este producto'
              : 'Los lotes aparecerán al completar órdenes de producción'
          }
        />
      )}
    </div>
  )
}
