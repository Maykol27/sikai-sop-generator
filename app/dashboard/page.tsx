import SopGeneratorForm from '@/components/SopGeneratorForm'
import { FileText, Plus } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Fetch past SOPs
  const { data: sops } = await supabase
    .from('sops')
    .select('id, title, created_at')
    .eq('user_id', user?.id)
    .order('created_at', { ascending: false })

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 text-glow">Crear nuevo SIKAI SOP</h2>
          <p className="text-gray-600 dark:text-gray-400">Describe tu proceso manualmente o utiliza el dictado por voz.</p>
        </div>
        
        <SopGeneratorForm />
      </div>
      
      <div className="lg:col-span-1">
        <div className="glass-card p-6 h-full">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#1a88ff]" /> Historial
            </h3>
          </div>
          
          <div className="space-y-4">
            {sops && sops.length > 0 ? (
              sops.map((sop) => (
                <Link 
                  href={`/dashboard/sop/${sop.id}`} 
                  key={sop.id}
                  className="block p-4 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 hover:border-[#1a88ff]/50 transition-colors"
                >
                  <h4 className="text-gray-900 dark:text-white font-medium mb-1 truncate">{sop.title}</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(sop.created_at).toLocaleDateString('es-ES', { 
                      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                    })}
                  </p>
                </Link>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <p>Aún no has generado ningún SOP.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
