import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Plus, Warehouse, Pencil, Package } from 'lucide-react'
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
import { BotonEliminarMateriaPrima } from '@/components/admin/boton-eliminar-materia-prima'
import { EmptyState } from '@/components/admin/empty-state'
import { TooltipTrigger } from '@/components/ui/tooltip'

export default async function AdminInventarioPage() {
  const supabase = await createClient()

  const { data: materials } = await supabase
    .from('raw_materials')
    .select('*')
    .order('name')

  const materialList = materials ?? []
  const hasMaterials = materialList.length > 0

  return (
    <div className="p-6">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-wide text-neutral-700">
            Inventario
          </h1>
          <p className="mt-2 text-sm font-medium text-neutral-700/80">
            Materias primas y stock
          </p>
        </div>
        <div className="flex shrink-0 gap-4 sm:mt-0">
          <Button asChild variant="outline" className="font-medium text-neutral-700 transition-colors duration-200">
            <Link href="/admin/inventario/lotes">
              <Package className="mr-2 h-4 w-4" />
              Ver Lotes
            </Link>
          </Button>
          <Button asChild className="shrink-0 transition-colors duration-200">
            <Link href="/admin/inventario/nuevo">
              <Plus className="mr-2 h-4 w-4" />
              Nueva materia prima
            </Link>
          </Button>
        </div>
      </div>

      {hasMaterials ? (
        <div className="premium-table-wrap">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Nombre</TableHead>
                <TableHead>Unidad</TableHead>
                <TableHead>Stock Actual</TableHead>
                <TableHead>Stock Mínimo</TableHead>
                <TableHead>Costo Unitario</TableHead>
                <TableHead>Proveedor</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {materialList.map((m) => {
                const stockAlert = m.current_stock <= m.min_stock
                return (
                  <TableRow key={m.id}>
                    <TableCell className="font-medium text-neutral-700">
                      {m.name}
                    </TableCell>
                    <TableCell className="font-mono text-xs uppercase text-neutral-700/80">
                      {m.unit}
                    </TableCell>
                    <TableCell>
                      {stockAlert ? (
                        <Badge variant="pill" className="bg-danger/10 text-danger border-0">
                          {m.current_stock}
                        </Badge>
                      ) : (
                        <span className="font-semibold tracking-tight text-neutral-700">{m.current_stock}</span>
                      )}
                    </TableCell>
                    <TableCell className="text-neutral-700">
                      {m.min_stock}
                    </TableCell>
                    <TableCell className="font-mono tabular-nums text-neutral-700">
                      ${Number(m.unit_cost).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell className="text-neutral-700">
                      {m.supplier ?? '—'}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="pill"
                        className={
                          m.is_active
                            ? 'bg-success/10 text-success border-0'
                            : 'bg-neutral-200/80 text-neutral-700 border-0'
                        }
                      >
                        {m.is_active ? 'Activo' : 'Inactivo'}
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
                            <Link href={`/admin/inventario/${m.id}/editar`}>
                              <Pencil className="h-4 w-4" />
                            </Link>
                          </Button>
                        </TooltipTrigger>
                        <TooltipTrigger content="Eliminar">
                          <span className="inline-flex group">
                            <BotonEliminarMateriaPrima materialId={m.id} />
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
          icon={Warehouse}
          title="Aún no hay registros."
          description="Comienza creando uno nuevo."
        />
      )}
    </div>
  )
}
