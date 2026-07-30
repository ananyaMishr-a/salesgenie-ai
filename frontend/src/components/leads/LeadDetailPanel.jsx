import { Pencil, Send } from 'lucide-react'
import Badge from '../ui/Badge.jsx'

function Field({ label, value }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-ink-faint">{label}</p>
      <p className="mt-1 text-sm font-medium text-ink">{value}</p>
    </div>
  )
}

export default function LeadDetailPanel({ lead, onEdit }) {
  return (
    <div className="flex h-full flex-col rounded-xl border border-surface-border bg-white p-5 shadow-card">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-bold text-ink">{lead.company}</h2>
          <p className="mt-0.5 text-sm text-ink-muted">
            {lead.industry} · {lead.fundingStage}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onEdit}
            className="flex items-center gap-1.5 rounded-lg border border-surface-border px-3 py-1.5 text-sm font-medium text-ink hover:bg-surface-sunken"
          >
            <Pencil size={14} />
            Edit
          </button>
          <button className="flex items-center gap-1.5 rounded-lg bg-brand px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-dark">
            <Send size={14} />
            Outreach
          </button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-x-6 gap-y-5">
        <Field label="Company Size" value={lead.companySize} />
        <Field label="Annual Revenue" value={lead.annualRevenue} />
        <Field label="Location" value={lead.location} />
        <Field label="Funding Stage" value={`${lead.fundingStage} · ${lead.fundingAmount}`} />
      </div>

      <div className="mt-6">
        <p className="text-xs font-medium uppercase tracking-wide text-ink-faint">
          Technology Stack
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {lead.techStack.map((tech) => (
            <Badge key={tech}>{tech}</Badge>
          ))}
        </div>
      </div>

      <div className="mt-6 border-t border-surface-border pt-4">
        <p className="text-xs font-medium uppercase tracking-wide text-ink-faint">
          Primary Contact
        </p>
        <p className="mt-1 text-sm font-medium text-ink">
          {lead.contactName} <span className="font-normal text-ink-muted">— {lead.contactTitle}</span>
        </p>
      </div>
    </div>
  )
}
