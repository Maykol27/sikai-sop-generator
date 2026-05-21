'use client'

import { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import mermaid from 'mermaid'
import { Check, Copy, Download, Share2 } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'

type TabType = 'sop' | 'flow' | 'boost'

interface SopResultPanelProps {
  sop: {
    title: string
    markdown_content: string
    mermaid_code: string
    boost_strategy: string
  }
}

export default function SopResultPanel({ sop }: SopResultPanelProps) {
  const [activeTab, setActiveTab] = useState<TabType>('sop')
  const [copied, setCopied] = useState(false)
  const { theme } = useTheme()

  useEffect(() => {
    if (activeTab === 'flow' && sop.mermaid_code) {
      mermaid.initialize({ 
        startOnLoad: true, 
        theme: theme === 'dark' ? 'dark' : 'default',
        themeVariables: theme === 'dark' ? {
          primaryColor: '#1a88ff',
          primaryTextColor: '#fff',
          primaryBorderColor: '#26d8c4',
          lineColor: '#e0e6ed',
          secondaryColor: '#26d8c4',
          tertiaryColor: '#16181d'
        } : {
          primaryColor: '#1a88ff',
          primaryTextColor: '#333',
          primaryBorderColor: '#26d8c4',
          lineColor: '#555',
          secondaryColor: '#26d8c4',
          tertiaryColor: '#faf6fd'
        }
      })
      setTimeout(() => {
        mermaid.contentLoaded()
      }, 100)
    }
  }, [activeTab, sop.mermaid_code, theme])

  const copyToClipboard = () => {
    let contentToCopy = ''
    if (activeTab === 'sop') contentToCopy = sop.markdown_content
    if (activeTab === 'flow') contentToCopy = sop.mermaid_code
    if (activeTab === 'boost') contentToCopy = sop.boost_strategy

    navigator.clipboard.writeText(contentToCopy)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="glass-card flex flex-col h-full min-h-[600px]">
      {/* Header & Tabs */}
      <div className="border-b border-black/10 dark:border-white/10 p-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-glow">{sop.title}</h2>
        <div className="flex items-center gap-4 border-b border-black/10 dark:border-white/10 pb-[-1px]">
          <button
            onClick={() => setActiveTab('sop')}
            className={`pb-3 font-medium transition-all ${
              activeTab === 'sop' 
                ? 'text-[#1a88ff] border-b-2 border-[#1a88ff]' 
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            SIKAI SOP
          </button>
          <button
            onClick={() => setActiveTab('flow')}
            className={`pb-3 font-medium transition-all ${
              activeTab === 'flow' 
                ? 'text-[#26d8c4] border-b-2 border-[#26d8c4]' 
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            SIKAI Flow
          </button>
          <button
            onClick={() => setActiveTab('boost')}
            className={`pb-3 font-medium transition-all ${
              activeTab === 'boost' 
                ? 'text-purple-600 dark:text-purple-400' 
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            SIKAI Boost
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 p-6 overflow-y-auto">
        {activeTab === 'sop' && (
          <div className="prose dark:prose-invert prose-blue max-w-none">
            <ReactMarkdown>{sop.markdown_content}</ReactMarkdown>
          </div>
        )}

        {activeTab === 'flow' && (
          <div className="flex items-center justify-center min-h-[400px] bg-black/5 dark:bg-[#09101d] rounded-xl border border-black/5 dark:border-white/5 p-4">
            <pre className="mermaid">
              {sop.mermaid_code}
            </pre>
          </div>
        )}

        {activeTab === 'boost' && (
          <div className="prose dark:prose-invert prose-purple max-w-none">
            <ReactMarkdown>{sop.boost_strategy}</ReactMarkdown>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="border-t border-black/10 dark:border-white/10 p-4 flex items-center justify-between bg-black/5 dark:bg-black/20">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Generado automáticamente por SIKAI CX AI
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={copyToClipboard}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-gray-900 dark:text-white font-medium transition-colors border border-black/10 dark:border-white/10"
          >
            {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copiado' : 'Copiar Texto'}
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[#1a88ff] to-[#26d8c4] text-white font-bold transition-all shadow-[0_0_15px_rgba(26,136,255,0.4)] hover:shadow-[0_0_25px_rgba(38,216,196,0.6)]"
          >
            <Download className="w-4 h-4" /> Exportar PDF
          </button>
        </div>
      </div>
    </div>
  )
}
