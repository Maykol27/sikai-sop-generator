'use client'

import { useState, useEffect } from 'react'
import { Sparkles, Bot, Zap, X, ChevronRight, ChevronLeft, Award, Mic, FileText, CheckCircle2 } from 'lucide-react'

export function WelcomeTutorialModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [step, setStep] = useState(0)
  const [isClosing, setIsClosing] = useState(false)

  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem('sikai_sop_tutorial_seen')
    if (!hasSeenTutorial) {
      // 1.5s delay after load for premium experience
      const timer = setTimeout(() => {
        setIsOpen(true)
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleClose = () => {
    setIsClosing(true)
    setTimeout(() => {
      setIsOpen(false)
      localStorage.setItem('sikai_sop_tutorial_seen', 'true')
    }, 300)
  }

  const nextStep = () => {
    if (step < 2) {
      setStep(prev => prev + 1)
    } else {
      handleClose()
    }
  }

  const prevStep = () => {
    if (step > 0) {
      setStep(prev => prev - 1)
    }
  }

  if (!isOpen && !isClosing) return null

  return (
    <div className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 transition-all duration-300 ${isClosing ? 'opacity-0 backdrop-blur-none bg-black/0' : 'opacity-100 backdrop-blur-md bg-black/60'}`}>
      <div 
        className={`relative w-full max-w-lg bg-[#0d111c]/90 dark:bg-[#0d111c]/95 border border-white/10 rounded-3xl shadow-2xl overflow-hidden transition-all duration-300 transform ${isClosing ? 'scale-95 opacity-0 translate-y-4' : 'scale-100 opacity-100 translate-y-0'}`}
        style={{
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.1), 0 0 40px rgba(26, 136, 255, 0.15)'
        }}
      >
        {/* Neon Glow backdrops */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-[#1a88ff]/10 blur-[50px] pointer-events-none rounded-full" />
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#26d8c4]/15 blur-[40px] pointer-events-none rounded-full" />

        {/* Top brand accent bar */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#1a88ff] to-[#26d8c4]" />

        <div className="p-6 sm:p-8 flex flex-col relative z-10">
          {/* Close Button */}
          <button 
            onClick={handleClose}
            className="absolute right-4 top-4 p-2 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all active:scale-95"
            title="Saltar tutorial"
          >
            <X size={18} />
          </button>

          {/* Tutorial Slide Content */}
          <div className="min-h-[340px] flex flex-col items-center justify-center text-center">
            
            {/* Step 0: Welcome */}
            {step === 0 && (
              <div className="animate-in fade-in zoom-in-95 duration-300 flex flex-col items-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#1a88ff] to-[#26d8c4] flex items-center justify-center shadow-lg shadow-[#1a88ff]/30 mb-6 relative">
                  <Sparkles className="absolute -top-2 -right-2 text-yellow-400 w-6 h-6 animate-pulse" />
                  <Bot size={32} className="text-white" />
                </div>

                <h2 className="text-2xl sm:text-3xl font-bold font-headline text-white tracking-tight mb-3">
                  ¡Bienvenido a <br className="hidden sm:inline" /> SIKAI SOP Generator! 🤖
                </h2>
                
                <p className="text-gray-400 text-sm leading-relaxed max-w-sm mb-6">
                  Crea Procedimientos Operativos Estándar (SOP) de clase mundial en segundos utilizando el motor de Inteligencia Artificial de SIKAI.
                </p>

                <div className="w-full grid grid-cols-3 gap-3 text-left">
                  <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 flex flex-col gap-1.5">
                    <FileText size={18} className="text-[#1a88ff]" />
                    <span className="text-xs font-bold text-white leading-tight">SOP Estructurado</span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 flex flex-col gap-1.5">
                    <Zap size={18} className="text-[#26d8c4]" />
                    <span className="text-xs font-bold text-white leading-tight">SIKAI Flow Diagrama</span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 flex flex-col gap-1.5">
                    <Award size={18} className="text-purple-400" />
                    <span className="text-xs font-bold text-white leading-tight">SIKAI Boost Estrategia</span>
                  </div>
                </div>
              </div>
            )}

            {/* Step 1: Voice vs Manual */}
            {step === 1 && (
              <div className="animate-in fade-in zoom-in-95 duration-300 flex flex-col items-center w-full">
                <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[#26d8c4] mb-6">
                  <Mic size={30} className="animate-pulse" />
                </div>

                <h2 className="text-2xl font-bold font-headline text-white tracking-tight mb-3">
                  Dos Formas de Documentar 📝🎙️
                </h2>
                
                <p className="text-gray-400 text-sm leading-relaxed max-w-md mb-6">
                  Elige el método de entrada que mejor se adapte a tu flujo de trabajo diario:
                </p>

                <div className="w-full space-y-3 text-left">
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-start gap-4">
                    <div className="p-2 rounded-xl bg-[#1a88ff]/10 border border-[#1a88ff]/20 text-[#1a88ff] mt-0.5">
                      <FileText size={16} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Formulario Manual Guiado</h4>
                      <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">Completa los campos estructurados indicando objetivos, roles, herramientas y pasos específicos.</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-start gap-4">
                    <div className="p-2 rounded-xl bg-[#26d8c4]/10 border border-[#26d8c4]/20 text-[#26d8c4] mt-0.5">
                      <Mic size={16} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">SIKAI Voice Agent (Premium)</h4>
                      <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">Explica el proceso hablando naturalmente. La IA transcribirá todo y estructurará el procedimiento automáticamente.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: High Quality SOPs */}
            {step === 2 && (
              <div className="animate-in fade-in zoom-in-95 duration-300 flex flex-col items-center w-full">
                <div className="w-16 h-16 rounded-2xl bg-[#26d8c4]/10 border border-[#26d8c4]/30 flex items-center justify-center text-[#26d8c4] mb-6">
                  <CheckCircle2 size={32} />
                </div>

                <h2 className="text-2xl font-bold font-headline text-white tracking-tight mb-3">
                  Genera SOPs de Alta Calidad 🏆
                </h2>
                
                <p className="text-gray-400 text-sm leading-relaxed max-w-sm mb-5">
                  Sigue estas directrices para obtener resultados profesionales de máxima precisión:
                </p>

                <div className="w-full space-y-2.5 text-left text-xs text-gray-300">
                  <div className="flex items-start gap-2.5">
                    <span className="text-[#26d8c4] font-bold mt-0.5">✔</span>
                    <p><strong className="text-white">Sé Específico en los Roles:</strong> Define responsables concretos (ej: "Líder de Ventas" en vez de "Alguien").</p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="text-[#26d8c4] font-bold mt-0.5">✔</span>
                    <p><strong className="text-white">Detalla Herramientas:</strong> Menciona el software o canales exactos utilizados (ej: "Notificar en canal de Slack #ventas").</p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="text-[#26d8c4] font-bold mt-0.5">✔</span>
                    <p><strong className="text-white">Menciona Cuellos de Botella:</strong> Indica dónde suele atascarse el proceso. La sección <strong className="text-[#26d8c4]">SIKAI Boost</strong> te propondrá mejoras quirúrgicas para optimizarlo.</p>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Dots Indicator & Actions */}
          <div className="mt-8 flex items-center justify-between border-t border-white/5 pt-5">
            {/* Dots */}
            <div className="flex gap-2">
              {[0, 1, 2].map((i) => (
                <div 
                  key={i} 
                  className={`h-2 rounded-full transition-all duration-300 ${i === step ? 'w-6 bg-[#26d8c4]' : 'w-2 bg-white/20'}`}
                />
              ))}
            </div>

            {/* Navigation Buttons */}
            <div className="flex gap-2">
              {step > 0 && (
                <button
                  onClick={prevStep}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium text-xs border border-white/5 transition-all active:scale-95"
                >
                  <ChevronLeft size={14} /> Anterior
                </button>
              )}
              
              <button
                onClick={nextStep}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#1a88ff] to-[#26d8c4] text-white font-bold text-xs shadow-md shadow-[#1a88ff]/25 hover:opacity-90 transition-all active:scale-95"
              >
                {step === 2 ? '¡Empezar!' : 'Siguiente'} <ChevronRight size={14} />
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
