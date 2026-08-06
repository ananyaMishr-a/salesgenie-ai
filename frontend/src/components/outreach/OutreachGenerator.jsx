import { useState, useEffect } from 'react'
import { X, Sparkles, Copy, Check, LoaderCircle, RefreshCw } from 'lucide-react'
import DefaultEditor from 'react-simple-wysiwyg'

const TONES = ['Professional', 'Casual', 'Direct']

export default function OutreachGenerator({ lead, onClose, onGenerate, isLoading }) {
  const [tone, setTone] = useState(TONES[0])
  const [content, setContent] = useState('')
  const [subject, setSubject] = useState('')
  const [copied, setCopied] = useState(false)
  const [hasGenerated, setHasGenerated] = useState(false)

  const handleGenerate = async () => {
    try {
      const response = await onGenerate(lead.id, tone)
      if (response) {
        setSubject(response.email_subject || '')
        setContent(response.email_content || '')
        setHasGenerated(true)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleCopy = async () => {
    const textToCopy = `Subject: ${subject}\n\n${content}`
    try {
      await navigator.clipboard.writeText(textToCopy)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy text', err)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl animate-in slide-in-from-bottom-4 duration-300">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-surface-border px-6 py-4 bg-brand text-white">
          <div>
            <h1 className="text-lg font-semibold text-white">Generate Outreach</h1>
            <p className="text-sm text-white mt-0.5">
              Creating messaging for <span className="font-medium text-white">{lead.contactName || 'Unknown'}</span> at <span className="font-medium">{lead.company}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-ink-muted hover:bg-surface hover:text-ink transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">

          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-ink">Tone:</label>
              <div className="flex rounded-lg bg-surface-sunken p-1">
                {TONES.map(t => (
                  <button
                    key={t}
                    onClick={() => setTone(t)}
                    className={`rounded-md px-3 py-1.5 text-sm font-medium transition-all ${tone === t
                      ? 'bg-white text-brand shadow-sm ring-1 ring-black/5'
                      : 'text-ink-muted hover:text-ink'
                      }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={isLoading}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-dark focus:ring-2 focus:ring-brand/20 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
            >
              {isLoading ? (
                <LoaderCircle size={18} className="animate-spin" />
              ) : hasGenerated ? (
                <RefreshCw size={18} />
              ) : (
                <Sparkles size={18} />
              )}
              {hasGenerated ? 'Regenerate' : 'Generate Message'}
            </button>
          </div>

          {/* Editor Area */}
          <div className="relative min-h-[300px] rounded-xl border border-surface-border bg-white shadow-sm transition-all focus-within:border-brand focus-within:ring-1 focus-within:ring-brand">

            {isLoading && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-xl bg-white/80 backdrop-blur-sm">
                <LoaderCircle size={32} className="animate-spin text-brand mb-4" />
                <p className="text-sm font-medium text-brand">Crafting personalized message...</p>
              </div>
            )}

            {!hasGenerated && !isLoading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
                <div className="h-12 w-12 rounded-full bg-brand/10 flex items-center justify-center mb-4">
                  <Sparkles size={24} className="text-brand" />
                </div>
                <h3 className="text-lg font-medium text-ink">Ready to write</h3>
                <p className="text-sm text-ink-muted max-w-sm mt-2">
                  Select your preferred tone and click generate to let our AI craft a personalized outreach message based on {lead.company}'s intelligence data.
                </p>
              </div>
            )}

            {(hasGenerated || isLoading) && (
              <div className="flex flex-col h-full">
                <div className="border-b border-surface-border p-3 flex items-center gap-3">
                  <label className="text-sm font-medium text-ink-muted whitespace-nowrap">Subject:</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full bg-transparent text-sm font-medium text-ink outline-none"
                    placeholder="Email subject..."
                  />
                </div>
                <div className="flex-1 min-h-[300px]">
                  <div className="flex-1 h-full min-h-[300px] p-4">
                    <textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      className="w-full h-full min-h-[300px] resize-none outline-none text-sm font-mono text-ink bg-transparent"
                      placeholder="Email content..."
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-surface-border bg-surface/50 px-6 py-4">
          <p className="text-xs text-ink-muted flex items-center gap-1.5">
            <Sparkles size={14} className="text-brand" />
            AI-generated content can make mistakes. Consider reviewing before sending.
          </p>
          
          <div className="flex items-center gap-3">
            {hasGenerated && (
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-2 rounded-lg border border-surface-border bg-white px-4 py-2 text-sm font-medium text-ink hover:bg-surface hover:text-brand transition-all shadow-sm"
              >
                {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                {copied ? 'Copied!' : 'Copy to Clipboard'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
