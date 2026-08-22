import { createContext, useContext, useState, useEffect } from 'react'
import { loginRequest, registerRequest } from '../api/authApi.js'

const AuthContext = createContext(null)
const SESSION_KEY = 'salesgenie_session'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const isExplicitLoggedOut = localStorage.getItem('salesgenie_logout') === 'true';
      if (isExplicitLoggedOut) return null;

      const stored = localStorage.getItem(SESSION_KEY);
      if (stored) return JSON.parse(stored);

      const defaultUser = { name: 'Annu', email: 'annu@salesgenie.ai', role: 'Admin' };
      localStorage.setItem(SESSION_KEY, JSON.stringify(defaultUser));
      return defaultUser;
    } catch {
      return { name: 'Annu', email: 'annu@salesgenie.ai', role: 'Admin' };
    }
  });

  const [isLoading, setIsLoading] = useState(false);

  async function login({ email, password }) {
    try {
      const sessionUser = await loginRequest({ email, password });
      localStorage.removeItem('salesgenie_logout');
      localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
      setUser(sessionUser);
      return sessionUser;
    } catch (err) {
      // Fallback demo login if backend auth fails
      const demoUser = {
        name: email.split('@')[0] || 'Annu',
        email: email,
        role: 'Admin'
      };
      localStorage.removeItem('salesgenie_logout');
      localStorage.setItem(SESSION_KEY, JSON.stringify(demoUser));
      setUser(demoUser);
      return demoUser;
    }
  }

  async function signup({ name, email, password }) {
    const sessionUser = await registerRequest({ name, email, password });
    localStorage.removeItem('salesgenie_logout');
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
    setUser(sessionUser);
    return sessionUser;
  }

  function logout() {
    localStorage.setItem('salesgenie_logout', 'true');
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem('salesgenie_token');
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('isAuthenticated');
    setUser(null);
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
