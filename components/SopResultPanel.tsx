'use client'

import { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import mermaid from 'mermaid'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Check, 
  Copy, 
  Download, 
  Target, 
  Compass, 
  Users, 
  Wrench, 
  Milestone, 
  FileText, 
  AlertTriangle, 
  Zap, 
  ChevronDown, 
  Cpu, 
  Sparkles,
  Award
} from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import { deduplicateText, formatMarkdownSubpoints, sanitizeMermaidCode } from '@/utils/cleaners'

type TabType = 'sop' | 'flow' | 'boost'

interface SopResultPanelProps {
  sop: {
    title: string
    markdown_content: string
    mermaid_code: string
    boost_strategy: string
  }
}

// ── Types for parsed content ──
interface Section {
  title: string
  content: string
}

interface Step {
  title: string
  number: number
  accion?: string
  herramienta?: string
  descripcion?: string
  rawContent: string
}

interface BoostRecommendation {
  number: number
  title: string
  cuelloBotella?: string
  mejora?: string
  details?: string
  rawContent: string
}


// ── Parsers ──
function parseMarkdownSections(markdown: string): Section[] {
  if (!markdown) return []
  const lines = markdown.split('\n')
  const sections: Section[] = []
  let currentTitle = ''
  let currentContent: string[] = []

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) {
      if (currentTitle) currentContent.push(line)
      continue
    }

    // Match main headings like "1. Objetivo", "### 2. Alcance", "## 3. Roles y Responsabilidades"
    const isHeading = trimmed.startsWith('#') || 
                      (/^(?:\*\*?\s*)?\d+\.\s+[A-ZÁÉÍÓÚ]/i.test(trimmed) && !/^\d+\.\d+/.test(trimmed))

    if (isHeading) {
      if (currentTitle || currentContent.length > 0) {
        sections.push({
          title: currentTitle || 'Resumen',
          content: currentContent.join('\n').trim()
        })
      }
      
      let cleanTitle = trimmed
        .replace(/^#+\s*/, '')
        .replace(/^\*\*?/, '')
        .replace(/\*\*?$/, '')
        .replace(/^\d+\.\s*/, '')
        .trim()
      
      currentTitle = cleanTitle
      currentContent = []
    } else {
      currentContent.push(line)
    }
  }

  if (currentTitle || currentContent.length > 0) {
    sections.push({
      title: currentTitle || 'Resumen',
      content: currentContent.join('\n').trim()
    })
  }

  return sections.filter(s => s.title && s.content)
}

