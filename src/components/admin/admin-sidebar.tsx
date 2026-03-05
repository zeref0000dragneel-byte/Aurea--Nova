'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Hexagon,
  LayoutDashboard,
  TrendingUp,
  Package,
  Warehouse,
  Factory,
  Users,
  ShoppingCart,
  Settings,
  ShoppingBag,
} from 'lucide-react'
import { logoutAction } from '@/app/(auth)/login/actions'
import { BotonCerrarSesion } from '@/components/boton-cerrar-sesion'

const navItems = [
  { href: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/finanzas', icon: TrendingUp, label: 'Finanzas' },
  { href: '/admin/productos', icon: Package, label: 'Productos' },
  { href: '/admin/inventario', icon: Warehouse, label: 'Inventario' },
  { href: '/admin/compras', icon: ShoppingBag, label: 'Compras' },
  { href: '/admin/produccion', icon: Factory, label: 'Producción' },
  { href: '/admin/clientes', icon: Users, label: 'Clientes' },
  { href: '/admin/usuarios', icon: Users, label: 'Usuarios' },
  { href: '/admin/pedidos', icon: ShoppingCart, label: 'Pedidos' },
  { href: '/admin/configuracion', icon: Settings, label: 'Configuración' },
] as const

const iconProps = { strokeWidth: 1.5 }

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 z-10 flex h-screen w-64 flex-col border-r border-slate-200/50 bg-white/80 backdrop-blur-md">
      <header className="flex items-center gap-3 px-4 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#B45309] drop-shadow-md">
          <Hexagon className="h-5 w-5 text-white fill-white" strokeWidth={1.5} />
        </div>
        <span className="text-lg font-bold tracking-widest text-slate-900 drop-shadow-sm">
          Áurea
        </span>
      </header>
      <hr className="border-slate-200/50" />
      <nav className="flex-1 space-y-0.5 px-3 py-4">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href || (href !== '/admin/dashboard' && pathname.startsWith(href + '/'))
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'border-l-2 border-l-[#B45309] bg-slate-50/80 text-[#B45309]'
                  : 'border-l-2 border-l-transparent text-slate-600 hover:bg-slate-50/60 hover:text-slate-900'
              }`}
            >
              <Icon className="h-5 w-5 shrink-0" {...iconProps} />
              {label}
            </Link>
          )
        })}
      </nav>
      <div className="border-t border-slate-200/50 p-3">
        <form action={logoutAction}>
          <BotonCerrarSesion className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50" />
        </form>
      </div>
    </aside>
  )
}
