import { useEffect } from 'react'
import { Clock, MessageSquareShare, FileText, LoaderCircle, AlertCircle } from 'lucide-react'

export default function OutreachStrategyPanel({ lead, strategy, isGeneratingStrategy, generateStrategy }) {
  // Automatically fetch strategy if not available
  useEffect(() => {
    if (lead?.hasIntelligence && !strategy && !isGeneratingStrategy) {
      generateStrategy(lead.id)
    }
  }, [lead, strategy, isGeneratingStrategy, generateStrategy])

  if (!lead.hasIntelligence) {
    return (
      <div className="flex h-full flex-col overflow-hidden rounded-xl bg-white shadow-card border border-surface-border p-5 items-center justify-center text-center">
        <FileText size={32} className="text-surface-border mb-4" />
        <h3 className="text-sm font-bold text-ink">Strategy Unavailable</h3>
        <p className="mt-1 max-w-[200px] text-xs text-ink-muted">
          Run AI analysis first to generate outreach recommendations.
        </p>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl bg-white shadow-card border border-surface-border">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-surface-border px-5 py-4">
        <h3 className="text-sm font-bold text-ink">Outreach Strategy</h3>
      </div>

      <div className="flex flex-1 flex-col overflow-y-auto p-5 gap-4 bg-[#F8FAFC]">
        {isGeneratingStrategy ? (
          <div className="flex flex-1 flex-col items-center justify-center text-ink-muted gap-3">
            <LoaderCircle size={24} className="animate-spin text-brand" />
            <span className="text-xs font-semibold">Generating AI strategy...</span>
          </div>
        ) : !strategy ? (
          <div className="flex flex-1 items-center justify-center">
            <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
              <AlertCircle size={16} />
              <p className="text-xs font-semibold">Failed to load strategy.</p>
            </div>
          </div>
        ) : (
          <>
            {/* Follow-up Timing */}
            {strategy.follow_up_timing && (
              <div className="rounded-xl border border-surface-border bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-bold text-ink">Follow-up Timing</h4>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    strategy.follow_up_timing.priority === 'High' ? 'bg-red-50 text-red-600' : 
                    strategy.follow_up_timing.priority === 'Medium' ? 'bg-yellow-50 text-yellow-600' : 'bg-green-50 text-green-600'
                  }`}>
                    {strategy.follow_up_timing.priority}
                  </span>
                </div>
                <p className="text-xs text-ink-muted leading-relaxed mb-3">
                  {strategy.follow_up_timing.description}
                </p>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-ink-muted border-t border-surface-border pt-3">
                  <Clock size={12} />
                  {strategy.follow_up_timing.footer_text}
                </div>
              </div>
            )}

            {/* Channel Mix */}
            {strategy.channel_mix && (
              <div className="rounded-xl border border-surface-border bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-bold text-ink">Channel Mix</h4>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    strategy.channel_mix.priority === 'High' ? 'bg-red-50 text-red-600' : 
                    strategy.channel_mix.priority === 'Medium' ? 'bg-yellow-50 text-yellow-600' : 'bg-green-50 text-green-600'
                  }`}>
                    {strategy.channel_mix.priority}
                  </span>
                </div>
                <p className="text-xs text-ink-muted leading-relaxed mb-3">
                  {strategy.channel_mix.description}
                </p>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-ink-muted border-t border-surface-border pt-3">
                  <MessageSquareShare size={12} />
                  {strategy.channel_mix.footer_text}
                </div>
              </div>
            )}

            {/* Content Strategy */}
            {strategy.content_strategy && (
              <div className="rounded-xl border border-surface-border bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-bold text-ink">Content Strategy</h4>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    strategy.content_strategy.priority === 'High' ? 'bg-red-50 text-red-600' : 
                    strategy.content_strategy.priority === 'Medium' ? 'bg-yellow-50 text-yellow-600' : 'bg-green-50 text-green-600'
                  }`}>
                    {strategy.content_strategy.priority}
                  </span>
                </div>
                <p className="text-xs text-ink-muted leading-relaxed mb-3">
                  {strategy.content_strategy.description}
                </p>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-ink-muted border-t border-surface-border pt-3">
                  <FileText size={12} />
                  {strategy.content_strategy.footer_text}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
