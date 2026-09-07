import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { Sparkles, LoaderCircle, AlertCircle, CheckCircle2, ChevronLeft } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export default function LoginPage({ isSignUp = false }) {
  const { login, signup, verifyOtp } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const redirectTo = location.state?.from?.pathname ?? '/leads'

  const [mode, setMode] = useState(isSignUp ? 'SIGNUP' : 'LOGIN') // 'LOGIN', 'SIGNUP', 'OTP'

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [otpCode, setOtpCode] = useState('')
  
  const [touched, setTouched] = useState({ name: false, email: false, password: false, otp: false })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState('')
  const [formSuccess, setFormSuccess] = useState('')
  const [showPasswordInput, setShowPasswordInput] = useState(false)

  // Validations
  const nameError = touched.name && mode === 'SIGNUP' && !name.trim() ? 'Enter your full name' : ''
  const emailError = touched.email && !email.trim() ? 'Enter your email' : touched.email && !isValidEmail(email) ? 'Enter a valid email' : ''
  const passwordError = touched.password && !password ? 'Enter a password' : touched.password && password.length < 6 ? 'Password must be at least 6 characters' : ''
  const otpError = touched.otp && mode === 'OTP' && otpCode.length !== 6 ? 'Enter a valid 6-digit OTP' : ''

  const canSubmitLogin = email.trim() && password && isValidEmail(email) && !isSubmitting
  const canSubmitSignup = name.trim() && email.trim() && password.length >= 6 && isValidEmail(email) && !isSubmitting
  const canSubmitOtp = otpCode.length === 6 && !isSubmitting

  async function handleLogin(e) {
    e.preventDefault()
    
    // In this UI, if they haven't shown password input yet, clicking the main button shows it
    if (!showPasswordInput) {
      if (!email.trim() || !isValidEmail(email)) {
        setTouched({ ...touched, email: true })
        return
      }
      setShowPasswordInput(true)
      return
    }

    setTouched({ name: true, email: true, password: true, otp: true })
    setFormError('')
    if (!canSubmitLogin) return

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

  async function handleSignup(e) {
    e.preventDefault()
    setTouched({ name: true, email: true, password: true, otp: true })
    setFormError('')
    if (!canSubmitSignup) return

    setIsSubmitting(true)
    try {
      await signup({ name, email, password })
      setFormSuccess(`An OTP has been sent to ${email}. Check your inbox!`)
      setMode('OTP')
    } catch (err) {
      setFormError(err.message || 'Sign up failed. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleVerifyOtp(e) {
    e.preventDefault()
    setTouched({ ...touched, otp: true })
    setFormError('')
    if (!canSubmitOtp) return

    setIsSubmitting(true)
    try {
      await verifyOtp({ email, otpCode })
      navigate(redirectTo, { replace: true })
    } catch (err) {
      setFormError(err.message || 'Invalid OTP. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const switchMode = (newMode) => {
    setMode(newMode)
    setFormError('')
    setFormSuccess('')
    setTouched({ name: false, email: false, password: false, otp: false })
    setShowPasswordInput(false)
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-[#0b0e14] font-sans text-slate-300">
      
      {/* Top Left Navigation (Matching Screenshot) */}
      <div className="absolute top-6 left-6 z-20">
        <button 
          onClick={() => navigate('/')}
          className="flex items-center gap-2 rounded-lg bg-white/5 px-4 py-2 text-xs font-semibold text-slate-400 hover:bg-white/10 hover:text-slate-300 transition-all"
        >
          <ChevronLeft size={14} />
          Back to AI Sales Platform
        </button>
      </div>

      {/* Subtle background glow effect at the top */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[500px] w-[800px] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Main Centered Container */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-[400px]">
          
          {/* Logo Header */}
          <div className="mb-8 flex flex-col items-center justify-center text-center">
            {/* Dark 3D-ish Logo Box */}
            <div className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-gradient-to-b from-[#2a303f] to-[#161a23] shadow-[0_4px_20px_rgba(0,0,0,0.5)] border border-white/5 mb-6">
              <Sparkles size={22} className="text-white" strokeWidth={2.5} />
            </div>
            
            <h1 className="text-[1.75rem] font-bold tracking-tight text-white mb-2">
              {mode === 'LOGIN' && 'Welcome back'}
              {mode === 'SIGNUP' && 'Create your account'}
              {mode === 'OTP' && 'Verify your email'}
            </h1>
            
            <p className="text-sm text-slate-400 font-medium">
              {mode === 'LOGIN' && (
                <>
                  First time here? <button onClick={() => switchMode('SIGNUP')} className="text-blue-400 hover:text-blue-300 transition-colors">Sign up for free.</button>
                </>
              )}
              {mode === 'SIGNUP' && (
                <>
                  Already have an account? <button onClick={() => switchMode('LOGIN')} className="text-blue-400 hover:text-blue-300 transition-colors">Log in.</button>
                </>
              )}
              {mode === 'OTP' && 'Enter the 6-digit code we sent you.'}
            </p>
          </div>

          {/* Alerts */}
          {formError && (
            <div className="mb-6 flex items-start gap-3 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <p>{formError}</p>
            </div>
          )}
          
          {formSuccess && mode === 'OTP' && (
            <div className="mb-6 flex items-start gap-3 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-400">
              <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
              <p>{formSuccess}</p>
            </div>
          )}

          {/* LOGIN / SIGNUP FORMS */}
          {(mode === 'LOGIN' || mode === 'SIGNUP') && (
            <form className="space-y-4" onSubmit={mode === 'LOGIN' ? handleLogin : handleSignup} noValidate>
              
              {mode === 'SIGNUP' && (
                <div>
                  <label htmlFor="name" className="block text-[11px] font-semibold text-slate-400 mb-1.5 ml-0.5">
                    Full name
                  </label>
                  <input
                    id="name"
                    type="text"
                    autoComplete="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onBlur={() => setTouched((t) => ({ ...t, name: true }))}
                    className={`h-[44px] w-full rounded-lg border bg-[#161a23] px-3.5 text-[14px] text-white outline-none transition-all placeholder:text-slate-500 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 ${
                      nameError ? 'border-red-500/50' : 'border-white/10 hover:border-white/20'
                    }`}
                  />
                  {nameError && <p className="mt-1.5 ml-0.5 text-[11px] font-medium text-red-400">{nameError}</p>}
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-[11px] font-semibold text-slate-400 mb-1.5 ml-0.5">
                  E-mail
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                  placeholder="jsmith@company.com"
                  className={`h-[44px] w-full rounded-lg border bg-[#161a23] px-3.5 text-[14px] text-white outline-none transition-all placeholder:text-slate-500 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 ${
                    emailError ? 'border-red-500/50' : 'border-white/10 hover:border-white/20'
                  }`}
                />
                {emailError && <p className="mt-1.5 ml-0.5 text-[11px] font-medium text-red-400">{emailError}</p>}
              </div>

              {(mode === 'SIGNUP' || (mode === 'LOGIN' && showPasswordInput)) && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="flex items-center justify-between mb-1.5 ml-0.5 mt-1">
                    <label htmlFor="password" className="block text-[11px] font-semibold text-slate-400">
                      Password
                    </label>
                    {mode === 'LOGIN' && (
                      <button type="button" className="text-[11px] font-semibold text-blue-400 hover:text-blue-300 transition-colors">
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                    placeholder="••••••••"
                    className={`h-[44px] w-full rounded-lg border bg-[#161a23] px-3.5 text-[14px] text-white outline-none transition-all placeholder:text-slate-500 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 ${
                      passwordError ? 'border-red-500/50' : 'border-white/10 hover:border-white/20'
                    }`}
                  />
                  {passwordError && <p className="mt-1.5 ml-0.5 text-[11px] font-medium text-red-400">{passwordError}</p>}
                </div>
              )}

              {mode === 'LOGIN' && !showPasswordInput ? (
                <>
                  <button
                    type="submit"
                    className="mt-6 h-[44px] w-full flex items-center justify-center rounded-lg bg-gradient-to-r from-indigo-500 to-blue-500 text-white text-[13px] font-semibold shadow-lg shadow-blue-500/20 transition-all hover:brightness-110 active:scale-[0.98]"
                  >
                    Continue with email
                  </button>
                  
                  <div className="text-center mt-4">
                    <button
                      type="button"
                      onClick={() => setShowPasswordInput(true)}
                      className="text-[12px] font-medium text-slate-400 hover:text-slate-300 transition-colors"
                    >
                      Sign in using password
                    </button>
                  </div>
                </>
              ) : (
                <button
                  type="submit"
                  disabled={mode === 'LOGIN' ? !canSubmitLogin : !canSubmitSignup}
                  className="mt-6 h-[44px] w-full flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-indigo-500 to-blue-500 text-white text-[13px] font-semibold shadow-lg shadow-blue-500/20 transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                >
                  {isSubmitting ? (
                    <LoaderCircle size={16} className="animate-spin" />
                  ) : (
                    <span>{mode === 'LOGIN' ? 'Sign in' : 'Create account'}</span>
                  )}
                </button>
              )}

              {/* Divider */}
              <div className="relative py-4 flex items-center">
                <div className="flex-grow border-t border-white/10"></div>
                <span className="flex-shrink-0 mx-4 text-[11px] text-slate-500 font-medium">or</span>
                <div className="flex-grow border-t border-white/10"></div>
              </div>

              {/* SSO Button (Visual only based on screenshot) */}
              <button
                type="button"
                className="h-[44px] w-full flex items-center justify-center rounded-lg bg-[#242936] text-slate-300 text-[13px] font-semibold border border-white/5 transition-all hover:bg-[#2a303f] hover:text-white"
              >
                Single sign-on (SSO)
              </button>
            </form>
          )}

          {/* OTP FORM */}
          {mode === 'OTP' && (
            <form className="space-y-6 mt-4" onSubmit={handleVerifyOtp} noValidate>
              <div>
                <label htmlFor="otpCode" className="block text-[11px] font-semibold text-slate-400 mb-1.5 ml-0.5 text-center">
                  6-Digit Verification Code
                </label>
                <input
                  id="otpCode"
                  type="text"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  onBlur={() => setTouched((t) => ({ ...t, otp: true }))}
                  placeholder="------"
                  className={`h-[56px] w-full rounded-lg border bg-[#161a23] px-4 text-center tracking-[0.75em] text-[20px] font-bold text-white outline-none transition-all placeholder:text-slate-600 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 ${
                    otpError ? 'border-red-500/50' : 'border-white/10 hover:border-white/20'
                  }`}
                />
                {otpError && <p className="mt-2 text-center text-[11px] font-medium text-red-400">{otpError}</p>}
              </div>

              <button
                type="submit"
                disabled={!canSubmitOtp}
                className="h-[44px] w-full flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-indigo-500 to-blue-500 text-white text-[13px] font-semibold shadow-lg shadow-blue-500/20 transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
              >
                {isSubmitting ? (
                  <LoaderCircle size={16} className="animate-spin" />
                ) : (
                  <span>Verify Code</span>
                )}
              </button>

              <div className="text-center mt-6">
                <button
                  type="button"
                  onClick={() => switchMode('SIGNUP')}
                  className="text-[12px] font-medium text-slate-400 hover:text-slate-300 transition-colors"
                >
                  Change email address
                </button>
              </div>
            </form>
          )}

          {/* Terms Footer */}
          <div className="mt-12 text-center">
            <p className="text-[10px] text-slate-500 font-medium leading-relaxed max-w-[280px] mx-auto">
              You acknowledge that you read, and agree to our <br/>
              <span className="text-slate-400">Terms of Service</span> and our <span className="text-slate-400">Privacy Policy</span>.
            </p>
          </div>

        </div>
      </div>
    </div>
  )
}
