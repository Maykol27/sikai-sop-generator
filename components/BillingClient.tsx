'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { CheckCircle, AlertCircle, ShoppingCart } from 'lucide-react'

const supabase = createClient()

export default function BillingClient({ userId }: { userId: string }) {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handlePaymentNotified = async () => {
    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      const { error } = await supabase
        .from('payment_requests')
        .insert({
          user_id: userId,
          package_name: 'SIKAI Starter',
          credits_requested: 10,
          status: 'pending'
        })

      if (error) throw error
      setSuccess(true)
    } catch (err: any) {
      setError('Hubo un error al notificar tu pago. Inténtalo de nuevo.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="glass-card p-8 max-w-2xl mx-auto mt-8">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-glow">Paquete SIKAI Starter</h2>
      
      <div className="bg-[#1a88ff]/10 border border-[#1a88ff]/30 rounded-xl p-6 mb-8 text-center">
        <h3 className="text-3xl font-extrabold text-[#26d8c4] mb-2">$15 USD / $60.000 COP</h3>
        <p className="text-gray-700 dark:text-gray-300 font-medium mb-4">Incluye 10 Créditos SIKAI (Generación de 10 SOPs con Inteligencia Artificial)</p>
        
        <a 
          href="https://checkout.bold.co/payment/LNK_258VHAPJBM"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center gap-2 w-full py-3 px-6 rounded-lg font-bold text-white bg-[#1a88ff] hover:bg-[#26d8c4] transition-all shadow-[0_0_15px_rgba(26,136,255,0.4)] hover:shadow-[0_0_20px_rgba(38,216,196,0.5)]"
        >
          <ShoppingCart className="w-5 h-5" /> Ir a Pagar en Bold
        </a>
      </div>

      <div className="border-t border-black/10 dark:border-white/10 pt-8">
        <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4">¿Ya realizaste el pago?</h4>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          Haz clic en el botón de abajo para notificar a un administrador. Una vez verifiquemos tu pago en el sistema de Bold, se cargarán los créditos a tu cuenta.
        </p>
        
        {success ? (
          <div className="bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-3 rounded-lg flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            ¡Pago notificado! Estamos verificándolo y pronto verás tus créditos.
          </div>
        ) : (
          <button 
            type="button"
            onClick={handlePaymentNotified}
            disabled={loading}
            className="w-full py-3 px-6 rounded-lg font-bold text-gray-900 dark:text-white bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 border border-black/10 dark:border-white/20 transition-all disabled:opacity-50"
          >
            {loading ? 'Procesando...' : 'Ya realicé el pago, solicitar créditos'}
          </button>
        )}

        {error && (
          <div className="mt-4 bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}
      </div>
    </div>
  )
}
