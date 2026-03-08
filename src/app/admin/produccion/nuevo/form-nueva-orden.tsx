'use client'

import { useFormState, useFormStatus } from 'react-dom'
import Link from 'next/link'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { crearOrdenProduccion } from '../actions'
import { cn } from '@/lib/utils'

type Producto = { id: string; name: string }
type Empleado = { id: string; full_name: string }

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button
      type="submit"
      disabled={pending}
      className="transition-colors duration-200 disabled:opacity-60"
    >
      {pending ? 'Guardando…' : 'Crear orden'}
    </Button>
  )
}

export function FormNuevaOrden({
  productos,
  empleados,
}: {
  productos: Producto[]
  empleados: Empleado[]
}) {
  const [state, formAction] = useFormState(crearOrdenProduccion, null)
  const error =
    state && typeof state === 'object' && 'error' in state
      ? (state as { error: string }).error
      : null

  return (
    <form action={formAction} className="space-y-6">
      {error && (
        <div className="rounded-lg border border-danger/20 bg-danger/10 px-4 py-3 text-sm font-medium text-danger">
          {error}
        </div>
      )}
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2 mb-4">
          <Label htmlFor="product_id">Producto *</Label>
          <select
            id="product_id"
            name="product_id"
            required
            className={cn(
              'flex h-10 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm transition-colors duration-200',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-opacity-50 focus-visible:border-primary'
            )}
          >
            <option value="">Selecciona un producto</option>
            {productos.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2 mb-4">
          <Label htmlFor="planned_quantity">Cantidad Planificada *</Label>
          <Input
            id="planned_quantity"
            name="planned_quantity"
            type="number"
            min="0"
            step="1"
            required
            placeholder="0"
          />
        </div>
        <div className="space-y-2 mb-4">
          <Label htmlFor="assigned_to">Asignar a</Label>
          <select
            id="assigned_to"
            name="assigned_to"
            className={cn(
              'flex h-10 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm transition-colors duration-200',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-opacity-50 focus-visible:border-primary'
            )}
          >
            <option value="">Ninguno</option>
            {empleados.map((e) => (
              <option key={e.id} value={e.id}>
                {e.full_name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2 sm:col-span-2 mb-4">
          <Label htmlFor="notes">Notas</Label>
          <Textarea
            id="notes"
            name="notes"
            placeholder="Notas opcionales"
            rows={3}
            className="resize-none border-neutral-200 rounded-lg"
          />
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3 pt-2">
        <SubmitButton />
        <Button type="button" variant="outline" asChild className="transition-colors duration-200">
          <Link href="/admin/produccion">Cancelar</Link>
        </Button>
      </div>
    </form>
  )
}
