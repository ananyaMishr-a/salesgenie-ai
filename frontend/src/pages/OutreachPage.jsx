
import { useState } from 'react'
import { LoaderCircle, AlertCircle, Sparkles, ChevronLeft } from 'lucide-react'
import MilestoneBanner from '../components/layout/MilestoneBanner.jsx'
import LeadDashboard from '../components/outreach/LeadDashboard.jsx'
import OutreachEmailPanel from '../components/outreach/OutreachEmailPanel.jsx'
import LeadScorePanel from '../components/outreach/LeadScorePanel.jsx'
import OutreachStrategyPanel from '../components/outreach/OutreachStrategyPanel.jsx'
import { useLeads } from '../hooks/useLeads.js'
import { useLead } from '../hooks/useLead.js'
import { useOutreach } from '../hooks/useOutreach.js'

export default function OutreachPage() {
  const { leads, isLoading: isLoadingLeads, error: leadsError } = useLeads()
  
  const [selectedLeadId, setSelectedLeadId] = useState(null)
  
  const { lead: fullLead, isLoading: isLoadingFullLead } = useLead(selectedLeadId)
  
  const { generateEmail, isLoading: isGeneratingEmail, strategy, isGeneratingStrategy, generateStrategy } = useOutreach()

  const handleGenerateOutreach = (lead) => {
    setSelectedLeadId(lead.id)
  }

  const handleBack = () => {
    setSelectedLeadId(null)
  }

  return (
    <div className="flex h-full flex-col">
      <MilestoneBanner
        label="MILESTONE 2 · WEEKS 3–4"
        title="Outreach Generation & Lead Scoring"
        subtitle="Personalized email creation and AI-powered lead qualification"
        icon={<Sparkles size={20} className="text-white" />}
      />

      <div className="flex-1 p-6 h-[calc(100vh-140px)]">
        {selectedLeadId ? (
          <div className="flex h-full flex-col">
            <div className="mb-4 flex items-center">
              <button 
                onClick={handleBack}
                className="flex items-center gap-1.5 text-sm font-semibold text-ink-muted hover:text-ink transition-colors"
              >
                <ChevronLeft size={16} />
                Back to Leads
              </button>
            </div>
            
            {isLoadingFullLead || !fullLead ? (
              <div className="flex items-center justify-center h-full gap-2 text-ink-muted bg-white rounded-xl border border-surface-border">
                <LoaderCircle size={18} className="animate-spin" />
                <span className="text-sm">Loading full lead profile...</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr_1fr] gap-4 h-[calc(100%-40px)]">
                {/* Column 1: AI Email Generator */}
                <div className="h-full">
                  <OutreachEmailPanel 
                    lead={fullLead} 
                    onGenerate={generateEmail} 
                    isLoading={isGeneratingEmail} 
                  />
                </div>
                
                {/* Column 2: Lead Score */}
                <div className="h-full">
                  <LeadScorePanel lead={fullLead} />
                </div>
                
                {/* Column 3: Outreach Strategy */}
                <div className="h-full">
                  <OutreachStrategyPanel 
                    lead={fullLead} 
                    strategy={strategy} 
                    isGeneratingStrategy={isGeneratingStrategy} 
                    generateStrategy={generateStrategy} 
                  />
                </div>
              </div>
            )}
          </div>
        ) : (
          /* List View */
          <>
            {leadsError ? (
              <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
                <AlertCircle size={18} />
                <p className="text-sm">Couldn't load prospects: {leadsError}</p>
              </div>
            ) : isLoadingLeads ? (
              <div className="flex items-center justify-center h-full gap-2 text-ink-muted">
                <LoaderCircle size={18} className="animate-spin" />
                <span className="text-sm">Loading prospects…</span>
              </div>
            ) : leads.length === 0 ? (
              <div className="rounded-xl border border-dashed border-surface-border bg-white p-10 text-center h-full flex flex-col items-center justify-center">
                <p className="text-sm font-medium text-ink">No prospects yet</p>
                <p className="mt-1 text-sm text-ink-muted max-w-sm">
                  Head over to the Leads tab to add your first prospect before generating outreach messaging.
                </p>
              </div>
            ) : (
              <LeadDashboard 
                leads={leads} 
                onGenerateOutreach={handleGenerateOutreach} 
              />
            )}
          </>
        )}
      </div>
    </div>
  )
}
