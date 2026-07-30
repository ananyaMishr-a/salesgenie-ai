import { Construction } from 'lucide-react'

export default function ComingSoonPage({ title, milestone }) {
  return (
    <div className="px-6 pt-6">
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-surface-border bg-white p-16 text-center">
        <Construction size={28} className="text-ink-faint" />
        <h2 className="mt-3 text-base font-semibold text-ink">{title} is coming in {milestone}</h2>
        <p className="mt-1 text-sm text-ink-muted">
          This tab is wired up in routing now so navigation works end-to-end. The screen itself
          gets built in that milestone's sprint.
        </p>
      </div>
    </div>
  )
}
