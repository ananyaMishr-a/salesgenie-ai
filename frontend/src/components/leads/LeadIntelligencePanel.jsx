import { TrendingUp, Cpu, UserCheck, Sparkle } from 'lucide-react'
import Badge from '../ui/Badge.jsx'
import ScoreRing from '../ui/ScoreRing.jsx'

const ICONS = [TrendingUp, Cpu, UserCheck]

export default function LeadIntelligencePanel({ lead }) {
  return (
    <div className="flex h-full flex-col rounded-xl border border-surface-border bg-white p-5 shadow-card">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-ink">Lead Intelligence</h3>
        <Badge variant="ai" className="flex items-center gap-1">
          <Sparkle size={12} />
          AI Powered
        </Badge>
      </div>

      <div className="mt-6 flex justify-center">
        <ScoreRing score={lead.qualificationScore} />
      </div>

      <div className="mt-6 flex-1 space-y-4 overflow-y-auto">
        {lead.insights.map((insight, idx) => {
          const Icon = ICONS[idx % ICONS.length]
          return (
            <div key={insight.label} className="rounded-lg bg-surface-sunken p-3">
              <div className="flex items-center gap-1.5 text-sm font-semibold text-ink">
                <Icon size={14} className="text-brand" />
                {insight.label}
              </div>
              <p className="mt-1 text-xs leading-relaxed text-ink-muted">{insight.detail}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
