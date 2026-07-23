import { Sparkles, TrendingUp, Users } from 'lucide-react'

export default function BrandPanel() {
  return (
    <div className="relative hidden h-full flex-col justify-between overflow-hidden bg-surface p-10 lg:flex lg:w-[46%]">
      {/* Ambient glow, purely decorative */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-brand/20 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-32 -right-16 h-80 w-80 rounded-full bg-accent-purple/20 blur-3xl"
      />

      <div className="relative flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand">
          <Sparkles size={18} className="text-white" strokeWidth={2.5} />
        </div>
        <span className="text-lg font-bold text-white">SalesGenie AI</span>
      </div>

      <div className="relative">
        <h1 className="max-w-md text-3xl font-bold leading-tight text-white">
          Know which leads are worth your next hour.
        </h1>
        <p className="mt-3 max-w-sm text-sm text-white/60">
          AI-scored prospects, personalized outreach, and conversation intelligence — in one
          sales workspace.
        </p>

        {/* Live-feeling lead card preview */}
        <div className="mt-8 w-full max-w-sm rounded-xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-white">TechCorp Solutions</p>
              <p className="text-xs text-white/50">Sarah Johnson, CTO</p>
            </div>
            <span className="flex items-center gap-1 rounded-full bg-accent-purple/20 px-2 py-1 text-[11px] font-semibold text-accent-purple">
              <Sparkles size={11} />
              AI Powered
            </span>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <div className="relative flex h-14 w-14 items-center justify-center">
              <svg width="56" height="56" className="-rotate-90">
                <circle cx="28" cy="28" r="24" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="5" />
                <circle
                  cx="28"
                  cy="28"
                  r="24"
                  fill="none"
                  stroke="#1FA971"
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 24}
                  strokeDashoffset={2 * Math.PI * 24 * (1 - 0.92)}
                />
              </svg>
              <span className="absolute text-sm font-bold text-white">92</span>
            </div>
            <div>
              <p className="text-xs font-semibold text-white">Highly Qualified</p>
              <p className="text-[11px] text-white/50">Series C · rapid growth signal</p>
            </div>
          </div>
        </div>
      </div>

      <div className="relative flex items-center gap-6 text-white/50">
        <div className="flex items-center gap-1.5 text-xs">
          <TrendingUp size={14} />
          24.8% conversion rate
        </div>
        <div className="flex items-center gap-1.5 text-xs">
          <Users size={14} />
          Built for sales teams
        </div>
      </div>
    </div>
  )
}
