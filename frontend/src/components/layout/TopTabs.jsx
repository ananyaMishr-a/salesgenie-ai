import { NavLink } from 'react-router-dom'
import { Users, Send, MessagesSquare, LayoutDashboard } from 'lucide-react'

const TABS = [
  { to: '/leads', label: 'Leads', icon: Users },
  { to: '/outreach', label: 'Outreach', icon: Send },
  { to: '/conversations', label: 'Conversations', icon: MessagesSquare },
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
]

export default function TopTabs() {
  return (
    <div className="flex items-center gap-1 border-b border-surface-border bg-white px-6">
      {TABS.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
              isActive
                ? 'border-brand text-brand-dark'
                : 'border-transparent text-ink-muted hover:text-ink'
            }`
          }
        >
          <Icon size={16} strokeWidth={2} />
          {label}
        </NavLink>
      ))}
    </div>
  )
}
