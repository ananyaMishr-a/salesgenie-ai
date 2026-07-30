export default function LeadListItem({ lead, isActive, onSelect }) {
  return (
    <button
      onClick={() => onSelect(lead.id)}
      className={`w-full rounded-lg px-3 py-3 text-left transition-colors ${
        isActive ? 'bg-brand-soft' : 'hover:bg-surface-sunken'
      }`}
    >
      <p className={`text-sm font-semibold ${isActive ? 'text-brand-dark' : 'text-ink'}`}>
        {lead.company}
      </p>
      <p className="mt-0.5 text-xs text-ink-muted">
        {lead.contactName}, {lead.contactTitle}
      </p>
      <div className="mt-1.5 flex items-center gap-2 text-xs text-ink-faint">
        <span>{lead.segment}</span>
        <span aria-hidden="true">·</span>
        <span>{lead.lastActivity}</span>
      </div>
    </button>
  )
}
