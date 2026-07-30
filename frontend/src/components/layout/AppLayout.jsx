import { Outlet, useNavigate } from 'react-router-dom'
import { Sparkles, LogOut } from 'lucide-react'
import TopTabs from './TopTabs.jsx'
import { useAuth } from '../../context/AuthContext.jsx'

export default function AppLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-surface-sunken">
      {/* Global header */}
      <header className="flex items-center justify-between bg-surface px-6 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand">
            <Sparkles size={16} className="text-white" strokeWidth={2.5} />
          </div>
          <span className="text-base font-bold text-white">SalesGenie AI</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/80">
            Milestone 1 · Weeks 1–2
          </span>
          <div className="flex items-center gap-2">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-full bg-brand/80 text-xs font-semibold text-white"
              title={user?.name}
            >
              {user?.name?.[0] ?? 'U'}
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium text-white/70 hover:bg-white/10 hover:text-white"
              title="Sign out"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </header>

      {/* Module tabs */}
      <TopTabs />

      {/* Routed page content */}
      <main>
        <Outlet />
      </main>
    </div>
  )
}
