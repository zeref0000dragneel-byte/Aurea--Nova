'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { actualizarMateriaPrima } from '@/app/admin/inventario/actions'
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

function BotonGuardarMateriaPrima() {
  const { pending } = useFormStatus()
  return (
    <Button
      type="submit"
      className="px-8 bg-primary font-medium text-primary-foreground hover:bg-primary/90"
      disabled={pending}
    >
      {pending ? 'Guardando...' : 'Guardar cambios'}
    </Button>
  )
}

type RawMaterial = {
  id: string
  name: string
  unit: string
  current_stock: number
  min_stock: number
  unit_cost: number
  supplier: string | null
  notes: string | null
  is_active: boolean
}

export function FormMateriaPrimaEditar({ material }: { material: RawMaterial }) {
  const [state, formAction] = useFormState(actualizarMateriaPrima, null)
  const error =
    state && typeof state === 'object' && 'error' in state
      ? (state as { error: string }).error
      : null

  return (
    <form action={formAction} className="space-y-0">
      <input type="hidden" name="id" value={material.id} />
      <div className="overflow-hidden rounded-2xl border border-zinc-200/60 bg-white shadow-sm">
        <div className="p-6 md:p-8">
          {error && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </div>
          )}

          <p className="mb-4 text-[11px] font-bold uppercase tracking-widest text-zinc-500">
            Información general
          </p>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="name">Nombre *</Label>
              <Input
                id="name"
                name="name"
                required
                defaultValue={material.name}
                placeholder="Nombre de la materia prima"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unit">Unidad</Label>
              <select
                id="unit"
                name="unit"
                defaultValue={material.unit || 'pza'}
                className={cn(
                  'flex h-9 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm shadow-sm',
                  'ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20 focus-visible:ring-offset-2'
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
                defaultValue={material.is_active ? 'activo' : 'inactivo'}
                className={cn(
                  'flex h-9 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm shadow-sm',
                  'ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20 focus-visible:ring-offset-2'
                )}
              >
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
              </select>
            </div>
          </div>

          <Separator className="my-8 bg-zinc-200/60" />

          <p className="mb-4 text-[11px] font-bold uppercase tracking-widest text-zinc-500">
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
                defaultValue={material.current_stock}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="min_stock">Stock Mínimo</Label>
              <Input
                id="min_stock"
                name="min_stock"
                type="number"
                min={0}
                defaultValue={material.min_stock}
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
                defaultValue={material.unit_cost}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="supplier">Proveedor</Label>
              <Input
                id="supplier"
                name="supplier"
                defaultValue={material.supplier ?? ''}
                placeholder="Nombre del proveedor"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="notes">Notas</Label>
              <Textarea
                id="notes"
                name="notes"
                defaultValue={material.notes ?? ''}
                placeholder="Notas opcionales"
                rows={3}
                className="resize-none"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-zinc-200/60 bg-zinc-50/50 px-6 py-5 md:px-8">
          <BotonGuardarMateriaPrima />
          <Button type="button" variant="outline" asChild>
            <a href="/admin/inventario">Cancelar</a>
          </Button>
        </div>
      </div>
    </form>
  )
}
