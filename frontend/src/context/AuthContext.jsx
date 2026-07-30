import { createContext, useContext, useState, useEffect } from 'react'
import { loginRequest, registerRequest } from '../api/authApi.js'

const AuthContext = createContext(null)
const SESSION_KEY = 'salesgenie_session'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  // Restore session on load
  useEffect(() => {
    async function restoreSession() {
      try {
        const stored = localStorage.getItem(SESSION_KEY)
        if (stored) {
          setUser(JSON.parse(stored))
        }
      } catch {
        localStorage.removeItem(SESSION_KEY)
      } finally {
        setIsLoading(false)
      }
    }
    restoreSession()
  }, [])

  async function login({ email, password }) {
    // Throws on invalid credentials — callers (LoginPage) catch and display it
    const sessionUser = await loginRequest({ email, password })
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser))
    setUser(sessionUser)
    return sessionUser
  }

  async function signup({ name, email, password }) {
    // Registers and logs in — throws on failure (e.g. email already taken)
    const sessionUser = await registerRequest({ name, email, password })
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser))
    setUser(sessionUser)
    return sessionUser
  }

  function logout() {
    localStorage.removeItem(SESSION_KEY)
    localStorage.removeItem('salesgenie_token')
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{ user, isLoading, isAuthenticated: Boolean(user), login, signup, logout }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
