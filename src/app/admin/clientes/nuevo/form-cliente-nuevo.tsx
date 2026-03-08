'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { crearCliente } from '../actions'
import { cn } from '@/lib/utils'

function BotonGuardarCliente() {
  const { pending } = useFormStatus()
  return (
    <Button
      type="submit"
      className="px-8 font-medium transition-colors duration-200"
      disabled={pending}
    >
      {pending ? 'Guardando...' : 'Guardar cliente'}
    </Button>
  )
}

export function FormClienteNuevo() {
  const [state, formAction] = useFormState(crearCliente, null)
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
              <Label htmlFor="business_name">Nombre de empresa *</Label>
              <Input
                id="business_name"
                name="business_name"
                required
                placeholder="Razón social"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact_name">Nombre de contacto</Label>
              <Input
                id="contact_name"
                name="contact_name"
                placeholder="Persona de contacto"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="correo@ejemplo.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                name="phone"
                placeholder="Teléfono"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address">Dirección</Label>
              <Input
                id="address"
                name="address"
                placeholder="Dirección"
              />
            </div>
          </div>

          <Separator className="my-8 bg-neutral-200" />

          <p className="mb-4 text-sm font-semibold text-neutral-700">
            Crédito y notas
          </p>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="rfc">RFC</Label>
              <Input
                id="rfc"
                name="rfc"
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
                defaultValue="0"
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
                defaultValue="0"
                placeholder="0.00"
              />
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
          <BotonGuardarCliente />
          <Button type="button" variant="outline" asChild className="transition-colors duration-200">
            <a href="/admin/clientes">Cancelar</a>
          </Button>
        </div>
      </div>
    </form>
  )
}