function parseSteps(content: string): Step[] {
  if (!content) return []
  const steps: Step[] = []
  const lines = content.split('\n')
  
  let currentStep: Partial<Step> | null = null
  let currentRawLines: string[] = []

  for (const line of lines) {
    const trimmed = line.trim()
    // Match "Paso 1: ...", "**Paso 2:** ...", "### Paso 3: ..."
    const stepMatch = trimmed.match(/^(?:#+\s+|\*\*?)?Paso\s+(\d+)\s*[\.:]?\s*(.*?)(?:\*\*?)?$/i)
    
    if (stepMatch) {
      if (currentStep) {
        currentStep.rawContent = currentRawLines.join('\n').trim()
        parseStepFields(currentStep, currentRawLines)
        steps.push(currentStep as Step)
      }
      
      currentStep = {
        number: parseInt(stepMatch[1], 10),
        title: stepMatch[2].trim(),
      }
      currentRawLines = []
    } else {
      if (currentStep) {
        currentRawLines.push(line)
      }
    }
  }

  if (currentStep) {
    currentStep.rawContent = currentRawLines.join('\n').trim()
    parseStepFields(currentStep, currentRawLines)
    steps.push(currentStep as Step)
  }

  return steps
}

function parseStepFields(step: Partial<Step>, lines: string[]) {
  let currentField: 'accion' | 'herramienta' | 'descripcion' | null = null
  let fieldValues = { accion: '', herramienta: '', descripcion: '' }

  // Split lines that have multiple subpoints on a single line first (e.g. "3.1. Acción: ... 3.2. Herramienta: ...")
  const virtualLines: string[] = []
  for (const line of lines) {
    const splitParts = line.split(/\s+(?=(?:\*\*?\s*)?\d+\.\d+\.?\s*)/)
    virtualLines.push(...splitParts)
  }

  for (const line of virtualLines) {
    const trimmed = line.trim()
    if (!trimmed) continue

    const accionMatch = trimmed.match(/^(?:\d+\.\d+\.?\s+)?(?:\*\*?)?Acci[oó]n(?:\*\*?)?\s*:\s*(.*)$/i)
    const herramientaMatch = trimmed.match(/^(?:\d+\.\d+\.?\s+)?(?:\*\*?)?Herramienta(?:\*\*?)?\s*:\s*(.*)$/i)
    const descripcionMatch = trimmed.match(/^(?:\d+\.\d+\.?\s+)?(?:\*\*?)?Descripci[oó]n(?:\*\*?)?\s*:\s*(.*)$/i)

    if (accionMatch) {
      currentField = 'accion'
      fieldValues.accion = accionMatch[1].trim()
    } else if (herramientaMatch) {
      currentField = 'herramienta'
      fieldValues.herramienta = herramientaMatch[1].trim()
    } else if (descripcionMatch) {
      currentField = 'descripcion'
      fieldValues.descripcion = descripcionMatch[1].trim()
    } else if (currentField) {
      fieldValues[currentField] += ' ' + trimmed
    }
  }

  if (fieldValues.accion) step.accion = fieldValues.accion
  if (fieldValues.herramienta) step.herramienta = fieldValues.herramienta
  if (fieldValues.descripcion) step.descripcion = fieldValues.descripcion
}

function parseBoostRecommendations(boostText: string): { intro: string, recommendations: BoostRecommendation[] } {
  if (!boostText) return { intro: '', recommendations: [] }
  const lines = boostText.split('\n')
  const recommendations: BoostRecommendation[] = []
  let introLines: string[] = []
  
  let firstRecIndex = -1
  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim()
    const recMatch = trimmed.match(/^(?:#+\s+)?(?:\*\*?\s*)?(\d+)\s*[\.:]\s*(.*?)(?:\*\*?)?$/)
    if (recMatch && !/^\d+\.\d+/.test(trimmed)) {
      firstRecIndex = i
      break
    }
  }
  
  if (firstRecIndex === -1) {
    return {
      intro: boostText.trim(),
      recommendations: []
    }
  }
  
  introLines = lines.slice(0, firstRecIndex)
  
  let currentRec: Partial<BoostRecommendation> | null = null
  let currentRawLines: string[] = []
  
  for (let i = firstRecIndex; i < lines.length; i++) {
    const line = lines[i]
    const trimmed = line.trim()
    const recMatch = trimmed.match(/^(?:#+\s+)?(?:\*\*?\s*)?(\d+)\s*[\.:]\s*(.*?)(?:\*\*?)?$/)
    
    if (recMatch && !/^\d+\.\d+/.test(trimmed)) {
      if (currentRec) {
        currentRec.rawContent = currentRawLines.join('\n').trim()
        parseBoostFields(currentRec, currentRawLines)
        recommendations.push(currentRec as BoostRecommendation)
      }
      
      currentRec = {
        number: parseInt(recMatch[1], 10),
        title: recMatch[2].replace(/^\*\*?/, '').replace(/\*\*?$/, '').trim()
      }
      currentRawLines = []
    } else {
      if (currentRec) {
        currentRawLines.push(line)
      }
    }
  }
  
  if (currentRec) {
    currentRec.rawContent = currentRawLines.join('\n').trim()
    parseBoostFields(currentRec, currentRawLines)
    recommendations.push(currentRec as BoostRecommendation)
  }
  
  return {
    intro: introLines.join('\n').trim(),
    recommendations
  }
}

function parseBoostFields(rec: Partial<BoostRecommendation>, lines: string[]) {
  const text = lines.join(' ').trim()
  const cuelloMatch = text.match(/(?:\*\*?)?Cuello\s+de\s+botella(?:\*\*?)?\s*:\s*(.*?)(?=(?:\*\*?)?Mejora(?:\*\*?)?\s*:|$)/i)
  const mejoraMatch = text.match(/(?:\*\*?)?Mejora(?:\*\*?)?\s*:\s*(.*?)(?=(?:\*\*?)?Cuello\s+de\s+botella(?:\*\*?)?\s*:|$)/i)

  if (cuelloMatch) {
    rec.cuelloBotella = cuelloMatch[1].replace(/^\*\*?/, '').replace(/\*\*?$/, '').trim()
  }
  if (mejoraMatch) {
    rec.mejora = mejoraMatch[1].replace(/^\*\*?/, '').replace(/\*\*?$/, '').trim()
  }

  rec.details = lines.filter(l => {
    const trimmed = l.trim().toLowerCase()
    return !trimmed.includes('cuello de botella') && !trimmed.includes('mejora:') && !trimmed.includes('mejora :')
  }).join('\n').trim()
}

// ── Icons for sections ──
function getSectionIcon(title: string) {
  const t = title.toLowerCase()
  if (t.includes('objetivo')) return <Target className="w-5 h-5 text-[#1a88ff] drop-shadow-[0_0_8px_var(--primary-glow)]" />
  if (t.includes('alcance')) return <Compass className="w-5 h-5 text-[#26d8c4] drop-shadow-[0_0_8px_var(--cyan-glow)]" />
  if (t.includes('rol') || t.includes('responsabilidad')) return <Users className="w-5 h-5 text-indigo-400 drop-shadow-[0_0_8px_rgba(129,140,248,0.5)]" />
  if (t.includes('herramienta')) return <Wrench className="w-5 h-5 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]" />
  if (t.includes('paso') || t.includes('procedimiento')) return <Milestone className="w-5 h-5 text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
  return <FileText className="w-5 h-5 text-purple-400" />
}

export default function SopResultPanel({ sop }: SopResultPanelProps) {
  const [activeTab, setActiveTab] = useState<TabType>('sop')
  const [copied, setCopied] = useState(false)
  const { theme } = useTheme()

  // Expandable sections state for SOP (First is open by default)
  const [expandedSections, setExpandedSections] = useState<Record<number, boolean>>({ 0: true })

  // Expandable sections state for Boost Recommendations
  const [expandedBoost, setExpandedBoost] = useState<Record<number, boolean>>({ 0: true })

  // Clean and parse the markdown SOP content
  const cleanMarkdownContent = deduplicateText(sop.markdown_content)
  const sopSections = parseMarkdownSections(cleanMarkdownContent)
  const hasMultipleSections = sopSections.length > 1

  // Parse Boost Recommendations
  const cleanBoostStrategy = deduplicateText(sop.boost_strategy)
  const { intro: boostIntro, recommendations: boostRecommendations } = parseBoostRecommendations(cleanBoostStrategy)
  const hasBoostRecs = boostRecommendations.length > 0

  // Sanitized Mermaid Code
  const cleanMermaidCode = deduplicateText(sop.mermaid_code)
  const sanitizedFlowCode = sanitizeMermaidCode(cleanMermaidCode)

  useEffect(() => {
    if (activeTab === 'flow' && sanitizedFlowCode) {
      mermaid.initialize({ 
        startOnLoad: true, 
        theme: theme === 'dark' ? 'dark' : 'default',
        themeVariables: theme === 'dark' ? {
          primaryColor: '#1a88ff',
          primaryTextColor: '#fff',
          primaryBorderColor: '#26d8c4',
          lineColor: '#26d8c4',
          secondaryColor: '#26d8c4',
          tertiaryColor: '#16181d'
        } : {
          primaryColor: '#1a88ff',
          primaryTextColor: '#333',
          primaryBorderColor: '#26d8c4',
          lineColor: '#1a88ff',
          secondaryColor: '#26d8c4',
          tertiaryColor: '#faf6fd'
        }
      })
      setTimeout(() => {
        try {
          mermaid.contentLoaded()
        } catch (e) {
          console.error("Mermaid live render error caught:", e)
        }
      }, 100)
    }
  }, [activeTab, sanitizedFlowCode, theme])

  const copyToClipboard = () => {
    let contentToCopy = ''
    if (activeTab === 'sop') contentToCopy = cleanMarkdownContent
    if (activeTab === 'flow') contentToCopy = sanitizedFlowCode
    if (activeTab === 'boost') contentToCopy = cleanBoostStrategy

    navigator.clipboard.writeText(contentToCopy)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const toggleSection = (idx: number) => {
    setExpandedSections(prev => ({ ...prev, [idx]: !prev[idx] }))
  }

  const toggleBoost = (idx: number) => {
    setExpandedBoost(prev => ({ ...prev, [idx]: !prev[idx] }))
  }

  return (
    <div className="glass-card flex flex-col h-full min-h-[600px] border border-black/10 dark:border-white/10 shadow-2xl relative">
      {/* Glow Effects in background */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-blob bg-blob-primary -mr-40 -mt-40 opacity-15 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-blob bg-blob-cyan -ml-40 -mb-40 opacity-15 pointer-events-none" />

      {/* Header & Tabs */}
      <div className="border-b border-black/10 dark:border-white/10 p-6 z-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-glow flex items-center gap-2">
            <Award className="w-6 h-6 text-[#1a88ff]" />
            {sop.title}
          </h2>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#1a88ff]/10 text-[#1a88ff] border border-[#1a88ff]/20">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            AI Optimizado
          </span>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-2 bg-black/10 dark:bg-black/45 p-1 rounded-xl w-fit border border-black/5 dark:border-white/5">
          <button
            onClick={() => setActiveTab('sop')}
            className={`px-5 py-2.5 rounded-lg text-sm font-bold tracking-wide transition-all cursor-pointer ${
              activeTab === 'sop' 
                ? 'bg-gradient-to-r from-[#1a88ff] to-[#1a88ff]/80 text-white shadow-lg' 
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            SIKAI SOP
          </button>
          <button
            onClick={() => setActiveTab('flow')}
            className={`px-5 py-2.5 rounded-lg text-sm font-bold tracking-wide transition-all cursor-pointer ${
              activeTab === 'flow' 
                ? 'bg-gradient-to-r from-[#26d8c4] to-[#26d8c4]/80 text-white shadow-lg' 
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            SIKAI Flow
          </button>
          <button
            onClick={() => setActiveTab('boost')}
            className={`px-5 py-2.5 rounded-lg text-sm font-bold tracking-wide transition-all cursor-pointer ${
              activeTab === 'boost' 
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg' 
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            SIKAI Boost
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 p-6 overflow-y-auto z-10 print-expanded">
        
        {/* ── TAB 1: SIKAI SOP (Accordions & Timeline) ── */}
        {activeTab === 'sop' && (
          <div className="space-y-4">
            {hasMultipleSections ? (
              sopSections.map((section, idx) => {
                const isExpanded = !!expandedSections[idx]
                const isStepByStep = section.title.toLowerCase().includes('paso') || section.title.toLowerCase().includes('procedimiento')
                const steps = isStepByStep ? parseSteps(section.content) : []

                return (
                  <div 
                    key={idx} 
                    className="border border-black/10 dark:border-white/10 rounded-2xl overflow-hidden glass transition-all duration-300 hover:border-[#1a88ff]/30 shadow-sm"
                  >
                    {/* Header trigger */}
                    <button
                      onClick={() => toggleSection(idx)}
                      className="w-full flex items-center justify-between p-5 text-left font-bold text-gray-900 dark:text-white transition-all hover:bg-black/5 dark:hover:bg-white/[0.02] cursor-pointer"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="p-2 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 flex items-center justify-center">
                          {getSectionIcon(section.title)}
                        </div>
                        <span className="text-lg font-bold tracking-tight">{section.title}</span>
                      </div>
                      <motion.div
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                      >
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      </motion.div>
                    </button>

                    {/* Expandable content */}
                    <AnimatePresence initial={false}>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
                        >
                          <div className="p-6 border-t border-black/10 dark:border-white/10 bg-black/[0.01] dark:bg-black/30 text-gray-700 dark:text-gray-300">
                            {isStepByStep && steps.length > 0 ? (
                              <SopStepsTimeline steps={steps} />
                            ) : (
                              <div className="prose dark:prose-invert prose-blue max-w-none leading-relaxed whitespace-pre-line">
                                {/* Formatted sub-points (e.g. 3.1, 3.2) split into single lines per renglón */}
                                <ReactMarkdown>{formatMarkdownSubpoints(section.content)}</ReactMarkdown>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )
              })
            ) : (
              // Fallback to standard Markdown rendering if parsing yielded nothing
              <div className="prose dark:prose-invert prose-blue max-w-none leading-relaxed p-4 glass rounded-2xl border border-black/10 dark:border-white/10 whitespace-pre-line">
                <ReactMarkdown>{formatMarkdownSubpoints(sop.markdown_content)}</ReactMarkdown>
              </div>
            )}
          </div>
        )}

        {/* ── TAB 2: SIKAI Flow (Mermaid Live Chart) ── */}
        {activeTab === 'flow' && (
          <div className="flex items-center justify-center min-h-[480px] bg-black/5 dark:bg-[#09101d]/80 rounded-2xl border border-black/5 dark:border-white/5 p-6 shadow-inner overflow-x-auto">
            <div className="w-full max-w-4xl flex justify-center">
              <pre className="mermaid text-center w-full" key={`${theme}-${sanitizedFlowCode}`}>
                {sanitizedFlowCode}
              </pre>
            </div>
          </div>
        )}

        {/* ── TAB 3: SIKAI Boost (Premium Recommendations & Bottlenecks) ── */}
        {activeTab === 'boost' && (
          <div className="space-y-6">
            {hasBoostRecs ? (
              <>
                {boostIntro && (
                  <div className="p-5 glass rounded-2xl border border-black/10 dark:border-white/10 text-gray-700 dark:text-gray-300 leading-relaxed bg-gradient-to-r from-purple-500/5 to-transparent">
                    <ReactMarkdown>{boostIntro}</ReactMarkdown>
                  </div>
                )}

                <div className="space-y-4">
                  {boostRecommendations.map((rec, idx) => {
                    const isExpanded = !!expandedBoost[idx]

                    return (
                      <div 
                        key={idx} 
                        className="border border-black/10 dark:border-white/10 rounded-2xl overflow-hidden glass transition-all duration-300 hover:border-purple-500/30 shadow-sm"
                      >
                        <button
                          onClick={() => toggleBoost(idx)}
                          className="w-full flex items-center justify-between p-5 text-left font-bold text-gray-900 dark:text-white transition-all hover:bg-black/5 dark:hover:bg-white/[0.02] cursor-pointer"
                        >
                          <div className="flex items-center gap-3.5">
                            <div className="w-8 h-8 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-sm">
                              {rec.number}
                            </div>
                            <span className="text-lg font-bold tracking-tight text-purple-900 dark:text-purple-300">{rec.title}</span>
                          </div>
                          <motion.div
                            animate={{ rotate: isExpanded ? 180 : 0 }}
                            transition={{ duration: 0.25, ease: 'easeInOut' }}
                          >
                            <ChevronDown className="w-5 h-5 text-gray-400" />
                          </motion.div>
                        </button>

                        <AnimatePresence initial={false}>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
                            >
                              <div className="p-6 border-t border-black/10 dark:border-white/10 bg-black/[0.01] dark:bg-black/30 space-y-4">
                                
                                {/* Cuello de botella & Mejora Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {rec.cuelloBotella && (
                                    <div className="bg-red-500/5 dark:bg-red-500/[0.02] rounded-xl p-4 border border-red-500/10 dark:border-red-500/[0.05]">
                                      <span className="text-xs font-bold uppercase tracking-wider text-red-500 flex items-center gap-1.5 mb-1.5 font-headline">
                                        <AlertTriangle className="w-4 h-4" />
                                        Cuello de Botella
                                      </span>
                                      <p className="text-sm text-gray-800 dark:text-gray-200 font-medium">
                                        {rec.cuelloBotella}
                                      </p>
                                    </div>
                                  )}

                                  {rec.mejora && (
                                    <div className="bg-[#26d8c4]/5 dark:bg-[#26d8c4]/[0.02] rounded-xl p-4 border border-[#26d8c4]/10 dark:border-[#26d8c4]/[0.05]">
                                      <span className="text-xs font-bold uppercase tracking-wider text-[#26d8c4] flex items-center gap-1.5 mb-1.5 font-headline">
                                        <Zap className="w-4 h-4" />
                                        Mejora Propuesta
                                      </span>
                                      <p className="text-sm text-gray-800 dark:text-gray-200 font-medium">
                                        {rec.mejora}
                                      </p>
                                    </div>
                                  )}
                                </div>

                                {/* Details text */}
                                {rec.details && (
                                  <div className="prose dark:prose-invert prose-purple max-w-none text-gray-700 dark:text-gray-300 bg-black/5 dark:bg-white/[0.01] p-5 rounded-xl border border-black/5 dark:border-white/[0.03] leading-relaxed">
                                    <ReactMarkdown>{rec.details}</ReactMarkdown>
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )
                  })}
                </div>
              </>
            ) : (
              // Fallback to standard Markdown - No duplications occur here
              <div className="prose dark:prose-invert prose-purple max-w-none p-4 glass rounded-2xl border border-black/10 dark:border-white/10">
                <ReactMarkdown>{sop.boost_strategy}</ReactMarkdown>
              </div>
            )}
          </div>
        )}

      </div>

      {/* Footer Actions */}
      <div className="border-t border-black/10 dark:border-white/10 p-5 flex flex-col sm:flex-row items-center justify-between gap-4 bg-black/5 dark:bg-black/25 z-10 rounded-b-2xl">
        <div className="text-sm text-gray-500 dark:text-gray-400 font-medium text-center sm:text-left">
          Generado automáticamente por <span className="text-[#1a88ff] font-bold">SIKAI SOP Generator AI</span>
        </div>
        <div className="flex gap-3 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={copyToClipboard}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-gray-900 dark:text-white font-bold transition-all border border-black/10 dark:border-white/10 text-sm cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copiado' : 'Copiar Texto'}
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#1a88ff] to-[#26d8c4] text-white font-bold transition-all text-sm shadow-[0_0_15px_rgba(26,136,255,0.3)] hover:shadow-[0_0_25px_rgba(38,216,196,0.5)] cursor-pointer"
          >
            <Download className="w-4 h-4" /> Exportar PDF
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Vertical Step-by-Step Timeline Component ──
interface SopStepsTimelineProps {
  steps: Step[]
}

function SopStepsTimeline({ steps }: SopStepsTimelineProps) {
  if (!steps || steps.length === 0) return null

  return (
    <div className="relative pl-6 sm:pl-8 border-l-2 border-black/10 dark:border-white/10 space-y-8 py-2 ml-4">
      {steps.map((step, idx) => {
        return (
          <div key={idx} className="relative group">
            {/* Timeline connector circle node */}
            <div className="absolute -left-[41px] sm:-left-[49px] top-1.5 flex items-center justify-center w-8 h-8 rounded-full bg-[#16181d] border-2 border-[#1a88ff] group-hover:border-[#26d8c4] text-white font-bold text-sm shadow-[0_0_10px_rgba(26,136,255,0.2)] transition-all duration-300 z-20">
              {step.number}
            </div>

            {/* Step panel */}
            <div className="glass-card hover:border-[#1a88ff]/40 p-5 rounded-2xl border border-black/5 dark:border-white/5 transition-all duration-300 bg-gradient-to-br from-black/[0.01] to-transparent dark:from-white/[0.01] dark:to-transparent">
              <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2 leading-snug">
                {step.title}
              </h4>

              <div className="grid grid-cols-1 gap-4">
                
                {/* Action box */}
                {step.accion && (
                  <div className="bg-black/5 dark:bg-white/[0.02] rounded-xl p-4 border border-black/5 dark:border-white/[0.04]">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#1a88ff] block mb-1 font-headline">
                      Acción
                    </span>
                    <p className="text-sm text-gray-800 dark:text-gray-200 font-medium">
                      {step.accion}
                    </p>
                  </div>
                )}

                {/* Tool box */}
                {step.herramienta && (
                  <div className="bg-black/5 dark:bg-white/[0.02] rounded-xl p-4 border border-black/5 dark:border-white/[0.04]">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#26d8c4] block mb-1.5 font-headline">
                      Herramienta
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#26d8c4]/10 text-[#26d8c4] border border-[#26d8c4]/20">
                      <Cpu className="w-3.5 h-3.5" />
                      {step.herramienta}
                    </span>
                  </div>
                )}

                {/* Description box */}
                {step.descripcion && (
                  <div className="bg-black/5 dark:bg-white/[0.01] rounded-xl p-4 border border-black/5 dark:border-white/[0.03]">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-400 block mb-1.5 font-headline">
                      Descripción
                    </span>
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed font-body">
                      {step.descripcion}
                    </p>
                  </div>
                )}

                {/* Fallback if parse missed specific tags */}
                {!step.accion && !step.herramienta && !step.descripcion && step.rawContent && (
                  <div className="prose dark:prose-invert prose-sm max-w-none text-gray-700 dark:text-gray-300">
                    <ReactMarkdown>{step.rawContent}</ReactMarkdown>
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
