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
    <div className="p-16">
      <div className="mb-16 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-4xl font-light tracking-tight text-slate-900">
            Productos
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Gestión del catálogo
          </p>
        </div>
        <Button asChild className="shrink-0 sm:mt-0">
          <Link href="/admin/productos/nuevo">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo producto
          </Link>
        </Button>
      </div>

      {/* Table or empty state */}
      {hasProducts ? (
        <div className="rounded-xl border border-slate-200/50 bg-white shadow-premium shadow-[inset_0_1px_1px_rgba(255,255,255,0.6)]">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-200/50 hover:bg-transparent">
                <TableHead className="py-5 text-[11px] font-medium uppercase tracking-widest text-slate-500">SKU</TableHead>
                <TableHead className="py-5 text-[11px] font-medium uppercase tracking-widest text-slate-500">Nombre</TableHead>
                <TableHead className="py-5 text-[11px] font-medium uppercase tracking-widest text-slate-500">Categoría</TableHead>
                <TableHead className="py-5 text-[11px] font-medium uppercase tracking-widest text-slate-500">Precio Base</TableHead>
                <TableHead className="py-5 text-[11px] font-medium uppercase tracking-widest text-slate-500">Unidad</TableHead>
                <TableHead className="py-5 text-[11px] font-medium uppercase tracking-widest text-slate-500">Stock Mínimo</TableHead>
                <TableHead className="py-5 text-[11px] font-medium uppercase tracking-widest text-slate-500">Estado</TableHead>
                <TableHead className="text-right py-5 text-[11px] font-medium uppercase tracking-widest text-slate-500">Acciones</TableHead>
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
                  <TableRow key={product.id} className="hover:bg-slate-50/80">
                    <TableCell className="py-5 font-mono text-[12px] text-slate-500">
                      {product.sku ?? '—'}
                    </TableCell>
                    <TableCell className="py-5 font-medium text-slate-900">
                      {product.name}
                    </TableCell>
                    <TableCell className="py-5 text-slate-600">
                      {categoryName}
                    </TableCell>
                    <TableCell className="py-5 font-mono tabular-nums text-slate-700">
                      ${Number(product.base_price).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell className="py-5 font-mono text-[12px] uppercase text-slate-500">
                      {product.unit}
                    </TableCell>
                    <TableCell className="py-5 text-slate-700 font-mono tabular-nums">
                      {product.min_stock}
                    </TableCell>
                    <TableCell className="py-5">
                      <Badge
                        variant={product.is_active ? 'default' : 'secondary'}
                        className={
                          product.is_active
                            ? 'bg-emerald-500/10 text-emerald-800 border-emerald-200/50 hover:bg-emerald-500/10'
                            : 'bg-slate-500/10 text-slate-600 border-slate-200/50 hover:bg-slate-500/10'
                        }
                      >
                        {product.is_active ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <TooltipTrigger content="Editar">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
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
