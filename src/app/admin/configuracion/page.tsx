import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Plus, Pencil, FolderTree, MessageCircle } from 'lucide-react'
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
import { BotonEliminarCategoria } from '@/components/admin/boton-eliminar-categoria'
import { FormCrearCategoriaInline } from './form-crear-categoria-inline'
import { EmptyState } from '@/components/admin/empty-state'
import { TooltipTrigger } from '@/components/ui/tooltip'

export default async function AdminConfiguracionPage() {
  const supabase = await createClient()

  const { data: categories } = await supabase
    .from('product_categories')
    .select('*')
    .order('sort_order')

  const categoryList = categories ?? []
  const hasCategories = categoryList.length > 0

  return (
    <div className="p-16">
      <div className="mb-16">
        <h1 className="text-4xl font-light tracking-tight text-slate-900">
          Configuración
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Administración del sistema
        </p>
      </div>

      {/* Enlaces de configuración como Cards de Ajustes */}
      <section className="mb-16">
        <h2 className="mb-6 text-2xl font-light tracking-tight text-slate-900">
          Ajustes
        </h2>
        <div className="space-y-3">
          <Link
            href="/admin/configuracion/telegram"
            className="flex items-center gap-4 rounded-xl border border-slate-200/50 bg-white px-6 py-5 shadow-premium shadow-[inset_0_1px_1px_rgba(255,255,255,0.6)] transition-colors hover:bg-slate-50/80"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
              <MessageCircle className="h-5 w-5" strokeWidth={1.5} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-slate-900">Telegram</p>
              <p className="text-sm text-slate-500">Notificaciones y mensajes del bot</p>
            </div>
            <span className="text-sm font-medium text-slate-600">Ver →</span>
          </Link>
        </div>
      </section>

      {/* Categorías de Productos */}
      <section className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <h2 className="text-2xl font-light tracking-tight text-slate-900">
            Categorías de Productos
          </h2>
          <Button asChild className="shrink-0">
            <Link href="#agregar-categoria">
              <Plus className="mr-2 h-4 w-4" />
              Nueva categoría
            </Link>
          </Button>
        </div>

        {hasCategories ? (
          <div className="rounded-xl border border-slate-200/50 bg-white shadow-premium shadow-[inset_0_1px_1px_rgba(255,255,255,0.6)]">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-200/50 hover:bg-transparent">
                  <TableHead>Orden</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categoryList.map((cat) => (
                  <TableRow key={cat.id}>
                    <TableCell className="font-mono text-[12px] text-slate-500">
                      {cat.sort_order}
                    </TableCell>
                    <TableCell className="font-medium text-slate-900">
                      {cat.name}
                    </TableCell>
                    <TableCell className="max-w-xs truncate text-slate-600">
                      {cat.description ?? '—'}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={cat.is_active ? 'default' : 'secondary'}
                        className={
                          cat.is_active
                            ? 'bg-emerald-500/10 text-emerald-800 border-emerald-200/50 hover:bg-emerald-500/10'
                            : 'bg-slate-500/10 text-slate-600 border-slate-200/50 hover:bg-slate-500/10'
                        }
                      >
                        {cat.is_active ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <TooltipTrigger content="Editar">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                            asChild
                          >
                            <Link href={`/admin/configuracion/categorias/${cat.id}/editar`}>
                              <Pencil className="h-4 w-4" />
                            </Link>
                          </Button>
                        </TooltipTrigger>
                        <TooltipTrigger content="Eliminar">
                          <span className="inline-flex group">
                            <BotonEliminarCategoria categoryId={cat.id} />
                          </span>
                        </TooltipTrigger>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <EmptyState
            icon={FolderTree}
            title="Aún no hay registros."
            description="Comienza creando uno nuevo."
          />
        )}

        {/* Formulario inline para crear categoría */}
        <div id="agregar-categoria" className="pt-6">
          <FormCrearCategoriaInline />
        </div>
      </section>
    </div>
  )
}
