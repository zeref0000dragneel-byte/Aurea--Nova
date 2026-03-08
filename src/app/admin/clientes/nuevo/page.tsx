import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { FormClienteNuevo } from './form-cliente-nuevo'

export default function NuevoClientePage() {
  return (
    <div className="p-8">
      <div className="mb-6">
        <Link
          href="/admin/clientes"
          className="inline-flex items-center gap-2 text-sm font-medium text-neutral-700 transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Link>
      </div>
      <h1 className="mb-8 text-2xl font-bold tracking-tight text-neutral-800">
        Nuevo cliente
      </h1>
      <Card className="max-w-2xl border-neutral-200">
        <CardHeader>
          <h2 className="text-lg font-semibold text-neutral-800">Datos del cliente</h2>
        </CardHeader>
        <CardContent>
          <FormClienteNuevo />
        </CardContent>
      </Card>
    </div>
  )
}
