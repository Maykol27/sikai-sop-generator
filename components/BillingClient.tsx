'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { CheckCircle, AlertCircle, ShoppingCart, Zap, Star, Rocket } from 'lucide-react'

const supabase = createClient()

const PACKAGES = [
  {
    id: 'starter',
    name: 'SIKAI Starter',
    price: '7 USD',
    credits: 5,
    description: 'Ideal para comenzar y probar la plataforma con tus primeros procesos.',
    icon: Zap,
    boldLink: 'https://checkout.bold.co/payment/LNK_SBFT537YMT',
    color: '#1a88ff',
    popular: false,
  },
  {
    id: 'pro',
    name: 'SIKAI Pro',
    price: '13 USD',
    credits: 10,
    description: 'El más popular. Perfecto para equipos que documentan procesos regularmente.',
    icon: Star,
    boldLink: 'https://checkout.bold.co/payment/LNK_3FPA318PX2',
    color: '#26d8c4',
    popular: true,
  },
  {
    id: 'scale',
    name: 'SIKAI Escala',
    price: '24 USD',
    credits: 20,
    description: 'Para empresas con alto volumen de procesos. Máximo valor por crédito.',
    icon: Rocket,
    boldLink: 'https://checkout.bold.co/payment/LNK_Q7H3WK2VH3',
    color: '#a855f7',
    popular: false,
  },
]

export default function BillingClient({ userId }: { userId: string }) {
  const [selectedPackage, setSelectedPackage] = useState(PACKAGES[1]) // Pro por defecto
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
          package_name: selectedPackage.name,
          credits_requested: selectedPackage.credits,
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
    <div className="max-w-3xl mx-auto mt-8 space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-glow mb-2">
          Adquiere Créditos SIKAI
        </h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Cada crédito te permite generar un SOP completo con Inteligencia Artificial.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {PACKAGES.map((pkg) => {
          const Icon = pkg.icon
          const isSelected = selectedPackage.id === pkg.id
          return (
            <button
              key={pkg.id}
              onClick={() => { setSelectedPackage(pkg); setSuccess(false); setError('') }}
              className={`relative flex flex-col items-center text-center p-6 rounded-2xl border-2 transition-all duration-200 cursor-pointer
                ${isSelected
                  ? 'border-[#1a88ff] bg-[#1a88ff]/10 shadow-[0_0_24px_rgba(26,136,255,0.25)]'
                  : 'border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/5 hover:border-[#1a88ff]/50 hover:bg-[#1a88ff]/5'
                }`}
            >
              {/* Badge "Más Popular" */}
              {pkg.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#1a88ff] to-[#26d8c4] text-white text-[10px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider shadow-lg">
                  Más Popular
                </span>
              )}

              {/* Icon */}
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 mt-2"
                style={{ backgroundColor: `${pkg.color}20`, border: `1px solid ${pkg.color}40` }}
              >
                <Icon className="w-6 h-6" style={{ color: pkg.color }} />
              </div>

              {/* Name */}
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1">
                {pkg.name}
              </p>

              {/* Price */}
              <p className="text-3xl font-extrabold text-gray-900 dark:text-white mb-1" style={{ color: isSelected ? pkg.color : undefined }}>
                {pkg.price}
              </p>

              {/* Credits badge */}
              <span className="inline-flex items-center gap-1 bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 text-xs font-bold px-3 py-1 rounded-full mb-3">
                {pkg.credits} Créditos SIKAI
              </span>

              {/* Description */}
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                {pkg.description}
              </p>

              {/* Selected indicator */}
              {isSelected && (
                <div className="mt-4 w-full py-1.5 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-[#1a88ff] to-[#26d8c4]">
                  ✓ Seleccionado
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* Payment CTA for selected package */}
      <div className="glass-card p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Paquete seleccionado</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              {selectedPackage.name} — {selectedPackage.price}
              <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
                ({selectedPackage.credits} créditos)
              </span>
            </p>
          </div>
          <a
            href={selectedPackage.boldLink}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-bold text-white bg-gradient-to-r from-[#1a88ff] to-[#26d8c4] hover:opacity-90 transition-all shadow-[0_0_15px_rgba(26,136,255,0.4)] hover:shadow-[0_0_20px_rgba(38,216,196,0.5)] text-sm whitespace-nowrap"
          >
            <ShoppingCart className="w-4 h-4" /> Ir a Pagar en Bold
          </a>
        </div>

        {/* Notify admin */}
        <div className="border-t border-black/10 dark:border-white/10 pt-6">
          <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-1">¿Ya realizaste el pago?</h4>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
            Haz clic abajo para notificar al administrador. Una vez verifiquemos tu pago en Bold, se cargarán los créditos a tu cuenta.
          </p>

          {success ? (
            <div className="bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-3 rounded-lg flex items-center gap-2 text-sm">
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
              ¡Pago notificado! Estamos verificándolo y pronto verás tus créditos.
            </div>
          ) : (
            <button
              type="button"
              onClick={handlePaymentNotified}
              disabled={loading}
              className="w-full py-3 px-6 rounded-lg font-bold text-gray-900 dark:text-white bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 border border-black/10 dark:border-white/20 transition-all disabled:opacity-50 text-sm"
            >
              {loading ? 'Procesando...' : 'Ya realicé el pago, solicitar créditos'}
            </button>
          )}

          {error && (
            <div className="mt-4 bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg flex items-center gap-2 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
