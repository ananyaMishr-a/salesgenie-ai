import { useState, useMemo } from 'react'
import { Search, Plus } from 'lucide-react'
import LeadListItem from './LeadListItem.jsx'

export default function LeadListPanel({ leads, selectedLeadId, onSelectLead, onAddLead }) {
  const [query, setQuery] = useState('')

  const filteredLeads = useMemo(() => {
    if (!query.trim()) return leads
    const q = query.toLowerCase()
    return leads.filter(
      (lead) =>
        lead.company.toLowerCase().includes(q) || lead.contactName.toLowerCase().includes(q)
    )
  }, [leads, query])

  return (
    <div className="flex h-full flex-col rounded-xl border border-surface-border bg-white shadow-card">
      <div className="space-y-2 border-b border-surface-border p-3">
        <div className="flex items-center gap-2 rounded-lg bg-surface-sunken px-3 py-2">
          <Search size={16} className="text-ink-faint" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search prospects..."
            className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-ink-faint"
          />
        </div>
        <button
          type="button"
          onClick={onAddLead}
          className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-brand py-2 text-sm font-semibold text-white hover:bg-brand-dark"
        >
          <Plus size={15} />
          Add lead
        </button>
      </div>

      <div className="flex-1 space-y-1 overflow-y-auto p-2">
        {filteredLeads.length === 0 ? (
          <p className="p-4 text-sm text-ink-muted">
            No prospects match "{query}". Try a different search.
          </p>
        ) : (
          filteredLeads.map((lead) => (
            <LeadListItem
              key={lead.id}
              lead={lead}
              isActive={lead.id === selectedLeadId}
              onSelect={onSelectLead}
            />
          ))
        )}
      </div>
    </div>
  )
}
