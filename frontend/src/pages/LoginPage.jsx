import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { Eye, EyeOff, Sparkles, LoaderCircle, AlertCircle, ArrowRight } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import BrandPanel from '../components/auth/BrandPanel.jsx'

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
  const [touched, setTouched] = useState({ email: false, password: false })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState('')

  // Validation logic - only triggers when field has been touched by user
  const emailError =
    touched.email && !email.trim()
      ? 'Enter your email'
      : touched.email && !isValidEmail(email)
      ? 'Enter a valid email address'
      : ''

  const passwordError = touched.password && !password ? 'Enter your password' : ''

  const canSubmit = email.trim() && password && isValidEmail(email) && !isSubmitting

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
      setFormError(err.message || 'Invalid email or password. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen lg:h-screen w-full bg-white font-sans overflow-hidden">
      {/* 50% Left Branding Panel */}
      <BrandPanel />

      {/* 50% Right Login Panel */}
      <div className="flex lg:w-1/2 flex-1 flex-col items-center justify-center p-6 sm:p-12 lg:p-16 bg-white overflow-y-auto">
        <div className="w-full max-w-[460px] mx-auto my-auto p-4 sm:p-8 lg:p-12">
          
          {/* Mobile Top Branding Logo (Displayed on screens < 900px) */}
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-md">
              <Sparkles size={20} className="text-white" strokeWidth={2.5} />
            </div>
            <span className="text-xl font-bold text-slate-900 tracking-tight">SalesGenie AI</span>
          </div>

          {/* Welcome Header */}
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Welcome back 👋
            </h2>
            <p className="mt-2 text-[15px] text-slate-500 font-normal leading-relaxed">
              Sign in to continue managing your pipeline, outreach, and AI-powered sales insights.
            </p>
          </div>

          <div className="my-6 border-t border-slate-100" />

          {/* Form Error Notice */}
          {formError && (
            <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-700 shadow-sm">
              <AlertCircle size={16} className="mt-0.5 shrink-0 text-red-500" />
              <p className="font-semibold">{formError}</p>
            </div>
          )}

          {/* Login Form */}
          <form className="space-y-5" onSubmit={handleSubmit} noValidate>
            <div>
              <label htmlFor="email" className="block text-[12px] font-bold uppercase tracking-wider text-slate-700 mb-2">
                Work Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                placeholder="you@company.com"
                className={`h-[50px] w-full rounded-[10px] border bg-slate-50/40 px-4 py-3 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 ${
                  emailError ? 'border-red-400 bg-red-50/20' : 'border-slate-300'
                }`}
              />
              {emailError && <p className="mt-1.5 text-xs font-semibold text-red-600">{emailError}</p>}
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="block text-[12px] font-bold uppercase tracking-wider text-slate-700">
                  Password
                </label>
                <Link to="/login" className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                  placeholder="••••••••••••••••"
                  className={`h-[50px] w-full rounded-[10px] border bg-slate-50/40 px-4 py-3 pr-12 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 ${
                    passwordError ? 'border-red-400 bg-red-50/20' : 'border-slate-300'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {passwordError && <p className="mt-1.5 text-xs font-semibold text-red-600">{passwordError}</p>}
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2.5 text-sm font-medium text-slate-600 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500/30 cursor-pointer"
                />
                Keep me signed in
              </label>
            </div>

            <button
              type="submit"
              disabled={!canSubmit}
              style={{ background: 'linear-gradient(135deg, #2563eb, #6d28d9)' }}
              className="h-[50px] w-full flex items-center justify-center gap-2 rounded-[10px] py-3 px-5 text-sm font-bold text-white shadow-lg shadow-blue-500/25 transition-all hover:opacity-95 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none mt-2"
            >
              {isSubmitting ? (
                <>
                  <LoaderCircle size={18} className="animate-spin" />
                  <span>Signing in…</span>
                </>
              ) : (
                <>
                  <span>Sign in</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Footer Navigation */}
          <div className="mt-8 pt-6 border-t border-slate-100 text-center text-sm font-medium text-slate-500">
            Don't have an account?{' '}
            <Link to="/signup" className="font-bold text-blue-600 hover:text-blue-700 transition-colors ml-1">
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
