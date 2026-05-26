import { createClient } from '@/utils/supabase/server'
import { notFound, redirect } from 'next/navigation'
import SopResultPanel from '@/components/SopResultPanel'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function SopViewPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { id } = await params

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: sop } = await supabase
    .from('sops')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!sop) {
    notFound()
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6 screen-only">
        <Link href="/dashboard" className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white flex items-center gap-2 transition-colors w-max">
          <ArrowLeft className="w-4 h-4" /> Volver al Dashboard
        </Link>
      </div>
      
      <SopResultPanel sop={sop} />
    </div>
  )
}
