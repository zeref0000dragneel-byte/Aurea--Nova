'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { crearMateriaPrima } from '../actions'
import { cn } from '@/lib/utils'

const UNITS = [
  { value: 'kg', label: 'kg' },
  { value: 'g', label: 'g' },
  { value: 'l', label: 'l' },
  { value: 'ml', label: 'ml' },
  { value: 'pza', label: 'pza' },
  { value: 'caja', label: 'caja' },
  { value: 'cubeta', label: 'cubeta' },
] as const

function BotonGuardarMateriaPrimaNuevo() {
  const { pending } = useFormStatus()
  return (
    <Button
      type="submit"
      className="px-8 font-medium transition-colors duration-200"
      disabled={pending}
    >
      {pending ? 'Guardando...' : 'Guardar materia prima'}
    </Button>
  )
}

export function FormMateriaPrimaNuevo() {
  const [state, formAction] = useFormState(crearMateriaPrima, null)
  const error =
    state && typeof state === 'object' && 'error' in state
      ? (state as { error: string }).error
      : null

  return (
    <form action={formAction} className="space-y-0">
      <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-md">
        <div className="p-6 md:p-8">
          {error && (
            <div className="mb-6 rounded-lg border border-danger/20 bg-danger/10 px-4 py-3 text-sm font-medium text-danger">
              {error}
            </div>
          )}

          <p className="mb-4 text-sm font-semibold text-neutral-700">
            Información general
          </p>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="name">Nombre *</Label>
              <Input
                id="name"
                name="name"
                required
                placeholder="Nombre de la materia prima"
              />
            </div>
            <div className="space-y-2">
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
            <div className="space-y-2">
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

          <Separator className="my-8 bg-neutral-200" />

          <p className="mb-4 text-sm font-semibold text-neutral-700">
            Stock y proveedor
          </p>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="current_stock">Stock Actual</Label>
              <Input
                id="current_stock"
                name="current_stock"
                type="number"
                min={0}
                defaultValue="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="min_stock">Stock Mínimo</Label>
              <Input
                id="min_stock"
                name="min_stock"
                type="number"
                min={0}
                defaultValue="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unit_cost">Costo Unitario</Label>
              <Input
                id="unit_cost"
                name="unit_cost"
                type="number"
                step="0.01"
                min={0}
                defaultValue="0"
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="supplier">Proveedor</Label>
              <Input
                id="supplier"
                name="supplier"
                placeholder="Nombre del proveedor"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="notes">Notas</Label>
              <Textarea
                id="notes"
                name="notes"
                placeholder="Notas opcionales"
                rows={3}
                className="resize-none"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-neutral-200 bg-neutral-50/50 px-6 py-5 md:px-8">
          <BotonGuardarMateriaPrimaNuevo />
          <Button type="button" variant="outline" asChild className="transition-colors duration-200">
            <a href="/admin/inventario">Cancelar</a>
          </Button>
        </div>
      </div>
    </form>
  )
}
