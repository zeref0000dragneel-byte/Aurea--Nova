'use client'

import { useEffect, useRef, useState } from 'react'
import { useFormState, useFormStatus } from 'react-dom'
import { Key } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { darAccesoCliente, type DarAccesoClienteState } from './actions'

function BotonDarAcceso() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" className="bg-primary font-medium text-primary-foreground hover:bg-primary/90" disabled={pending}>
      <Key className="mr-2 h-4 w-4" />
      {pending ? 'Guardando...' : 'Dar Acceso'}
    </Button>
  )
}

export type ClienteOption = { id: string; business_name: string; email: string }

export function FormDarAccesoCliente({
  visible,
  clientes,
}: {
  visible: boolean
  clientes: ClienteOption[]
}) {
  const [state, formAction] = useFormState(darAccesoCliente, null as DarAccesoClienteState | null)
  const formRef = useRef<HTMLFormElement>(null)
  const [customerId, setCustomerId] = useState('')
  const [email, setEmail] = useState('')

  const selectedCliente = clientes.find((c) => c.id === customerId)

  useEffect(() => {
    if (selectedCliente?.email) {
      setEmail(selectedCliente.email)
    } else {
      setEmail('')
    }
  }, [selectedCliente])

  useEffect(() => {
    if (state?.success && formRef.current) {
      formRef.current.reset()
      setCustomerId('')
      setEmail('')
    }
  }, [state])

  if (!visible) return null

  return (
    <form
      ref={formRef}
      action={formAction}
      className="space-y-4 rounded-lg border border-neutral-200 bg-neutral-50/50 p-6"
    >
      <input type="hidden" name="customer_id" value={customerId} />
      {state?.success && (
        <p className="text-sm font-medium text-emerald-700" role="alert">
          {state.mensaje}
        </p>
      )}
      {state?.error && (
        <p className="text-sm font-medium text-red-600" role="alert">
          {state.error}
        </p>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Cliente</Label>
          <Select value={customerId} onValueChange={setCustomerId} required>
            <SelectTrigger className="border-neutral-200 bg-white">
              <SelectValue placeholder="Selecciona un cliente..." />
            </SelectTrigger>
            <SelectContent>
              {clientes.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.business_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="acceso-full_name">Nombre de contacto *</Label>
          <Input
            id="acceso-full_name"
            name="full_name"
            required
            placeholder="Nombre de contacto"
            className="border-neutral-200 bg-white"
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="acceso-email">Correo electrónico *</Label>
          <Input
            id="acceso-email"
            name="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Debe coincidir con el email registrado del cliente"
            className="border-neutral-200 bg-white"
          />
          <p className="text-xs text-gray-500">
            Debe coincidir con el email registrado del cliente
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="acceso-password">Contraseña * (mínimo 8 caracteres)</Label>
          <Input
            id="acceso-password"
            name="password"
            type="password"
            required
            minLength={8}
            placeholder="••••••••"
            className="border-neutral-200 bg-white"
          />
        </div>
      </div>
      <BotonDarAcceso />
    </form>
  )
}
