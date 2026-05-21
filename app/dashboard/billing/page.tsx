import BillingClient from '@/components/BillingClient'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function BillingPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div>
      <BillingClient userId={user.id} />
    </div>
  )
}
