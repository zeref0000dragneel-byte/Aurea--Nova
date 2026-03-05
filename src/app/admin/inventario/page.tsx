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
    <div className="p-16">
      <div className="mb-16 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-4xl font-light tracking-tight text-slate-900">
            Inventario
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Materias primas y stock
          </p>
        </div>
        <div className="flex shrink-0 gap-4 sm:mt-0">
          <Button asChild variant="outline" className="font-medium text-slate-700">
            <Link href="/admin/inventario/lotes">
              <Package className="mr-2 h-4 w-4" />
              Ver Lotes
            </Link>
          </Button>
          <Button asChild className="shrink-0">
            <Link href="/admin/inventario/nuevo">
              <Plus className="mr-2 h-4 w-4" />
              Nueva materia prima
            </Link>
          </Button>
        </div>
      </div>

      {hasMaterials ? (
        <div className="rounded-xl border border-slate-200/50 bg-white shadow-premium shadow-[inset_0_1px_1px_rgba(255,255,255,0.6)]">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-200/50 hover:bg-transparent">
                <TableHead className="py-5 text-[11px] font-medium uppercase tracking-widest text-slate-500">Nombre</TableHead>
                <TableHead className="py-5 text-[11px] font-medium uppercase tracking-widest text-slate-500">Unidad</TableHead>
                <TableHead className="py-5 text-[11px] font-medium uppercase tracking-widest text-slate-500">Stock Actual</TableHead>
                <TableHead className="py-5 text-[11px] font-medium uppercase tracking-widest text-slate-500">Stock Mínimo</TableHead>
                <TableHead className="py-5 text-[11px] font-medium uppercase tracking-widest text-slate-500">Costo Unitario</TableHead>
                <TableHead className="py-5 text-[11px] font-medium uppercase tracking-widest text-slate-500">Proveedor</TableHead>
                <TableHead className="py-5 text-[11px] font-medium uppercase tracking-widest text-slate-500">Estado</TableHead>
                <TableHead className="text-right py-5 text-[11px] font-medium uppercase tracking-widest text-slate-500">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {materialList.map((m) => {
                const stockAlert = m.current_stock <= m.min_stock
                return (
                  <TableRow key={m.id} className="hover:bg-slate-50/80">
                    <TableCell className="py-5 font-medium text-slate-900">
                      {m.name}
                    </TableCell>
                    <TableCell className="py-5 font-mono text-[12px] uppercase text-slate-500">
                      {m.unit}
                    </TableCell>
                    <TableCell className="py-5">
                      {stockAlert ? (
                        <Badge className="bg-red-500/10 text-red-800 border-red-200/50 hover:bg-red-500/10">
                          {m.current_stock}
                        </Badge>
                      ) : (
                        <span className="font-semibold tracking-tighter text-slate-700">{m.current_stock}</span>
                      )}
                    </TableCell>
                    <TableCell className="py-5 text-slate-700">
                      {m.min_stock}
                    </TableCell>
                    <TableCell className="py-5 font-mono tabular-nums text-slate-700">
                      ${Number(m.unit_cost).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell className="py-5 text-slate-600">
                      {m.supplier ?? '—'}
                    </TableCell>
                    <TableCell className="py-5">
                      <Badge
                        variant={m.is_active ? 'default' : 'secondary'}
                        className={
                          m.is_active
                            ? 'bg-emerald-500/10 text-emerald-800 border-emerald-200/50 hover:bg-emerald-500/10'
                            : 'bg-slate-500/10 text-slate-600 border-slate-200/50 hover:bg-slate-500/10'
                        }
                      >
                        {m.is_active ? 'Activo' : 'Inactivo'}
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
