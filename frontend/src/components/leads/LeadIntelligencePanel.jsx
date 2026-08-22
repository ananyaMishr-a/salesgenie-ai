import { useState } from 'react'
import { TrendingUp, Cpu, UserCheck, Sparkle, Sparkles, LoaderCircle, AlertCircle } from 'lucide-react'
import Badge from '../ui/Badge.jsx'
import ScoreRing from '../ui/ScoreRing.jsx'

const ICONS = [TrendingUp, Cpu, UserCheck]

/**
 * onAnalyze: async () => void — should call runLeadIntelligence(lead.id)
 * then refetch the lead so `lead.hasIntelligence`/`insights`/`qualificationScore`
 * reflect the new data. This component just triggers it and shows local
 * loading/error state around that call.
 */
export default function LeadIntelligencePanel({ lead, onAnalyze }) {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState('')

  async function handleAnalyzeClick() {
    setIsAnalyzing(true)
    setError('')
    try {
      await onAnalyze()
    } catch (err) {
      setError(err.message)
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="flex h-full flex-col rounded-xl border border-surface-border bg-white p-5 shadow-card">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-ink">Lead Intelligence</h3>
        <Badge variant="ai" className="flex items-center gap-1">
          <Sparkle size={12} />
          AI Powered
        </Badge>
      </div>

      {error && (
        <div className="mt-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5">
          <AlertCircle size={14} className="mt-0.5 shrink-0 text-red-500" />
          <p className="text-xs text-red-700">{error}</p>
        </div>
      )}

      {!lead.hasIntelligence ? (
        <div className="mt-6 flex flex-1 flex-col items-center justify-center gap-3 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand/10">
            <Sparkles size={20} className="text-brand" />
          </div>
          <div>
            <p className="text-sm font-semibold text-ink">No analysis yet</p>
            <p className="mt-1 text-xs text-ink-muted">
              Run AI analysis to get a qualification score and company insights for this lead.
            </p>
          </div>
          <button
            type="button"
            onClick={handleAnalyzeClick}
            disabled={isAnalyzing}
            className="mt-1 flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark disabled:cursor-not-allowed disabled:bg-ink-faint"
          >
            {isAnalyzing && <LoaderCircle size={14} className="animate-spin" />}
            {isAnalyzing ? 'Analyzing…' : 'Analyze with AI'}
          </button>
        </div>
      ) : (
        <>
          <div className="mt-6 flex justify-center">
            <ScoreRing score={lead.qualificationScore} />
          </div>

          <div className="mt-4 flex justify-center">
            <button
              type="button"
              onClick={handleAnalyzeClick}
              disabled={isAnalyzing}
              className="flex items-center gap-1.5 text-xs font-semibold text-brand hover:text-brand-dark disabled:cursor-not-allowed disabled:text-ink-faint"
            >
              {isAnalyzing && <LoaderCircle size={12} className="animate-spin" />}
              {isAnalyzing ? 'Re-analyzing…' : 'Re-analyze with AI'}
            </button>
          </div>

          <div className="mt-6 flex-1 space-y-4 overflow-y-auto">
            {(() => {
              const rawInsights = lead.insights;
              const insightsList = Array.isArray(rawInsights)
                ? rawInsights
                : rawInsights && typeof rawInsights === 'object'
                ? [
                    { label: 'Business Needs', detail: rawInsights.businessNeeds || rawInsights.business_needs },
                    { label: 'Opportunities', detail: rawInsights.opportunities },
                    { label: 'Industry Analysis', detail: rawInsights.industryAnalysis || rawInsights.industry_analysis }
                  ].filter(i => Boolean(i.detail))
                : rawInsights && typeof rawInsights === 'string'
                ? [{ label: 'AI Intelligence', detail: rawInsights }]
                : [];

              return insightsList.map((insight, idx) => {
                const Icon = ICONS[idx % ICONS.length]
                return (
                  <div key={insight.label || idx} className="rounded-lg bg-surface-sunken p-3">
                    <div className="flex items-center gap-1.5 text-sm font-semibold text-ink">
                      <Icon size={14} className="text-brand" />
                      {insight.label || 'Insight'}
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-ink-muted">{insight.detail}</p>
                  </div>
                )
              });
            })()}
          </div>
        </>
      )}
    </div>
  )
}
