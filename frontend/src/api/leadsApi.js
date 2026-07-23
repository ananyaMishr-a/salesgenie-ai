import { delay } from './delay.js'
// NOTE: named import, matching mockLeads.js's named exports.
// A default import here (`import mockLeads from ...`) is the classic bug —
// there's no `export default` in mockLeads.js, so it silently resolves to
// `undefined` instead of throwing, and everything downstream breaks.
import { mockLeads } from '../data/mockLeads.js'

// ---- Mock async API layer ----
// Every function here is async and can fail, exactly like a real fetch() call
// would (see api/client.js). When the FastAPI backend is ready, replace the
// body of each function with a real request through apiClient — callers
// already await these and already handle thrown errors, so no other code
// needs to change.

/**
 * Fetch all leads.
 * Real version:
 *   import { apiClient } from './client.js'
 *   export async function fetchLeads() {
 *     return apiClient.get('/leads')
 *   }
 */
export async function fetchLeads() {
  await delay(500)
  return mockLeads
}

/**
 * Fetch a single lead by id. Throws if not found, mirroring a 404 response.
 * Real version:
 *   export async function fetchLeadById(id) {
 *     return apiClient.get(`/leads/${id}`) // apiClient throws on non-2xx already
 *   }
 */
export async function fetchLeadById(id) {
  await delay(350)
  const lead = mockLeads.find((l) => String(l.id) === String(id))
  if (!lead) {
    throw new Error(`Lead "${id}" not found`)
  }
  return lead
}
