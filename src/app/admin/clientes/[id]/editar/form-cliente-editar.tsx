'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { actualizarCliente } from '@/app/admin/clientes/actions'
import { cn } from '@/lib/utils'

type Customer = {
  id: string
  business_name: string
  contact_name: string | null
  email: string | null
  phone: string | null
  address: string | null
  rfc: string | null
  credit_days: number
  credit_limit: number
  notes: string | null
  is_active: boolean
}

function BotonGuardarClienteEditar() {
  const { pending } = useFormStatus()
  return (
    <Button
      type="submit"
      className="px-8 disabled:opacity-50"
      disabled={pending}
    >
      {pending ? 'Guardando...' : 'Guardar cambios'}
    </Button>
  )
}

export function FormClienteEditar({ customer }: { customer: Customer }) {
  const [state, formAction] = useFormState(actualizarCliente, null)
  const error =
    state && typeof state === 'object' && 'error' in state
      ? (state as { error: string }).error
      : null

  return (
    <form action={formAction} className="space-y-0">
      <input type="hidden" name="id" value={customer.id} />
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
              <Label htmlFor="business_name">Nombre de empresa *</Label>
              <Input
                id="business_name"
                name="business_name"
                required
                defaultValue={customer.business_name}
                placeholder="Razón social"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact_name">Nombre de contacto</Label>
              <Input
                id="contact_name"
                name="contact_name"
                defaultValue={customer.contact_name ?? ''}
                placeholder="Persona de contacto"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={customer.email ?? ''}
                placeholder="correo@ejemplo.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                name="phone"
                defaultValue={customer.phone ?? ''}
                placeholder="Teléfono"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address">Dirección</Label>
              <Input
                id="address"
                name="address"
                defaultValue={customer.address ?? ''}
                placeholder="Dirección"
              />
            </div>
          </div>

          <Separator className="my-8 bg-zinc-200/60" />

          <p className="mb-4 text-[11px] font-bold uppercase tracking-widest text-zinc-500">
            Crédito y notas
          </p>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="rfc">RFC</Label>
              <Input
                id="rfc"
                name="rfc"
                defaultValue={customer.rfc ?? ''}
                placeholder="RFC"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="credit_days">Días de crédito</Label>
              <Input
                id="credit_days"
                name="credit_days"
                type="number"
                min={0}
                defaultValue={customer.credit_days}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="credit_limit">Límite de crédito</Label>
              <Input
                id="credit_limit"
                name="credit_limit"
                type="number"
                step="0.01"
                min={0}
                defaultValue={customer.credit_limit}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="is_active">Estado</Label>
              <select
                id="is_active"
                name="is_active"
                defaultValue={customer.is_active ? 'activo' : 'inactivo'}
                className={cn(
                  'flex h-9 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm shadow-sm',
                  'ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20 focus-visible:ring-offset-2'
                )}
              >
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
              </select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="notes">Notas</Label>
              <Textarea
                id="notes"
                name="notes"
                defaultValue={customer.notes ?? ''}
                placeholder="Notas opcionales"
                rows={3}
                className="resize-none"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-zinc-200/60 bg-zinc-50/50 px-6 py-5 md:px-8">
          <BotonGuardarClienteEditar />
          <Button type="button" variant="outline" asChild>
            <a href="/admin/clientes">Cancelar</a>
          </Button>
        </div>
      </div>
    </form>
  )
}
