import { Sparkles, TrendingUp, Users } from 'lucide-react'

export default function BrandPanel() {
  return (
    <div 
      className="relative hidden lg:flex flex-col justify-between overflow-hidden p-8 lg:p-12 min-h-screen h-screen select-none border-r border-slate-800/30"
      style={{ background: 'linear-gradient(135deg, #0B1220 0%, #0F1A2E 100%)' }}
    >
      {/* Decorative ambient background glows */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 -top-24 h-96 w-96 rounded-full bg-blue-600/15 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 -right-20 h-96 w-96 rounded-full bg-purple-600/15 blur-3xl"
      />

      {/* Top Left Fixed Branding Logo */}
      <div className="relative z-10 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg shadow-blue-500/25 shrink-0">
          <Sparkles size={20} className="text-white" strokeWidth={2.5} />
        </div>
        <span className="text-xl font-bold tracking-tight text-white">SalesGenie AI</span>
      </div>

      {/* Vertically Centered Main Hero Content Group */}
      <div className="my-auto py-8 w-full max-w-[650px] mx-auto flex flex-col justify-center items-start">
        
        {/* Main Heading - Refined, sleek font weight */}
        <h1 
          className="text-white font-semibold tracking-tight w-full max-w-[650px] mb-5 text-left"
          style={{
            fontSize: 'clamp(2.25rem, 3.2vw, 3.5rem)',
            lineHeight: 1.12,
            letterSpacing: '-0.025em',
            wordBreak: 'normal',
            overflowWrap: 'normal'
          }}
        >
          <span className="block whitespace-nowrap">Know which leads are</span>
          <span className="block whitespace-nowrap">worth your next hour.</span>
        </h1>

        {/* Hero Description */}
        <p 
          className="text-slate-300/85 text-base lg:text-[16px] font-normal w-full max-w-[560px] mb-8 leading-relaxed text-left"
        >
          AI-scored prospects, personalized outreach, and conversation intelligence — all in one intelligent sales workspace.
        </p>

        {/* Polished Product UI Lead Intelligence Preview Card */}
        <div className="w-full max-w-[540px] rounded-2xl border border-white/15 bg-white/[0.06] p-6 backdrop-blur-md shadow-2xl transition-transform hover:scale-[1.01]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-base font-bold text-white">TechCorp Solutions</p>
              <p className="text-xs text-slate-400 font-medium mt-0.5">Sarah Johnson · CTO</p>
            </div>
            <span className="flex items-center gap-1.5 rounded-full bg-purple-500/20 px-3 py-1 text-xs font-bold text-purple-300 border border-purple-400/30">
              <Sparkles size={12} />
              AI Powered
            </span>
          </div>

          <div className="mt-5 flex items-center gap-4 border-t border-white/10 pt-4">
            <div className="relative flex h-14 w-14 items-center justify-center shrink-0">
              <svg width="56" height="56" className="-rotate-90">
                <circle cx="28" cy="28" r="24" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="5" />
                <circle
                  cx="28"
                  cy="28"
                  r="24"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 24}
                  strokeDashoffset={2 * Math.PI * 24 * (1 - 0.92)}
                />
              </svg>
              <span className="absolute text-sm font-bold text-white">92</span>
            </div>
            <div>
              <p className="text-sm font-bold text-emerald-400">Highly Qualified</p>
              <p className="text-xs text-slate-300 font-medium mt-0.5">Series C · Rapid growth signal</p>
              <p className="text-xs text-blue-300 font-semibold mt-1.5 flex items-center gap-1">
                <TrendingUp size={13} className="text-emerald-400" /> ↗ 24.8% conversion potential
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Metrics Footer */}
      <div className="relative flex items-center gap-8 text-slate-400 border-t border-white/10 pt-4 shrink-0">
        <div className="flex items-center gap-2 text-xs font-medium">
          <TrendingUp size={15} className="text-emerald-400" />
          24.8% conversion rate
        </div>
        <div className="flex items-center gap-2 text-xs font-medium">
          <Users size={15} className="text-blue-400" />
          Built for sales teams
        </div>
      </div>
    </div>
  )
}
