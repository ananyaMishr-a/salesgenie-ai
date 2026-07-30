import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Eye, EyeOff, Sparkles, LoaderCircle, AlertCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import BrandPanel from '../components/auth/BrandPanel.jsx'

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export default function SignupPage() {
  const { signup } = useAuth()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [touched, setTouched] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState('')

  const nameError = touched.name && !name.trim() ? 'Enter your name' : ''
  const emailError =
    touched.email && !email
      ? 'Enter your email'
      : touched.email && !isValidEmail(email)
        ? 'Enter a valid email address'
        : ''
  const passwordError =
    touched.password && !password
      ? 'Enter a password'
      : touched.password && password.length < 8
        ? 'Password must be at least 8 characters'
        : ''

  const canSubmit = name.trim() && email && password.length >= 8 && isValidEmail(email) && !isSubmitting

  async function handleSubmit(e) {
    e.preventDefault()
    setTouched({ name: true, email: true, password: true })
    setFormError('')

    if (!name.trim() || !email || !isValidEmail(email) || password.length < 8) return

    setIsSubmitting(true)
    try {
      await signup({ name, email, password })
      navigate('/leads', { replace: true })
    } catch (err) {
      setFormError(err.message)
    } finally {
      setIsSubmitting(false)
    }
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

          <h2 className="text-2xl font-bold text-ink">Create your account</h2>
          <p className="mt-1.5 text-sm text-ink-muted">
            Start tracking prospects and generating AI-powered outreach.
          </p>

          {formError && (
            <div className="mt-5 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5">
              <AlertCircle size={16} className="mt-0.5 shrink-0 text-red-500" />
              <p className="text-sm text-red-700">{formError}</p>
            </div>
          )}

          <form className="mt-6 space-y-4" onSubmit={handleSubmit} noValidate>
            <div>
              <label htmlFor="name" className="text-sm font-medium text-ink">
                Name
              </label>
              <input
                id="name"
                type="text"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, name: true }))}
                placeholder="Alex Rivera"
                className={`mt-1.5 w-full rounded-lg border px-3 py-2.5 text-sm text-ink outline-none placeholder:text-ink-faint focus:border-brand focus:ring-2 focus:ring-brand/20 ${
                  nameError ? 'border-red-300' : 'border-surface-border'
                }`}
              />
              {nameError && <p className="mt-1 text-xs text-red-600">{nameError}</p>}
            </div>

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
              <label htmlFor="password" className="text-sm font-medium text-ink">
                Password
              </label>
              <div className="relative mt-1.5">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                  placeholder="At least 8 characters"
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

            <button
              type="submit"
              disabled={!canSubmit}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:bg-ink-faint"
            >
              {isSubmitting && <LoaderCircle size={16} className="animate-spin" />}
              {isSubmitting ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-ink-muted">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-brand hover:text-brand-dark">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
