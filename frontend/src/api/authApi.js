import { delay } from './delay.js'

// Placeholder credential check for Milestone 1 (frontend-only).
const DEMO_USER = {
  email: 'demo@salesgenie.ai',
  password: 'demo1234',
  name: 'Alex Rivera',
  role: 'Sales Representative',
}

/**
 * Attempts to log in. Resolves with the user on success, throws on failure —
 * exactly how a real request through apiClient would behave.
 * Real version:
 *   import { apiClient } from './client.js'
 *   export async function loginRequest({ email, password }) {
 *     return apiClient.post('/auth/login', { email, password }) // { email, name, role, token }
 *   }
 */
export async function loginRequest({ email, password }) {
  await delay(700)

  const normalizedEmail = email.trim().toLowerCase()
  if (normalizedEmail !== DEMO_USER.email || password !== DEMO_USER.password) {
    throw new Error('Incorrect email or password. Try the demo credentials below.')
  }

  return { email: DEMO_USER.email, name: DEMO_USER.name, role: DEMO_USER.role }
}
