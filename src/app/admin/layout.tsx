import { AdminSidebar } from '@/components/admin/admin-sidebar'
import { AdminPageTransition } from '@/components/admin/admin-page-transition'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-transparent">
      <AdminSidebar />
      <main className="min-h-screen flex-1 overflow-auto pl-64">
        <AdminPageTransition>{children}</AdminPageTransition>
      </main>
    </div>
  )
}
