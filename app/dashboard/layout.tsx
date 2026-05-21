import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { LogOut, Coins } from 'lucide-react'
import DashboardShell from '@/components/DashboardShell'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch credits
  const { data: profile } = await supabase
    .from('profiles')
    .select('credits, full_name')
    .eq('id', user.id)
    .single()

  const credits = profile?.credits || 0
  const fullName = profile?.full_name || user.email?.split('@')[0] || 'Usuario'

  return (
    <DashboardShell credits={credits} fullName={fullName} userId={user.id}>
      {children}
    </DashboardShell>
  )
}
