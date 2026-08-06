import { useState } from 'react'
import { Sparkles, Copy, Check, LoaderCircle, RefreshCw } from 'lucide-react'

const TONES = ['Professional', 'Casual', 'Direct']

export default function OutreachEmailPanel({ lead, onGenerate, isLoading }) {
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
    <div className="flex h-full flex-col overflow-hidden rounded-xl bg-white shadow-card border border-surface-border">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-surface-border px-5 py-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-ink">AI Email Generator</h3>
            <span className="flex items-center gap-1 rounded bg-brand/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand">
              <Sparkles size={10} />
              AI Powered
            </span>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col overflow-y-auto p-5">
        <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-center gap-3">
            <label className="text-xs font-semibold uppercase tracking-wide text-ink-faint">Tone</label>
            <div className="flex rounded-lg bg-surface-sunken p-1">
              {TONES.map(t => (
                <button
                  key={t}
                  onClick={() => setTone(t)}
                  className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${tone === t
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
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-brand-dark focus:ring-2 focus:ring-brand/20 disabled:cursor-not-allowed disabled:opacity-70 transition-all"
          >
            {isLoading ? (
              <LoaderCircle size={14} className="animate-spin" />
            ) : hasGenerated ? (
              <RefreshCw size={14} />
            ) : (
              <Sparkles size={14} />
            )}
            {hasGenerated ? 'Regenerate' : 'Generate'}
          </button>
        </div>

        {/* Editor Area */}
        <div className="relative flex min-h-[350px] flex-1 flex-col rounded-xl border border-surface-border bg-white shadow-sm transition-all focus-within:border-brand focus-within:ring-1 focus-within:ring-brand">
          {isLoading && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-xl bg-white/80 backdrop-blur-sm">
              <LoaderCircle size={28} className="mb-3 animate-spin text-brand" />
              <p className="text-xs font-bold text-brand">Crafting personalized message...</p>
            </div>
          )}

          {!hasGenerated && !isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-brand/10">
                <Sparkles size={20} className="text-brand" />
              </div>
              <h3 className="text-sm font-bold text-ink">Ready to write</h3>
              <p className="mx-auto mt-1 max-w-[250px] text-xs text-ink-muted">
                Select your preferred tone and click generate to let our AI craft a personalized outreach message based on {lead.company}'s data.
              </p>
            </div>
          )}

          {(hasGenerated || isLoading) && (
            <div className="flex h-full flex-col">
              <div className="flex items-center gap-3 border-b border-surface-border p-3">
                <label className="whitespace-nowrap text-xs font-semibold text-ink-muted">To:</label>
                <input
                  type="text"
                  value={lead.contactEmail || `${lead.contactName?.toLowerCase().replace(/\s+/g, '.')}@${lead.company?.toLowerCase().replace(/\s+/g, '')}.com`}
                  readOnly
                  className="w-full bg-transparent text-xs font-medium text-ink outline-none"
                />
              </div>
              <div className="flex items-center gap-3 border-b border-surface-border p-3">
                <label className="whitespace-nowrap text-xs font-semibold text-ink-muted">Subject:</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-transparent text-xs font-bold text-ink outline-none"
                  placeholder="Email subject..."
                />
              </div>
              <div className="flex-1 p-4">
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="h-full w-full resize-none bg-transparent text-sm text-ink outline-none leading-relaxed"
                  placeholder="Email content..."
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-surface-border bg-surface-sunken px-5 py-3">
        <p className="flex items-center gap-1.5 text-[11px] font-medium text-ink-muted">
          <Sparkles size={12} className="text-brand" />
          AI-generated content can make mistakes.
        </p>
        
        {hasGenerated && (
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 rounded-lg border border-surface-border bg-white px-3 py-1.5 text-xs font-bold text-ink shadow-sm transition-all hover:bg-surface hover:text-brand"
          >
            {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        )}
      </div>
    </div>
  )
}
