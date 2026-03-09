import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'
import { Plus, Users, Pencil, Tag } from 'lucide-react'
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
import { BotonEliminarCliente } from '@/components/admin/boton-eliminar-cliente'
import { EmptyState } from '@/components/admin/empty-state'
import { TooltipTrigger } from '@/components/ui/tooltip'

export default async function AdminClientesPage() {
  const supabase = createAdminClient()

  const { data: customers } = await supabase
    .from('customers')
    .select('*')
    .eq('is_active', true)
    .order('business_name')

  const customerList = customers ?? []
  const hasCustomers = customerList.length > 0

  return (
    <div className="p-6">
      <div className="mb-8 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-wide text-neutral-700">
            Clientes
          </h1>
          <p className="text-sm font-medium text-neutral-700/80 mt-1">
            Gestión de clientes mayoristas
          </p>
        </div>
        <Button asChild className="mt-2 shrink-0 sm:mt-0 transition-colors duration-200">
          <Link href="/admin/clientes/nuevo">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo cliente
          </Link>
        </Button>
      </div>

      {hasCustomers ? (
        <div className="premium-table-wrap">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-neutral-700">Empresa</TableHead>
                <TableHead className="text-neutral-700">Contacto</TableHead>
                <TableHead className="text-neutral-700">Email</TableHead>
                <TableHead className="text-neutral-700">Teléfono</TableHead>
                <TableHead className="text-neutral-700">Días de Crédito</TableHead>
                <TableHead className="text-neutral-700">Límite de Crédito</TableHead>
                <TableHead className="text-neutral-700">Estado</TableHead>
                <TableHead className="text-right text-neutral-700">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customerList.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium text-neutral-700">
                    {c.business_name}
                  </TableCell>
                  <TableCell className="text-neutral-700">
                    {c.contact_name ?? '—'}
                  </TableCell>
                  <TableCell className="text-neutral-700">
                    {c.email ?? '—'}
                  </TableCell>
                  <TableCell className="text-neutral-700">
                    {c.phone ?? '—'}
                  </TableCell>
                  <TableCell className="text-neutral-700">
                    {c.credit_days}
                  </TableCell>
                  <TableCell className="text-neutral-700">
                    ${Number(c.credit_limit).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="pill"
                      className={
                        c.is_active
                          ? 'bg-success/10 text-success border-0'
                          : 'bg-neutral-200/80 text-neutral-700 border-0'
                      }
                    >
                      {c.is_active ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-0.5">
                      <TooltipTrigger content="Precios">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 transition-colors duration-200"
                          asChild
                        >
                          <Link href={`/admin/clientes/${c.id}/precios`}>
                            <Tag className="h-4 w-4" />
                          </Link>
                        </Button>
                      </TooltipTrigger>
                      <TooltipTrigger content="Editar">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 transition-colors duration-200"
                          asChild
                        >
                          <Link href={`/admin/clientes/${c.id}/editar`}>
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                      </TooltipTrigger>
                      <TooltipTrigger content="Eliminar">
                        <span className="inline-flex group">
                          <BotonEliminarCliente customerId={c.id} />
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
          icon={Users}
          title="Aún no hay registros."
          description="Comienza creando uno nuevo."
        />
      )}
    </div>
  )
}
