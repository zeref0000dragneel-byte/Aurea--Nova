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
      <Badge className="border-red-200 bg-red-100 text-red-800 hover:bg-red-100">
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
        <Badge className="border-amber-200 bg-amber-100 text-amber-800 hover:bg-amber-100">
          Por vencer
        </Badge>
      )
    }
  }
  return (
    <Badge className="border-emerald-200 bg-emerald-100 text-emerald-800 hover:bg-emerald-100">
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
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          Inventario de Producto Terminado
        </h1>
        <p className="text-sm text-gray-500">
          Lotes ordenados FIFO — el más antiguo primero
        </p>
      </div>

      <FormFilterProductoLotes productOptions={productOptions} currentProductId={productId} />

      {hasLots ? (
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="border-gray-200 hover:bg-transparent">
                <TableHead className="h-11 font-semibold text-gray-700">Producto</TableHead>
                <TableHead className="h-11 font-semibold text-gray-700">Lote</TableHead>
                <TableHead className="h-11 font-semibold text-gray-700">Fecha Producción</TableHead>
                <TableHead className="h-11 font-semibold text-gray-700">Cantidad Inicial</TableHead>
                <TableHead className="h-11 font-semibold text-gray-700">Disponible</TableHead>
                <TableHead className="h-11 font-semibold text-gray-700">Comprometido</TableHead>
                <TableHead className="h-11 font-semibold text-gray-700">Vencimiento</TableHead>
                <TableHead className="h-11 font-semibold text-gray-700">Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLots.map((lot) => (
                <TableRow key={lot.id} className="border-gray-100">
                  <TableCell className="font-medium text-gray-900">
                    {lot.products?.name ?? '—'}
                  </TableCell>
                  <TableCell className="text-gray-700">
                    {lot.lot_number ?? '—'}
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {lot.production_date
                      ? new Date(lot.production_date).toLocaleDateString('es-MX', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })
                      : '—'}
                  </TableCell>
                  <TableCell className="text-gray-700">
                    {Number(lot.initial_quantity).toLocaleString('es-MX')}
                  </TableCell>
                  <TableCell className="text-gray-700">
                    {Number(lot.current_quantity).toLocaleString('es-MX')}
                  </TableCell>
                  <TableCell className="text-gray-700">
                    {Number(lot.committed_quantity).toLocaleString('es-MX')}
                  </TableCell>
                  <TableCell className="text-gray-600">
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
