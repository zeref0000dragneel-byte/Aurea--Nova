'use client'

import { useState } from 'react'
import { UserPlus, Key, Users } from 'lucide-react'
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
import { EmptyState } from '@/components/admin/empty-state'
import { FormCrearEmpleado } from './form-crear-empleado'
import { FormDarAccesoCliente } from './form-dar-acceso-cliente'
import { BotonToggleUsuario } from './boton-toggle-usuario'
import type { ClienteOption } from './form-dar-acceso-cliente'

export type EmpleadoRow = {
  id: string
  full_name: string | null
  phone: string | null
  is_active: boolean
  created_at: string
  email: string
}

export type ClienteAccesoRow = {
  id: string
  full_name: string | null
  is_active: boolean
  created_at: string
  email: string
  business_name: string
}

export function UsuariosContent({
  empleados,
  clientesAcceso,
  clientesParaSelect,
}: {
  empleados: EmpleadoRow[]
  clientesAcceso: ClienteAccesoRow[]
  clientesParaSelect: ClienteOption[]
}) {
  const [formEmpleadoVisible, setFormEmpleadoVisible] = useState(false)
  const [formClienteVisible, setFormClienteVisible] = useState(false)

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold tracking-wide text-neutral-700">
          Gestión de Usuarios
        </h1>
        <p className="text-sm font-medium text-neutral-700/80">
          Empleados y clientes con acceso al sistema
        </p>
      </div>

      <div className="mb-6 flex flex-wrap gap-3">
        <Button
          type="button"
          variant="outline"
          className="rounded-2xl border-primary/30 text-primary hover:bg-primary/10 hover:border-accent-miel/40"
          onClick={() => {
            setFormEmpleadoVisible((v) => !v)
            setFormClienteVisible(false)
          }}
        >
          <UserPlus className="mr-2 h-4 w-4" />
          Crear Empleado
        </Button>
        <Button
          type="button"
          variant="outline"
          className="rounded-2xl border-primary/30 text-primary hover:bg-primary/10 hover:border-accent-miel/40"
          onClick={() => {
            setFormClienteVisible((v) => !v)
            setFormEmpleadoVisible(false)
          }}
        >
          <Key className="mr-2 h-4 w-4" />
          Dar Acceso a Cliente
        </Button>
      </div>

      <div className="mb-10 space-y-6">
        <FormCrearEmpleado visible={formEmpleadoVisible} />
        <FormDarAccesoCliente visible={formClienteVisible} clientes={clientesParaSelect} />
      </div>

      {/* Sección Empleados */}
      <section className="mb-10">
        <h2 className="mb-4 text-lg font-semibold text-neutral-700">Empleados</h2>
        <div className="premium-table-wrap">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Nombre completo</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha de creación</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {empleados.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="p-0">
                    <EmptyState icon={Users} variant="cell" />
                  </TableCell>
                </TableRow>
              ) : (
                empleados.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell className="font-medium text-neutral-700">
                      {e.full_name ?? '—'}
                    </TableCell>
                    <TableCell className="text-neutral-700">{e.phone ?? '—'}</TableCell>
                    <TableCell>
                      <Badge
                        variant="pill"
                        className={
                          e.is_active
                            ? 'bg-emerald-500/10 text-emerald-700 border-0 hover:bg-emerald-500/10'
                            : 'bg-neutral-200/80 text-neutral-700 border-0 hover:bg-neutral-500/10'
                        }
                      >
                        {e.is_active ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-neutral-700">
                      {e.created_at
                        ? new Date(e.created_at).toLocaleDateString('es-MX', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                          })
                        : '—'}
                    </TableCell>
                    <TableCell className="text-right">
                      <BotonToggleUsuario
                        userId={e.id}
                        isActive={e.is_active}
                        role="empleado"
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </section>

      {/* Sección Clientes con acceso */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-neutral-700">Clientes con acceso</h2>
        <div className="premium-table-wrap">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Nombre completo</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Cliente vinculado</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clientesAcceso.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="p-0">
                    <EmptyState icon={Users} variant="cell" />
                  </TableCell>
                </TableRow>
              ) : (
                clientesAcceso.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium text-neutral-700">
                      {c.full_name ?? '—'}
                    </TableCell>
                    <TableCell className="text-neutral-700">{c.email}</TableCell>
                    <TableCell className="text-neutral-700">{c.business_name}</TableCell>
                    <TableCell>
                      <Badge
                        variant="pill"
                        className={
                          c.is_active
                            ? 'bg-emerald-500/10 text-emerald-700 border-0 hover:bg-emerald-500/10'
                            : 'bg-neutral-200/80 text-neutral-700 border-0 hover:bg-neutral-500/10'
                        }
                      >
                        {c.is_active ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <BotonToggleUsuario
                        userId={c.id}
                        isActive={c.is_active}
                        role="cliente"
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </section>
    </div>
  )
}
