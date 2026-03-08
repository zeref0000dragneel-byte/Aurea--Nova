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
    <div className="p-6">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold tracking-wide text-neutral-700">
          Configuración
        </h1>
        <p className="mt-2 text-sm font-medium text-neutral-700/80">
          Administración del sistema
        </p>
      </div>

      {/* Enlaces de configuración como Cards de Ajustes */}
      <section className="mb-8">
        <h2 className="font-display mb-6 text-2xl font-bold tracking-wide text-neutral-700">
          Ajustes
        </h2>
        <div className="space-y-3">
          <Link
            href="/admin/configuracion/telegram"
            className="flex items-center gap-4 rounded-2xl border border-accent-miel/30 bg-gradient-to-br from-neutral-50 to-white px-6 py-5 shadow-xl transition-all duration-300 hover:shadow-2xl hover:bg-neutral-50/80"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <MessageCircle className="h-6 w-6" strokeWidth={1.5} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-neutral-700">Telegram</p>
              <p className="text-sm text-neutral-700/80">Notificaciones y mensajes del bot</p>
            </div>
            <span className="text-sm font-medium text-neutral-600">Ver →</span>
          </Link>
        </div>
      </section>

      {/* Categorías de Productos */}
      <section className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <h2 className="font-display text-2xl font-bold tracking-wide text-neutral-700">
            Categorías de Productos
          </h2>
          <Button asChild className="shrink-0 transition-colors duration-200">
            <Link href="#agregar-categoria">
              <Plus className="mr-2 h-4 w-4" />
              Nueva categoría
            </Link>
          </Button>
        </div>

        {hasCategories ? (
          <div className="premium-table-wrap">
            <Table>
              <TableHeader>
                <TableRow className="border-neutral-200 hover:bg-transparent">
                  <TableHead className="text-neutral-700">Orden</TableHead>
                  <TableHead className="text-neutral-700">Nombre</TableHead>
                  <TableHead className="text-neutral-700">Descripción</TableHead>
                  <TableHead className="text-neutral-700">Estado</TableHead>
                  <TableHead className="text-right text-neutral-700">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categoryList.map((cat) => (
                  <TableRow key={cat.id}>
                    <TableCell className="font-mono text-xs text-neutral-700/80">
                      {cat.sort_order}
                    </TableCell>
                    <TableCell className="font-medium text-neutral-700">
                      {cat.name}
                    </TableCell>
                    <TableCell className="max-w-xs truncate text-neutral-700">
                      {cat.description ?? '—'}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={cat.is_active ? 'default' : 'secondary'}
                        className={
                          cat.is_active
                            ? 'bg-success/10 text-success border-0'
                            : 'bg-neutral-200/80 text-neutral-700 border-0'
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
                            className="h-8 w-8 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 transition-colors duration-200"
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
