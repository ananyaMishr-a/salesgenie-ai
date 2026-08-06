import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { LoaderCircle, AlertCircle } from 'lucide-react'
import MilestoneBanner from '../components/layout/MilestoneBanner.jsx'
import LeadListPanel from '../components/leads/LeadListPanel.jsx'
import LeadDetailPanel from '../components/leads/LeadDetailPanel.jsx'
import LeadIntelligencePanel from '../components/leads/LeadIntelligencePanel.jsx'
import LeadFormModal from '../components/leads/LeadFormModal.jsx'
import OutreachGenerator from '../components/outreach/OutreachGenerator.jsx'
import { useLeads } from '../hooks/useLeads.js'
import { useLead } from '../hooks/useLead.js'
import { useOutreach } from '../hooks/useOutreach.js'
import { createLead, updateLead, runLeadIntelligence } from '../api/leadsApi.js'

export default function LeadsPage() {
  const { leadId } = useParams()
  const navigate = useNavigate()

  const { leads, isLoading: isLoadingLeads, error: leadsError, refetch: refetchLeads } = useLeads()
  const {
    lead: selectedLead,
    isLoading: isLoadingLead,
    error: leadError,
    refetch: refetchLead,
  } = useLead(leadId)
  
  const { generateEmail, isLoading: isGeneratingEmail } = useOutreach()

  const [modalMode, setModalMode] = useState(null) // null | 'create' | 'edit'
  const [outreachModalLead, setOutreachModalLead] = useState(null)

  // Default to the first lead so the detail view is never empty on load
  useEffect(() => {
    if (!leadId && !isLoadingLeads && leads.length > 0) {
      navigate(`/leads/${leads[0].id}`, { replace: true })
    }
  }, [leadId, isLoadingLeads, leads, navigate])

  function handleSelectLead(id) {
    navigate(`/leads/${id}`)
  }

  async function handleSaveLead(values) {
    if (modalMode === 'edit' && selectedLead) {
      const updated = await updateLead(selectedLead.id, values)
      await Promise.all([refetchLeads(), refetchLead()])
      return updated
    }
    const created = await createLead(values)
    await refetchLeads()
    navigate(`/leads/${created.id}`)
    return created
  }

  async function handleAnalyzeLead() {
    // runLeadIntelligence persists the new insight+score to the backend;
    // refetching brings back the merged shape (hasIntelligence, etc.)
    // that leadsApi.mapLead/attachIntelligence already know how to build.
    await runLeadIntelligence(selectedLead.id)
    await refetchLead()
  }

  return (
    <div>
      <MilestoneBanner
        label="MILESTONE 1 · WEEKS 1–2"
        title="Lead Management & Intelligence Engine"
        subtitle="Prospect database and AI-powered company analysis"
      />

      {leadsError ? (
        <div className="px-6 pb-6">
          <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
            <AlertCircle size={18} />
            <p className="text-sm">Couldn't load prospects: {leadsError}</p>
          </div>
        </div>
      ) : isLoadingLeads ? (
        <div className="flex items-center justify-center gap-2 px-6 pb-6 pt-16 text-ink-muted">
          <LoaderCircle size={18} className="animate-spin" />
          <span className="text-sm">Loading prospects…</span>
        </div>
      ) : leads.length === 0 ? (
        <div className="px-6 pb-6">
          <div className="rounded-xl border border-dashed border-surface-border bg-white p-10 text-center">
            <p className="text-sm font-medium text-ink">No prospects yet</p>
            <p className="mt-1 text-sm text-ink-muted">
              Add your first lead to see company analysis and AI intelligence here.
            </p>
            <button
              type="button"
              onClick={() => setModalMode('create')}
              className="mt-4 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark"
            >
              Add lead
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 px-6 pb-6 lg:grid-cols-[280px_1fr_320px]">
          <div className="h-[calc(100vh-220px)]">
            <LeadListPanel
              leads={leads}
              selectedLeadId={selectedLead?.id}
              onSelectLead={handleSelectLead}
              onAddLead={() => setModalMode('create')}
            />
          </div>

          {leadError ? (
            <div className="col-span-2 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
              <AlertCircle size={18} />
              <p className="text-sm">Couldn't load this lead: {leadError}</p>
            </div>
          ) : isLoadingLead || !selectedLead ? (
            <div className="col-span-2 flex h-[calc(100vh-220px)] items-center justify-center gap-2 rounded-xl border border-surface-border bg-white text-ink-muted">
              <LoaderCircle size={18} className="animate-spin" />
              <span className="text-sm">Loading lead details…</span>
            </div>
          ) : (
            <>
              <div className="h-[calc(100vh-220px)]">
                <LeadDetailPanel 
                  lead={selectedLead} 
                  onEdit={() => setModalMode('edit')} 
                  onGenerateOutreach={() => setOutreachModalLead(selectedLead)}
                />
              </div>
              <div className="h-[calc(100vh-220px)]">
                <LeadIntelligencePanel
                  key={selectedLead.id}
                  lead={selectedLead}
                  onAnalyze={handleAnalyzeLead}
                />
              </div>
            </>
          )}
        </div>
      )}

      {modalMode && (
        <LeadFormModal
          mode={modalMode}
          lead={modalMode === 'edit' ? selectedLead : null}
          onClose={() => setModalMode(null)}
          onSave={handleSaveLead}
        />
      )}

      {outreachModalLead && (
        <OutreachGenerator
          lead={outreachModalLead}
          onClose={() => setOutreachModalLead(null)}
          onGenerate={generateEmail}
          isLoading={isGeneratingEmail}
        />
      )}
    </div>
  )
}
