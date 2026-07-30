export default function MilestoneBanner({ label, title, subtitle }) {
  return (
    <div className="px-6 pt-6 pb-4">
      <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-soft px-3 py-1 text-xs font-semibold tracking-wide text-brand-dark">
        {label}
      </span>
      <h1 className="mt-3 text-2xl font-bold text-ink">{title}</h1>
      {subtitle && <p className="mt-1 text-sm text-ink-muted">{subtitle}</p>}
    </div>
  )
}
