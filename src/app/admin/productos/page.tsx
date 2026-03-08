import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Plus, Package, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { BotonEliminarProducto } from '@/components/admin/boton-eliminar-producto'
import { EmptyState } from '@/components/admin/empty-state'
import { TooltipTrigger } from '@/components/ui/tooltip'

export default async function AdminProductosPage() {
  const supabase = await createClient()

  const [
    ,
    { data: products },
  ] = await Promise.all([
    supabase
      .from('product_categories')
      .select('*')
      .order('sort_order'),
    supabase
      .from('products')
      .select('*, product_categories(name)')
      .order('created_at', { ascending: false }),
  ])

  const productList = products ?? []
  const hasProducts = productList.length > 0

  return (
    <div className="p-6">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-wide text-neutral-700">
            Productos
          </h1>
          <p className="mt-2 text-sm font-medium text-neutral-700/80">
            Gestión del catálogo
          </p>
        </div>
        <Button asChild className="shrink-0 sm:mt-0 transition-colors duration-200">
          <Link href="/admin/productos/nuevo">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo producto
          </Link>
        </Button>
      </div>

      {/* Table or empty state */}
      {hasProducts ? (
        <div className="premium-table-wrap">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-neutral-700">SKU</TableHead>
                <TableHead className="text-neutral-700">Nombre</TableHead>
                <TableHead className="text-neutral-700">Categoría</TableHead>
                <TableHead className="text-neutral-700">Precio Base</TableHead>
                <TableHead className="text-neutral-700">Unidad</TableHead>
                <TableHead className="text-neutral-700">Stock Mínimo</TableHead>
                <TableHead className="text-neutral-700">Estado</TableHead>
                <TableHead className="text-right text-neutral-700">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {productList.map((row) => {
                const product = row as {
                  id: string
                  sku: string | null
                  name: string
                  base_price: number
                  unit: string
                  min_stock: number
                  is_active: boolean
                  product_categories: { name: string } | null
                }
                const categoryName = product.product_categories?.name ?? '—'
                return (
                  <TableRow key={product.id}>
                    <TableCell className="font-mono text-xs text-neutral-700/80">
                      {product.sku ?? '—'}
                    </TableCell>
                    <TableCell className="font-medium text-neutral-700">
                      {product.name}
                    </TableCell>
                    <TableCell className="text-neutral-700">
                      {categoryName}
                    </TableCell>
                    <TableCell className="font-mono tabular-nums text-neutral-700">
                      ${Number(product.base_price).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell className="font-mono text-xs uppercase text-neutral-700/80">
                      {product.unit}
                    </TableCell>
                    <TableCell className="font-mono tabular-nums text-neutral-700">
                      {product.min_stock}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="pill"
                        className={
                          product.is_active
                            ? 'bg-success/10 text-success border-0'
                            : 'bg-neutral-200/80 text-neutral-700 border-0'
                        }
                      >
                        {product.is_active ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-0.5">
                        <TooltipTrigger content="Editar">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 transition-colors duration-200"
                            asChild
                          >
                            <Link href={`/admin/productos/${product.id}/editar`}>
                              <Pencil className="h-4 w-4" />
                            </Link>
                          </Button>
                        </TooltipTrigger>
                        <TooltipTrigger content="Eliminar">
                          <span className="inline-flex group">
                            <BotonEliminarProducto productId={product.id} />
                          </span>
                        </TooltipTrigger>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      ) : (
        <EmptyState
          icon={Package}
          title="Aún no hay registros."
          description="Comienza creando uno nuevo."
        />
      )}
    </div>
  )
}
