const VARIANTS = {
  neutral: 'bg-surface-sunken text-ink-muted',
  ai: 'bg-accent-purple/10 text-accent-purple',
  segment: 'bg-brand-soft text-brand-dark',
}

export default function Badge({ children, variant = 'neutral', className = '' }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${VARIANTS[variant]} ${className}`}
    >
      {children}
    </span>
  )
}
