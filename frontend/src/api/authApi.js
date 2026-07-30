import { apiClient } from './client.js'

/**
 * Attempts to log in against the real backend. Resolves with the user on
 * success, throws an Error with a display-ready `.message` on failure —
 * LoginPage catches this and shows err.message directly.
 *
 * Expected backend response shape: { email, name, role, token }
 * (adjust the destructuring below if the backend's /auth/login returns
 * different field names once it's implemented).
 */
export async function loginRequest({ email, password }) {
  try {
    const data = await apiClient.post('/auth/login', {
      email: email.trim().toLowerCase(),
      password,
    })

    if (data?.token) {
      localStorage.setItem('salesgenie_token', data.token)
    }

    return {
      email: data.email,
      name: data.name,
      role: data.role,
    }
  } catch (err) {
    const status = err?.response?.status
    if (status === 401 || status === 400) {
      throw new Error('Incorrect email or password.')
    }
    if (!err?.response) {
      throw new Error('Could not reach the server. Is the backend running?')
    }
    throw new Error(err?.response?.data?.detail || 'Login failed. Please try again.')
  }
}

/**
 * Registers a new user, then logs them in automatically (the backend
 * returns the same { email, name, role, token } shape /auth/login does).
 * `name` is sent as a query param — that's how POST /auth/register expects it.
 */
export async function registerRequest({ name, email, password }) {
  try {
    const query = new URLSearchParams({ name: name?.trim() || 'New User' }).toString()
    const data = await apiClient.post(`/auth/register?${query}`, {
      email: email.trim().toLowerCase(),
      password,
    })

    if (data?.token) {
      localStorage.setItem('salesgenie_token', data.token)
    }

    return {
      email: data.email,
      name: data.name,
      role: data.role,
    }
  } catch (err) {
    const status = err?.response?.status
    if (status === 400) {
      throw new Error(err?.response?.data?.detail || 'An account with this email already exists.')
    }
    if (!err?.response) {
      throw new Error('Could not reach the server. Is the backend running?')
    }
    throw new Error(err?.response?.data?.detail || 'Sign up failed. Please try again.')
  }
}