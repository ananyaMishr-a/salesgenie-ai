import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { Eye, EyeOff, Sparkles, LoaderCircle, AlertCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import BrandPanel from '../components/auth/BrandPanel.jsx'

const DEMO_EMAIL = 'demo@salesgenie.ai'
const DEMO_PASSWORD = 'demo1234'

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const redirectTo = location.state?.from?.pathname ?? '/leads'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [touched, setTouched] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState('')

  const emailError =
    touched.email && !email ? 'Enter your email' : touched.email && !isValidEmail(email) ? 'Enter a valid email address' : ''
  const passwordError = touched.password && !password ? 'Enter your password' : ''

  const canSubmit = email && password && isValidEmail(email) && !isSubmitting

  async function handleSubmit(e) {
    e.preventDefault()
    setTouched({ email: true, password: true })
    setFormError('')

    if (!email || !password || !isValidEmail(email)) return

    setIsSubmitting(true)
    try {
      await login({ email, password })
      navigate(redirectTo, { replace: true })
    } catch (err) {
      setFormError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  function fillDemoCredentials() {
    setEmail(DEMO_EMAIL)
    setPassword(DEMO_PASSWORD)
    setFormError('')
  }

  return (
    <div className="flex min-h-screen">
      <BrandPanel />

      <div className="flex flex-1 items-center justify-center bg-white px-6 py-12">
        <div className="w-full max-w-sm">
          {/* Mobile-only brand mark, since BrandPanel is hidden below lg */}
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand">
              <Sparkles size={16} className="text-white" strokeWidth={2.5} />
            </div>
            <span className="text-base font-bold text-ink">SalesGenie AI</span>
          </div>

          <h2 className="text-2xl font-bold text-ink">Welcome back</h2>
          <p className="mt-1.5 text-sm text-ink-muted">
            Sign in to pick up where you left off with your pipeline.
          </p>

          {formError && (
            <div className="mt-5 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5">
              <AlertCircle size={16} className="mt-0.5 shrink-0 text-red-500" />
              <p className="text-sm text-red-700">{formError}</p>
            </div>
          )}

          <form className="mt-6 space-y-4" onSubmit={handleSubmit} noValidate>
            <div>
              <label htmlFor="email" className="text-sm font-medium text-ink">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                placeholder="you@company.com"
                className={`mt-1.5 w-full rounded-lg border px-3 py-2.5 text-sm text-ink outline-none placeholder:text-ink-faint focus:border-brand focus:ring-2 focus:ring-brand/20 ${
                  emailError ? 'border-red-300' : 'border-surface-border'
                }`}
              />
              {emailError && <p className="mt-1 text-xs text-red-600">{emailError}</p>}
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-sm font-medium text-ink">
                  Password
                </label>
                <Link to="/login" className="text-xs font-medium text-brand hover:text-brand-dark">
                  Forgot password?
                </Link>
              </div>
              <div className="relative mt-1.5">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                  placeholder="••••••••"
                  className={`w-full rounded-lg border px-3 py-2.5 pr-10 text-sm text-ink outline-none placeholder:text-ink-faint focus:border-brand focus:ring-2 focus:ring-brand/20 ${
                    passwordError ? 'border-red-300' : 'border-surface-border'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-faint hover:text-ink-muted"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {passwordError && <p className="mt-1 text-xs text-red-600">{passwordError}</p>}
            </div>

            <label className="flex items-center gap-2 text-sm text-ink-muted">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded border-surface-border text-brand focus:ring-brand/30"
              />
              Keep me signed in
            </label>

            <button
              type="submit"
              disabled={!canSubmit}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:bg-ink-faint"
            >
              {isSubmitting && <LoaderCircle size={16} className="animate-spin" />}
              {isSubmitting ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <div className="mt-6 rounded-lg bg-surface-sunken px-3 py-2.5">
            <p className="text-xs text-ink-muted">
              Demo access: <span className="font-medium text-ink">{DEMO_EMAIL}</span> /{' '}
              <span className="font-medium text-ink">{DEMO_PASSWORD}</span>
            </p>
            <button
              type="button"
              onClick={fillDemoCredentials}
              className="mt-1.5 text-xs font-semibold text-brand hover:text-brand-dark"
            >
              Fill demo credentials
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
