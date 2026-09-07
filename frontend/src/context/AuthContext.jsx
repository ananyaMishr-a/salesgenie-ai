import { createContext, useContext, useState, useEffect } from 'react'
import { loginRequest, requestOtpRequest, verifyOtpRequest } from '../api/authApi.js'

const AuthContext = createContext(null)
const SESSION_KEY = 'salesgenie_session'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const isExplicitLoggedOut = localStorage.getItem('salesgenie_logout') === 'true';
      if (isExplicitLoggedOut) return null;

      const stored = localStorage.getItem(SESSION_KEY);
      if (stored) return JSON.parse(stored);

      return null;
    } catch {
      return null;
    }
  });

  const [isLoading, setIsLoading] = useState(false);

  async function login({ email, password }) {
    const sessionUser = await loginRequest({ email, password });
    localStorage.removeItem('salesgenie_logout');
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
    setUser(sessionUser);
    return sessionUser;
  }

  async function signup({ name, email, password }) {
    // Only requests OTP, does not log user in
    return await requestOtpRequest({ name, email, password });
  }
  
  async function verifyOtp({ email, otpCode }) {
    const sessionUser = await verifyOtpRequest({ email, otpCode });
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
      value={{ user, isLoading, isAuthenticated: Boolean(user), login, signup, verifyOtp, logout }}
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
