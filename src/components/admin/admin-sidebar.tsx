'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
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
    <aside className="fixed left-0 top-0 z-10 flex h-screen w-64 flex-col border-r border-[#FFE082]/20 bg-[#FEF9F2]/95 shadow-lg backdrop-blur-sm">
      <header className="flex items-center gap-3 px-4 py-5">
        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-2xl bg-white shadow-md">
          <Image
            src="/logo.png"
            alt="HiveCore"
            fill
            className="object-cover"
            sizes="40px"
            priority
          />
        </div>
        <span className="font-display text-lg font-semibold tracking-wide text-neutral-700">
          HiveCore
        </span>
      </header>
      <hr className="border-accent-miel/30" />
      <nav className="flex-1 space-y-0.5 px-3 py-4">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href || (href !== '/admin/dashboard' && pathname.startsWith(href + '/'))
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-medium transition-all duration-300 ease-in-out ${
                isActive
                  ? 'bg-gradient-to-r from-primary/20 to-accent-miel/10 text-primary font-semibold border-l-2 border-l-primary scale-105 shadow-sm'
                  : 'border-l-2 border-l-transparent text-neutral-700 hover:bg-neutral-100/80 hover:text-neutral-800'
              }`}
            >
              <Icon className="h-5 w-5 shrink-0" {...iconProps} />
              {label}
            </Link>
          )
        })}
      </nav>
      <div className="border-t border-accent-miel/30 p-3">
        <form action={logoutAction}>
          <BotonCerrarSesion className="flex w-full items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-medium text-danger transition-all duration-200 hover:bg-danger/10 hover:shadow-md" />
        </form>
      </div>
    </aside>
  )
}
