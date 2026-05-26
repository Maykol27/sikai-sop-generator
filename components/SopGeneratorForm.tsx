'use client'

import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Mic, MicOff, Plus, Trash2, Zap, Send, Sparkles, X, RefreshCw, ChevronLeft, Check, Edit3 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { SikaiLoader } from '@/components/ui/SikaiLoader'

type InputMode = 'manual' | 'voice'

export default function SopGeneratorForm() {
  const [mode, setMode] = useState<InputMode>('manual')
  const [isRecording, setIsRecording] = useState(false)
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false)
  
  // Voice State
  const [globalVoiceText, setGlobalVoiceText] = useState('')
  const [recordingTime, setRecordingTime] = useState(0)
  const [amplitudes, setAmplitudes] = useState<number[]>(new Array(8).fill(0.1))
  
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

  // References for Voice Agent
  const recognitionRef = useRef<any>(null)
  const timerRef = useRef<any>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const audioStreamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    // 8 minute limit (480 seconds)
    if (recordingTime >= 480 && isRecording) {
      stopListening()
    }
  }, [recordingTime, isRecording])

  // EFECTO: Visualizaciones Canvas (Orb, Waveform, Nebula)
  useEffect(() => {
    if (!canvasRef.current || !isVoiceModalOpen) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    let animationFrameId: number
    const dpr = window.devicePixelRatio || 1
    canvas.width = 300 * dpr
    canvas.height = 300 * dpr
    ctx.scale(dpr, dpr)
    
    let frame = 0
    const render = () => {
      ctx.clearRect(0, 0, 300, 300)
      const cx = 150
      const cy = 150

      if (isGenerating) {
        // VISTA: Procesando (Mantenemos Orbe/Nebula sutil)
        for (let layer = 0; layer < 4; layer++) {
          const angle = frame * (0.01 + layer * 0.002) + layer
          ctx.fillStyle = "#26d8c4"
          ctx.globalAlpha = 0.1
          ctx.filter = 'blur(25px)'
          
          const pulse = Math.sin(frame * 0.04 + layer) * 8
          const x = cx + Math.cos(angle) * (10 + layer * 3)
          const y = cy + Math.sin(angle * 0.8) * (8 + layer * 2)
          const r = 50 + pulse

          ctx.beginPath()
          ctx.arc(x, y, r, 0, Math.PI * 2)
          ctx.fill()
        }
        ctx.filter = 'none'
        ctx.globalAlpha = 1
      } else if (isRecording) {
        // VISTA: Grabando (Waveform)
        ctx.beginPath()
        ctx.lineWidth = 2.5
        ctx.strokeStyle = "#1a88ff"
        ctx.lineCap = "round"
        
        const count = 30
        const spacing = 140 / count
        const baseHeight = 10
        
        for (let i = 0; i < count; i++) {
          const x = cx - 70 + i * spacing
          const ampIndex = Math.floor(i / (count / 8))
          const amp = amplitudes[ampIndex] || 0.1
          const h = baseHeight + (amp * 50 * Math.sin(frame * 0.1 + i * 0.2))
          
          ctx.moveTo(x, cy - h / 2)
          ctx.lineTo(x, cy + h / 2)
        }
        ctx.shadowBlur = 10
        ctx.shadowColor = "#1a88ff"
        ctx.stroke()
        ctx.shadowBlur = 0
      } else {
        // VISTA: Idle (Orb/Nebula)
        for (let layer = 0; layer < 6; layer++) {
          const angle = frame * (0.005 + layer * 0.001) + layer
          ctx.fillStyle = layer % 2 === 0 ? "#1a88ff" : "#26d8c4"
          ctx.globalAlpha = 0.12
          ctx.filter = 'blur(18px)'
          
          const pulse = Math.sin(frame * 0.02 + layer) * 5
          const x = cx + Math.cos(angle) * (12 + layer * 3)
          const y = cy + Math.sin(angle * 0.7) * (10 + layer * 2)
          const r = 40 + layer * 4 + pulse

          ctx.beginPath()
          ctx.arc(x, y, r, 0, Math.PI * 2)
          ctx.fill()
        }
        ctx.filter = 'none'
        ctx.globalAlpha = 1
      }
      
      frame++
      animationFrameId = requestAnimationFrame(render)
    }
    render()
    return () => cancelAnimationFrame(animationFrameId)
  }, [isVoiceModalOpen, isGenerating, isRecording, amplitudes])

  const openVoiceAgent = () => {
    setIsVoiceModalOpen(true)
    // Small delay to let modal mount and start listening automatically
    setTimeout(() => {
      startListening()
    }, 400)
  }

  const closeVoiceAgent = () => {
    stopListening()
    setIsVoiceModalOpen(false)
  }

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      alert("Tu navegador no soporta reconocimiento de voz. Usa Chrome o Edge.")
      setIsVoiceModalOpen(false)
      return
    }

    setIsRecording(true)
    const baseText = globalVoiceText.trim()
    const recognition = new SpeechRecognition()
    recognitionRef.current = recognition
    recognition.lang = "es-ES" 
    recognition.continuous = true
    recognition.interimResults = true

    recognition.onstart = () => {
      setRecordingTime(0)
      if (timerRef.current) clearInterval(timerRef.current)
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
    }

    recognition.onresult = (event: any) => {
      let sessionFinal = ""
      let sessionInterim = ""
      for (let i = 0; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          sessionFinal += transcript + " "
        } else {
          sessionInterim += transcript
        }
      }
      
      const newSessionText = (sessionFinal + sessionInterim).trim()
      if (newSessionText) {
        setGlobalVoiceText(baseText ? `${baseText} ${newSessionText}` : newSessionText)
      }
    }

    recognition.onerror = (e: any) => {
      console.warn("Speech error", e.error)
      stopListening()
    }

    recognition.onend = () => {
      setIsRecording(false)
    }

    try {
      recognition.start()
    } catch (e) {
      console.error("SpeechRecognition start failed", e)
      setIsRecording(false)
      return
    }

    // DISPOSITIVO MÓVIL: Evitar visualizador si es móvil para prevenir conflictos de micro
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
    if (isMobile) return

    navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
      audioStreamRef.current = stream
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
        const ctx = new AudioContextClass()
        const analyser = ctx.createAnalyser()
        const source = ctx.createMediaStreamSource(stream)
        source.connect(analyser)
        analyser.fftSize = 64 
        
        audioContextRef.current = ctx
        analyserRef.current = analyser

        const bufferLength = analyser.frequencyBinCount
        const dataArray = new Uint8Array(bufferLength)

        const draw = () => {
          if (!analyserRef.current) return
          analyserRef.current.getByteFrequencyData(dataArray)
          const newAmplitudes = []
          const step = Math.floor(bufferLength / 8)
          for(let i=0; i<8; i++) {
            newAmplitudes.push(Math.max(0.1, dataArray[i * step] / 255))
          }
          setAmplitudes(newAmplitudes)
          animationFrameRef.current = requestAnimationFrame(draw)
        }
        draw()
      } catch (e) {
        console.warn("AudioContext visualizer failed to load", e)
      }
    }).catch(err => {
      console.warn("Visualizer mic access parallel skipped", err)
    })
  }

  const stopListening = () => {
    recognitionRef.current?.stop()
    setIsRecording(false)
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current)
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {})
    }
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach(track => track.stop())
    }
    setAmplitudes(new Array(8).fill(0.1))
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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')} : ${secs.toString().padStart(2, '0')} : 00`
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setIsGenerating(true)
    setError('')
    
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
      
      router.push(`/dashboard/sop/${data.sopId}`)
    } catch (err: any) {
      setError(err.message)
      setIsGenerating(false)
    }
  }

  const handleGenerateFromVoice = () => {
    if (!globalVoiceText.trim()) return
    stopListening()
    setIsVoiceModalOpen(false)
    handleSubmit()
  }

  return (
    <>
      {isGenerating && <SikaiLoader text="Generando SIKAI SOP..." />}
      
      <div className="glass-card p-6 md:p-8 max-w-4xl mx-auto">
        {/* Segmented Pill Selector (Formulario vs Voice) */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex p-1 bg-white/60 dark:bg-black/40 backdrop-blur-md rounded-2xl border border-[#1a88ff]/10 dark:border-white/10 w-full max-w-md shadow-inner">
            <button
              type="button"
              onClick={() => setMode('manual')}
              className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all duration-300 text-center ${
                mode === 'manual' 
                  ? 'bg-gradient-to-r from-[#1a88ff] to-[#1a88ff]/80 text-white shadow-[0_4px_12px_rgba(26,136,255,0.25)]' 
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Formulario Manual
            </button>
            <button
              type="button"
              onClick={() => setMode('voice')}
              className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 text-center ${
                mode === 'voice' 
                  ? 'bg-gradient-to-r from-[#26d8c4] to-[#26d8c4]/80 text-black shadow-[0_4px_12px_rgba(38,216,196,0.25)]' 
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Mic className="w-4 h-4" /> SIKAI Voice
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {mode === 'voice' ? (
            <div className="flex flex-col items-center justify-center space-y-6 py-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              {/* Premium UI Voice Intro Card */}
              <div className="w-full text-center p-6 sm:p-8 rounded-2xl bg-white/5 border border-white/5 relative overflow-hidden flex flex-col items-center shadow-xl">
                <div className="absolute top-[-20%] w-[300px] h-[300px] bg-[#26d8c4]/5 rounded-full filter blur-[80px]" />
                
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#1a88ff] to-[#26d8c4] flex items-center justify-center shadow-lg shadow-[#1a88ff]/30 mb-4 relative z-10">
                  <Mic className="text-white w-8 h-8 animate-pulse" />
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 relative z-10 font-headline">
                  Agente de Voz SIKAI SOP
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed max-w-sm mb-6 relative z-10 font-body">
                  Explica el proceso de tu empresa de forma natural y secuencial. Nuestro agente IA transcribirá tus ideas y estructurará un SOP profesional con diagramas al instante.
                </p>

                <button
                  type="button"
                  onClick={openVoiceAgent}
                  className="px-6 py-3.5 bg-gradient-to-r from-[#1a88ff] to-[#26d8c4] hover:shadow-[0_0_25px_rgba(26,136,255,0.4)] text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg flex items-center gap-2 relative z-10"
                >
                  <Sparkles size={16} /> Iniciar Agente de Voz SIKAI
                </button>
              </div>

              {/* Editable live transcript preview shown on form after recording */}
              {globalVoiceText && (
                <div className="w-full mt-6 p-5 rounded-2xl bg-black/5 dark:bg-black/35 border border-black/10 dark:border-white/10 relative group">
                  <div className="flex items-center justify-between mb-3 border-b border-black/10 dark:border-white/10 pb-2">
                    <h4 className="text-[#26d8c4] font-bold flex items-center gap-2 text-xs uppercase tracking-wider">
                      <Edit3 className="w-3.5 h-3.5" /> Transcripción del Proceso (Editable)
                    </h4>
                    <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Revisa y edita tu voz</span>
                  </div>
                  <textarea
                    value={globalVoiceText}
                    onChange={(e) => setGlobalVoiceText(e.target.value)}
                    className="w-full bg-transparent border-0 text-gray-800 dark:text-gray-200 leading-relaxed min-h-[150px] max-h-[300px] overflow-y-auto focus:outline-none focus:ring-0 p-0 text-sm resize-none"
                    placeholder="Tu transcripción de voz aparecerá aquí. Siéntete libre de escribir o corregir cualquier parte."
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                    Título del Proceso
                  </label>
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
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                    Roles y Responsables
                  </label>
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
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                  Objetivo Principal
                </label>
                <textarea 
                  required
                  value={objective}
                  onChange={e => setObjective(e.target.value)}
                  className="sikai-input min-h-[90px]"
                  placeholder="¿Qué se busca lograr al finalizar este proceso?"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                    Herramientas o Software (Opcional)
                  </label>
                  <input 
                    type="text"
                    value={tools}
                    onChange={e => setTools(e.target.value)}
                    className="sikai-input"
                    placeholder="Ej: HubSpot, Slack, Gmail"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                    Cuellos de botella (Opcional)
                  </label>
                  <input 
                    type="text" 
                    value={bottlenecks}
                    onChange={e => setBottlenecks(e.target.value)}
                    className="sikai-input"
                    placeholder="¿Dónde suele retrasarse este proceso?"
                  />
                </div>
              </div>

              <div className="space-y-4 pt-6 border-t border-black/10 dark:border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-base font-bold uppercase tracking-wider text-gray-800 dark:text-gray-300">
                    Pasos del Proceso
                  </h4>
                  <span className="text-xs font-bold text-gray-500 dark:text-gray-400">{steps.length} / 10 pasos</span>
                </div>
                
                {steps.map((step, index) => (
                  <div key={step.id} className="flex items-start gap-4 relative group">
                    <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-[#1a88ff]/10 border border-[#1a88ff]/20 text-[#1a88ff] flex items-center justify-center font-bold mt-1 shadow-sm font-headline">
                      {index + 1}
                    </div>
                    <div className="flex-grow relative w-full">
                      <textarea
                        required
                        value={step.text}
                        onChange={(e) => handleStepChange(step.id, e.target.value)}
                        maxLength={500}
                        className="sikai-input min-h-[90px] pr-12"
                        placeholder="Describe este paso de manera clara y concisa..."
                      />
                      {steps.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeStep(step.id)}
                          className="absolute right-3.5 top-3.5 p-2 rounded-lg bg-black/15 dark:bg-white/5 border border-black/10 dark:border-white/5 text-gray-400 hover:text-red-500 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                          title="Eliminar paso"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                
                {steps.length < 10 && (
                  <button
                    type="button"
                    onClick={addStep}
                    className="w-full py-4 border-2 border-dashed border-[#1a88ff]/20 hover:border-[#1a88ff]/50 rounded-xl text-[#1a88ff] hover:bg-[#1a88ff]/5 flex items-center justify-center gap-2 font-bold transition-all duration-300 group"
                  >
                    <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    Añadir otro paso ({steps.length}/10)
                  </button>
                )}
              </div>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 font-medium">
              {error}
            </div>
          )}

          <div className="pt-6">
            <button
              type="submit"
              disabled={isGenerating || (mode === 'voice' && !globalVoiceText.trim())}
              className="w-full flex items-center justify-center gap-2.5 py-4 px-6 rounded-xl font-bold text-white bg-gradient-to-r from-[#1a88ff] to-[#26d8c4] hover:shadow-[0_0_30px_rgba(26,136,255,0.4)] focus:ring-2 focus:ring-[#1a88ff]/40 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none transition-all duration-300 transform hover:-translate-y-0.5"
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

      {/* SIKAI VOICE AGENT FULL-SCREEN INTERACTIVE PORTAL */}
      {isVoiceModalOpen && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[9999] bg-[#090a0c]/95 dark:bg-[#090a0c]/98 backdrop-blur-3xl flex flex-col animate-in fade-in duration-500 overflow-hidden">
          
          {/* Ambient Glows - Glassmorphism */}
          <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-[#1a88ff]/15 rounded-full filter blur-[120px] animate-pulse pointer-events-none"></div>
          <div className="absolute bottom-[-20%] right-[-10%] w-[700px] h-[700px] bg-[#26d8c4]/15 rounded-full filter blur-[150px] pointer-events-none"></div>

          {/* Shimmering Dynamic Top Progress Bar */}
          <div className="absolute top-0 left-0 right-0 h-[4px] z-50 overflow-hidden animate-pulse bg-gradient-to-r from-[#1a88ff] via-[#26d8c4] to-[#1a88ff]" style={{
            backgroundSize: "200% 100%",
            animation: "shimmer 3s linear infinite"
          }}>
            <div className="absolute inset-0 shadow-[0_0_15px_#1a88ff]" />
          </div>

          {/* Top Header Controls */}
          <div className="absolute top-6 left-6 z-50 flex gap-4">
            <button 
              onClick={closeVoiceAgent} 
              className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/80 hover:bg-white/10 hover:text-white transition shadow-2xl backdrop-blur-2xl active:scale-95"
              title="Cancelar y Salir"
            >
              <ChevronLeft size={24} />
            </button>
          </div>

          {/* Center Main Visualizer Panel */}
          <div className="flex-1 w-full max-w-lg mx-auto flex flex-col justify-center px-6 relative z-10">
            <div className="flex-1 flex flex-col items-center justify-center relative">
              
              {/* Header Status Text */}
              <div className="z-20 text-center max-w-2xl px-6 mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
                {isGenerating ? (
                  <h1 className="text-2xl font-extralight text-white/80 tracking-[0.2em] animate-pulse uppercase">
                    Procesando...
                  </h1>
                ) : isRecording ? (
                  <div className="space-y-1">
                    <h1 className="text-3xl font-extralight text-white tracking-widest uppercase">
                      Escuchando
                    </h1>
                    <p className="text-xs text-[#26d8c4] uppercase tracking-wider font-semibold animate-pulse">Explica tu proceso de forma continua</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <h1 className="text-3xl font-extralight text-white tracking-wider leading-snug">
                      Agente de Voz SIKAI SOP
                    </h1>
                    <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Listo para registrar tus ideas</p>
                  </div>
                )}
              </div>

              {/* Central Glowing Canvas Nebula */}
              <div className="relative w-64 h-64 mb-8 flex items-center justify-center">
                <div className="absolute inset-4 rounded-full bg-gradient-to-tr from-[#1a88ff]/15 to-[#26d8c4]/15 filter blur-3xl animate-pulse pointer-events-none"></div>
                <canvas ref={canvasRef} className="absolute pointer-events-none" style={{ width: '300px', height: '300px' }} />
              </div>

              {/* Recording Timing Overlay */}
              {isRecording && (
                <div className="px-6 py-2 mb-6 rounded-full bg-white/5 border border-white/10 backdrop-blur-md shadow-2xl animate-in zoom-in duration-300">
                  <span className="text-xl font-mono text-white/90 tracking-[0.2em]">{formatTime(recordingTime)}</span>
                </div>
              )}

              {/* Live Speech-to-Text Transcription Box */}
              {globalVoiceText && (
                <div className="w-full max-h-[140px] overflow-y-auto p-4 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-md mb-8 text-center text-white/90 text-sm font-light leading-relaxed scrollbar-thin scrollbar-thumb-white/10">
                  <p className="whitespace-pre-wrap">{globalVoiceText}</p>
                </div>
              )}

              {/* Controllers & Giant Button */}
              <div className="w-full flex flex-col items-center gap-6">
                
                {/* Micro Actions */}
                <div className="flex gap-4">
                  <button
                    onClick={closeVoiceAgent}
                    className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-xs transition-all active:scale-95 flex items-center gap-1.5"
                  >
                    Guardar y Volver
                  </button>

                  <button
                    onClick={handleGenerateFromVoice}
                    disabled={!globalVoiceText.trim()}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#26d8c4] to-[#1a88ff] text-black font-extrabold text-xs shadow-lg shadow-[#26d8c4]/20 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95 flex items-center gap-1.5"
                  >
                    <Send size={12} /> Generar SOP Ahora
                  </button>
                </div>

                {/* Giant Neon Recording Toggle */}
                <div className="flex flex-col items-center gap-2">
                  <button 
                    onClick={isRecording ? stopListening : startListening}
                    disabled={isGenerating}
                    className={`w-20 h-20 rounded-full flex items-center justify-center text-white hover:scale-105 transition-all shadow-2xl relative ${
                      isRecording 
                        ? 'bg-red-500 shadow-red-500/35 ring-4 ring-red-500/20' 
                        : 'bg-gradient-to-br from-[#1a88ff] to-[#1a88ff]/80 shadow-[#1a88ff]/35 ring-4 ring-[#1a88ff]/20'
                    }`}
                  >
                    {isRecording ? <MicOff size={28} /> : <Mic size={28} />}
                    {isRecording && (
                      <span className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-25"></span>
                    )}
                  </button>
                  <span className="text-[10px] text-gray-500 uppercase tracking-[0.4em] font-bold mt-1">
                    {isRecording ? "DETENER" : "GRABAR"}
                  </span>
                </div>

              </div>

            </div>
          </div>

          <style dangerouslySetInnerHTML={{ __html: `
            @keyframes shimmer { 
              0% { background-position: 200% 0; }
              100% { background-position: -200% 0; }
            }
          ` }} />
        </div>,
        document.body
      )}
    </>
  )
}
