import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { TabsOrdenes } from './tabs-ordenes'
import type { OrderRow } from './tabs-ordenes'

export default async function EmpleadoProduccionPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: orders } = await supabase
    .from('production_orders')
    .select(
      `
      id,
      planned_quantity,
      actual_quantity,
      status,
      created_at,
      completed_at,
      products ( name )
    `
    )
    .eq('assigned_to', user.id)
    .order('created_at', { ascending: false })

  const ordenes = (orders ?? []) as unknown as OrderRow[]

  return <TabsOrdenes ordenes={ordenes} />
}
