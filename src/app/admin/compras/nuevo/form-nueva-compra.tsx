'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { registrarCompra } from '../actions'
import { cn } from '@/lib/utils'

type MateriaPrimaOption = {
  id: string
  name: string
  unit: string
  unit_cost: number
  supplier: string
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button
      type="submit"
      disabled={pending}
      className="px-8 font-medium transition-colors duration-200 disabled:opacity-60"
    >
      {pending ? 'Registrando…' : 'Registrar Compra'}
    </Button>
  )
}

export default function FormNuevaCompra({
  materiasPrimas,
}: {
  materiasPrimas: MateriaPrimaOption[]
}) {
  const [state, formAction] = useFormState(registrarCompra, null)
  const error =
    state && typeof state === 'object' && 'error' in state
      ? (state as { error: string }).error
      : null

  const [selectedId, setSelectedId] = useState<string>('')
  const [supplier, setSupplier] = useState('')
  const [unitCost, setUnitCost] = useState('')
  const [quantity, setQuantity] = useState('')
  const [pagoInicial, setPagoInicial] = useState<'completo' | 'pendiente' | 'parcial'>('pendiente')

  const selected = useMemo(
    () => materiasPrimas.find((m) => m.id === selectedId),
    [materiasPrimas, selectedId]
  )

  const q = parseFloat(quantity) || 0
  const uc = parseFloat(unitCost) || 0
  const total = q * uc

  const handleMateriaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value
    setSelectedId(id)
    const m = materiasPrimas.find((x) => x.id === id)
    if (m) {
      setSupplier(m.supplier)
      setUnitCost(String(m.unit_cost))
    } else {
      setSupplier('')
      setUnitCost('')
    }
  }

  const today = new Date().toISOString().slice(0, 10)

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
            Datos de la compra
          </p>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2 mb-4">
              <Label htmlFor="raw_material_select">Materia prima *</Label>
              <select
                id="raw_material_select"
                name="raw_material_id"
                required
                value={selectedId}
                onChange={(e) => {
                  handleMateriaChange(e)
                  const id = e.target.value
                  const m = materiasPrimas.find((x) => x.id === id)
                  if (m) {
                    setSupplier(m.supplier)
                    setUnitCost(String(m.unit_cost))
                  }
                }}
                className={cn(
                  'flex h-10 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors duration-200',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-opacity-50 focus-visible:border-primary'
                )}
              >
                <option value="">Selecciona una materia prima</option>
                {materiasPrimas.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.unit})
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="supplier">Proveedor *</Label>
              <Input
                id="supplier"
                name="supplier"
                type="text"
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
                placeholder="Nombre del proveedor"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="purchase_date">Fecha de compra *</Label>
              <Input
                id="purchase_date"
                name="purchase_date"
                type="date"
                defaultValue={today}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantity">
                Cantidad * {selected && `(${selected.unit})`}
              </Label>
              <Input
                id="quantity"
                name="quantity"
                type="number"
                min="0"
                step="any"
                required
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder={selected ? `Ej. 10 ${selected.unit}` : '0'}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unit_cost">Costo unitario *</Label>
              <Input
                id="unit_cost"
                name="unit_cost"
                type="number"
                min="0"
                step="0.01"
                value={unitCost}
                onChange={(e) => setUnitCost(e.target.value)}
                required
              />
            </div>
            <div className="flex items-end">
              <TotalDisplay total={total} />
            </div>
          </div>

          <Separator className="my-8 bg-neutral-200" />

          <p className="mb-4 text-sm font-semibold text-neutral-700">
            Documentación y pago
          </p>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="invoice_number">No. de factura / remisión</Label>
              <Input
                id="invoice_number"
                name="invoice_number"
                type="text"
                placeholder="Opcional"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="notes">Notas</Label>
              <Textarea
                id="notes"
                name="notes"
                placeholder="Opcional"
                rows={3}
                className="resize-none"
              />
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <Label>¿Se pagó al recibir?</Label>
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="pago_inicial"
                  value="completo"
                  checked={pagoInicial === 'completo'}
                  onChange={() => setPagoInicial('completo')}
                  className="border-zinc-300 text-primary focus:ring-primary"
                />
                <span className="text-sm font-medium text-neutral-700">Sí, pagado completo</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="pago_inicial"
                  value="pendiente"
                  checked={pagoInicial === 'pendiente'}
                  onChange={() => setPagoInicial('pendiente')}
                  className="border-neutral-300 text-primary focus:ring-primary"
                />
                <span className="text-sm font-medium text-neutral-700">No, queda pendiente</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="pago_inicial"
                  value="parcial"
                  checked={pagoInicial === 'parcial'}
                  onChange={() => setPagoInicial('parcial')}
                  className="border-neutral-300 text-primary focus:ring-primary"
                />
                <span className="text-sm font-medium text-neutral-700">Anticipo (parcial)</span>
              </label>
            </div>
            {pagoInicial === 'parcial' && (
              <div className="max-w-xs">
                <Label htmlFor="anticipo">Anticipo (opcional)</Label>
                <Input
                  id="anticipo"
                  name="anticipo"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  className="mt-1"
                />
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-neutral-200 bg-neutral-50/50 px-6 py-5 md:px-8">
          <SubmitButton />
          <Button type="button" variant="outline" asChild className="transition-colors duration-200">
            <Link href="/admin/compras">Cancelar</Link>
          </Button>
        </div>
      </div>
    </form>
  )
}

function TotalDisplay({ total }: { total: number }) {
  return (
    <div className="w-full rounded-lg border border-neutral-200 bg-neutral-50/50 px-4 py-3">
      <p className="text-lg font-semibold text-neutral-700">
        Total: ${total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
      </p>
    </div>
  )
}
