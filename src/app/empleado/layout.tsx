import Link from 'next/link'
import { Hexagon, ShoppingCart, Factory } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { logoutAction } from '@/app/(auth)/login/actions'
import { BotonCerrarSesion } from '@/components/boton-cerrar-sesion'

const navItems = [
  { href: '/empleado/pedidos', icon: ShoppingCart, label: 'Pedidos' },
  { href: '/empleado/produccion', icon: Factory, label: 'Producción' },
] as const

export default async function EmpleadoLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  let nombreEmpleado = 'Empleado'
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single()
    if (profile?.full_name) {
      nombreEmpleado = profile.full_name
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 z-10 flex h-screen w-64 flex-col border-r border-gray-200 bg-white">
        <header className="flex items-center gap-3 px-4 py-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500">
            <Hexagon className="h-5 w-5 text-white fill-white" />
          </div>
          <span className="text-lg font-bold text-gray-900">Colmena OS</span>
        </header>
        <div className="px-4 pb-2">
          <p className="text-xs font-medium text-gray-500 truncate" title={nombreEmpleado}>
            {nombreEmpleado}
          </p>
        </div>
        <hr className="border-gray-200" />
        <nav className="flex-1 space-y-0.5 px-3 py-4">
          {navItems.map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-amber-50 hover:text-amber-700"
            >
              <Icon className="h-5 w-5 shrink-0" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-gray-200 p-3">
          <form action={logoutAction}>
            <BotonCerrarSesion className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50" />
          </form>
        </div>
      </aside>
      {/* Main content */}
      <main className="min-h-screen flex-1 overflow-auto pl-64">
        {children}
      </main>
    </div>
  )
}
