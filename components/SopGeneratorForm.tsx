'use client'

import { useState, useRef, useEffect } from 'react'
import { Mic, MicOff, Plus, Trash2, Zap, Send } from 'lucide-react'
import { useRouter } from 'next/navigation'

type InputMode = 'manual' | 'voice'

export default function SopGeneratorForm() {
  const [mode, setMode] = useState<InputMode>('manual')
  const [isRecording, setIsRecording] = useState(false)
  
  // Voice State
  const [globalVoiceText, setGlobalVoiceText] = useState('')
  const [recordingTime, setRecordingTime] = useState(0)
  
  // Manual State
  const [title, setTitle] = useState('')
  const [objective, setObjective] = useState('')
  const [roles, setRoles] = useState('')
  const [tools, setTools] = useState('')
  const [bottlenecks, setBottlenecks] = useState('')
  const [steps, setSteps] = useState([{ id: 1, text: '' }])
  
  // UI State
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  // Speech Recognition Reference
  const recognitionRef = useRef<any>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = true
      recognitionRef.current.interimResults = true
      recognitionRef.current.lang = 'es-ES'

      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = ''
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript + ' '
          }
        }
        if (finalTranscript) {
          setGlobalVoiceText((prev) => prev + finalTranscript)
        }
      }

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error", event.error)
        stopRecording()
      }
      }
    }
  }, [])

  useEffect(() => {
    // 8 minute limit (480 seconds)
    if (recordingTime >= 480 && isRecording) {
      stopRecording()
    }
  }, [recordingTime])

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording()
    } else {
      startRecording()
    }
  }

  const startRecording = () => {
    if (!recognitionRef.current) {
      alert("Tu navegador no soporta grabación de voz.")
      return
    }
    setError('')
    setGlobalVoiceText('')
    setRecordingTime(0)
    setIsRecording(true)
    recognitionRef.current.start()
    timerRef.current = setInterval(() => {
      setRecordingTime((prev) => prev + 1)
    }, 1000)
  }

  const stopRecording = () => {
    setIsRecording(false)
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0')
    const s = (seconds % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  const addStep = () => {
    if (steps.length < 10) {
      setSteps([...steps, { id: Date.now(), text: '' }])
    }
  }

  const removeStep = (id: number) => {
    if (steps.length > 1) {
      setSteps(steps.filter((step) => step.id !== id))
    }
  }

  const handleStepChange = (id: number, text: string) => {
    setSteps(steps.map((step) => (step.id === id ? { ...step, text } : step)))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsGenerating(true)
    setError('')
    
    // Prepare data
    const payload = mode === 'voice' 
      ? { mode: 'voice', voiceText: globalVoiceText }
      : { mode: 'manual', title, objective, roles, tools, bottlenecks, steps: steps.map(s => s.text) }

    try {
      const res = await fetch('/api/generate-sop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      
      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error || 'Error al generar el SOP')
      }
      
      // Navigate to result or handle result
      // For MVP, we will redirect to a result page passing the SOP ID
      router.push(`/dashboard/sop/${data.sopId}`)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="glass-card p-6 md:p-8 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-8">
        <button
          type="button"
          onClick={() => setMode('manual')}
          className={`px-6 py-3 rounded-xl font-bold transition-all ${
            mode === 'manual' 
              ? 'bg-[#1a88ff]/20 border border-[#1a88ff] text-[#1a88ff] shadow-[0_0_15px_rgba(26,136,255,0.3)]' 
              : 'bg-transparent border border-black/10 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5'
          }`}
        >
          Formulario Manual
        </button>
        <button
          type="button"
          onClick={() => setMode('voice')}
          className={`px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${
            mode === 'voice' 
              ? 'bg-[#26d8c4]/20 border border-[#26d8c4] text-[#26d8c4] shadow-[0_0_15px_rgba(38,216,196,0.3)]' 
              : 'bg-transparent border border-black/10 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5'
          }`}
        >
          <Mic className="w-5 h-5" /> SIKAI Voice
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {mode === 'voice' ? (
          <div className="flex flex-col items-center justify-center space-y-6 py-10">
            <button
              type="button"
              onClick={toggleRecording}
              className={`relative flex items-center justify-center w-32 h-32 rounded-full transition-all duration-300 ${
                isRecording 
                  ? 'bg-red-500/20 border-2 border-red-500 text-red-500 shadow-[0_0_30px_rgba(239,68,68,0.5)] animate-pulse' 
                  : 'bg-[#26d8c4]/10 border-2 border-[#26d8c4] text-[#26d8c4] hover:bg-[#26d8c4]/20'
              }`}
            >
              {isRecording ? <MicOff className="w-12 h-12" /> : <Mic className="w-12 h-12" />}
            </button>
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {isRecording ? 'Escuchando...' : 'Toca para hablar'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {isRecording ? `Grabando: ${formatTime(recordingTime)} / 08:00` : 'Explica el proceso de principio a fin.'}
              </p>
            </div>
            {globalVoiceText && (
              <div className="w-full mt-8 p-4 rounded-xl bg-black/5 dark:bg-black/30 border border-black/10 dark:border-white/10">
                <h4 className="text-[#26d8c4] font-bold mb-2 flex items-center gap-2">
                  <Zap className="w-4 h-4" /> Transcripción en vivo
                </h4>
                <p className="text-gray-800 dark:text-gray-300 whitespace-pre-wrap min-h-[100px] max-h-[300px] overflow-y-auto">
                  {globalVoiceText}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Título del Proceso</label>
                <input 
                  required
                  type="text" 
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="sikai-input"
                  placeholder="Ej: Onboarding de cliente nuevo"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Roles y Responsables</label>
                <input 
                  required
                  type="text"
                  value={roles}
                  onChange={e => setRoles(e.target.value)}
                  className="sikai-input"
                  placeholder="Ej: Ejecutivo de Ventas, Soporte"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Objetivo Principal</label>
              <textarea 
                required
                value={objective}
                onChange={e => setObjective(e.target.value)}
                className="sikai-input min-h-[80px]"
                placeholder="¿Qué se busca lograr al finalizar este proceso?"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Herramientas o Software (Opcional)</label>
                <input 
                  type="text"
                  value={tools}
                  onChange={e => setTools(e.target.value)}
                  className="sikai-input"
                  placeholder="Ej: HubSpot, Slack, Gmail"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cuellos de botella (Opcional)</label>
                <input 
                  type="text" 
                  value={bottlenecks}
                  onChange={e => setBottlenecks(e.target.value)}
                  className="sikai-input"
                  placeholder="¿Dónde suele retrasarse este proceso?"
                />
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-black/10 dark:border-white/10">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-bold text-gray-900 dark:text-white">Pasos del Proceso</h4>
                <span className="text-sm text-gray-600 dark:text-gray-400">{steps.length} / 10 pasos</span>
              </div>
              
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-start gap-3 relative">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#1a88ff]/20 text-[#1a88ff] flex items-center justify-center font-bold mt-1">
                    {index + 1}
                  </div>
                  <textarea
                    required
                    value={step.text}
                    onChange={(e) => handleStepChange(step.id, e.target.value)}
                    maxLength={500}
                    className="sikai-input min-h-[80px]"
                    placeholder="Describe este paso brevemente..."
                  />
                  {steps.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeStep(step.id)}
                      className="absolute right-3 top-3 text-gray-500 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
              
              {steps.length < 10 && (
                <button
                  type="button"
                  onClick={addStep}
                  className="flex items-center gap-2 text-[#1a88ff] font-medium hover:text-white transition-colors"
                >
                  <Plus className="w-4 h-4" /> Añadir otro paso
                </button>
              )}
            </div>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/50 text-red-400">
            {error}
          </div>
        )}

        <div className="pt-8">
          <button
            type="submit"
            disabled={isGenerating || (mode === 'voice' && !globalVoiceText)}
            className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-xl font-bold text-white bg-gradient-to-r from-[#1a88ff] to-[#26d8c4] hover:shadow-[0_0_25px_rgba(26,136,255,0.6)] disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:-translate-y-1"
          >
            {isGenerating ? (
              <span className="flex items-center gap-2 animate-pulse">
                <Zap className="w-5 h-5 animate-bounce" /> Generando SIKAI SOP...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Send className="w-5 h-5" /> Generar SIKAI SOP (Consume 1 Crédito)
              </span>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
