import { Sparkle, TrendingUp, Building2, Cpu, CheckCircle } from 'lucide-react'
import ScoreRing from '../ui/ScoreRing.jsx'

export default function LeadScorePanel({ lead }) {
  if (!lead.hasIntelligence) {
    return (
      <div className="flex h-full flex-col overflow-hidden rounded-xl bg-white shadow-card border border-surface-border p-5 items-center justify-center text-center">
        <Sparkle size={32} className="text-surface-border mb-4" />
        <h3 className="text-sm font-bold text-ink">Score Unavailable</h3>
        <p className="mt-1 max-w-[200px] text-xs text-ink-muted">
          Run AI analysis first to unlock lead scoring and insights.
        </p>
      </div>
    )
  }

  const score = lead.qualificationScore || 0
  const probability = lead.conversionProbability || 0
  const factors = lead.scoringFactors || {}

  const factorItems = [
    { label: 'Company Size', value: factors.company_size, icon: Building2 },
    { label: 'Funding Stage', value: factors.funding_stage, icon: TrendingUp },
    { label: 'Annual Revenue', value: factors.annual_revenue, icon: CheckCircle },
    { label: 'Tech Stack Match', value: factors.technology_fit, icon: Cpu },
  ].filter(f => f.value !== undefined && f.value > 0)

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl bg-white shadow-card border border-surface-border">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-surface-border px-5 py-4">
        <h3 className="text-sm font-bold text-ink">Lead Score</h3>
        <span className="flex items-center gap-1 rounded bg-brand/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand">
          <Sparkle size={10} />
          AI Powered
        </span>
      </div>

      <div className="flex flex-1 flex-col overflow-y-auto p-6">
        {/* Ring Chart Section */}
        <div className="flex flex-col items-center pb-6">
          <ScoreRing score={score} size={140} label={lead.priorityLevel === 'High' ? 'Highly Qualified Lead' : `${lead.priorityLevel} Priority Lead`} />
        </div>

        {/* Progress Bar Section */}
        <div className="mb-8">
          <div className="mb-2 flex items-center justify-between text-xs font-semibold">
            <span className="text-ink-muted">Conversion Probability</span>
            <span className="text-ink">{probability}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-surface-border">
            <div
              className="h-full rounded-full bg-[#1FA971] transition-all duration-1000"
              style={{ width: `${probability}%` }}
            />
          </div>
        </div>

        {/* Factors Section */}
        <div>
          <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-ink-faint">Scoring Factors</h4>
          <div className="flex flex-col gap-3">
            {factorItems.map((factor, i) => {
              const Icon = factor.icon
              return (
                <div key={i} className="flex items-start gap-3 rounded-lg border border-surface-border bg-surface-sunken p-3">
                  <div className="rounded bg-brand/10 p-1.5 text-brand">
                    <Icon size={14} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-ink">{factor.label}</p>
                    <p className="text-xs font-medium text-green-600">+{factor.value} points</p>
                  </div>
                </div>
              )
            })}
            
            {factorItems.length === 0 && (
              <p className="text-xs text-ink-muted italic">No positive scoring factors identified.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
