'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { crearProducto } from '../actions'
import { cn } from '@/lib/utils'

type Category = { id: string; name: string }

const UNITS = [
  { value: 'kg', label: 'kg' },
  { value: 'g', label: 'g' },
  { value: 'l', label: 'l' },
  { value: 'ml', label: 'ml' },
  { value: 'pza', label: 'pza' },
  { value: 'caja', label: 'caja' },
  { value: 'cubeta', label: 'cubeta' },
] as const

function BotonGuardarProducto() {
  const { pending } = useFormStatus()
  return (
    <Button
      type="submit"
      className="px-8 font-medium transition-colors duration-200"
      disabled={pending}
    >
      {pending ? 'Guardando...' : 'Guardar producto'}
    </Button>
  )
}

export function FormProductoNuevo({
  categories,
  action,
}: {
  categories: Category[]
  action: typeof crearProducto
}) {
  const [state, formAction] = useFormState(action, null)
  const error = state && typeof state === 'object' && 'error' in state ? (state as { error: string }).error : null

  return (
    <form action={formAction} className="space-y-0">
      <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-md">
        {error && (
          <div className="mb-6 rounded-lg border border-danger/20 bg-danger/10 px-4 py-3 text-sm font-medium text-danger">
            {error}
          </div>
        )}

        {/* Sección: Información general */}
        <h3 className="mb-4 mt-4 text-sm font-semibold text-neutral-700">
          Información general
        </h3>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-2 mb-4">
            <Label htmlFor="sku">SKU</Label>
            <Input
              id="sku"
              name="sku"
              placeholder="Se genera automáticamente si se deja vacío"
            />
          </div>
          <div className="space-y-2 md:col-span-2 mb-4">
            <Label htmlFor="nombre">Nombre *</Label>
            <Input
              id="nombre"
              name="nombre"
              required
              placeholder="Nombre del producto"
            />
          </div>
          <div className="space-y-2 md:col-span-2 mb-4">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Descripción opcional"
              rows={3}
              className="resize-none"
            />
          </div>
          <div className="space-y-2 mb-4">
            <Label htmlFor="category_id">Categoría *</Label>
            <select
              id="category_id"
              name="category_id"
              required
              className={cn(
                'flex h-10 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors duration-200',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-opacity-50 focus-visible:border-primary'
              )}
            >
              <option value="">Selecciona una categoría</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2 mb-4">
            <Label htmlFor="unit">Unidad</Label>
            <select
              id="unit"
              name="unit"
              defaultValue="pza"
              className={cn(
                'flex h-10 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors duration-200',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-opacity-50 focus-visible:border-primary'
              )}
            >
              {UNITS.map((u) => (
                <option key={u.value} value={u.value}>
                  {u.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <Separator className="my-6 bg-neutral-200" />

        {/* Sección: Precios e inventario */}
        <h3 className="mb-4 mt-4 text-sm font-semibold text-neutral-700">
          Precios e inventario
        </h3>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="precio_base">Precio base *</Label>
            <Input
              id="precio_base"
              name="precio_base"
              type="number"
              step="0.01"
              min="0"
              required
              placeholder="0.00"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="precio_costo">Precio de costo *</Label>
            <Input
              id="precio_costo"
              name="precio_costo"
              type="number"
              step="0.01"
              min="0"
              required
              placeholder="0.00"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="min_stock">Stock mínimo</Label>
            <Input
              id="min_stock"
              name="min_stock"
              type="number"
              min="0"
              defaultValue="0"
            />
          </div>
          <div className="space-y-2 mb-4">
            <Label htmlFor="is_active">Estado</Label>
            <select
              id="is_active"
              name="is_active"
              defaultValue="activo"
              className={cn(
                'flex h-10 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors duration-200',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-opacity-50 focus-visible:border-primary'
              )}
            >
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
            </select>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex justify-end gap-3 border-t border-neutral-200 pt-6">
          <BotonGuardarProducto />
          <Button type="button" variant="outline" asChild className="transition-colors duration-200">
            <a href="/admin/productos">Cancelar</a>
          </Button>
        </div>
      </div>
    </form>
  )
}
