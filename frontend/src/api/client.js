// Single point of contact with the backend. Nothing else in the app should
// ever call fetch() directly — api/*.js files call this, and everything
// above them (hooks, components) never knows or cares whether the data
// came from mockLeads.js or a real FastAPI server.

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  })

  if (!res.ok) {
    const message = await res.text().catch(() => res.statusText)
    throw new Error(message || `Request failed with status ${res.status}`)
  }

  if (res.status === 204) return null
  return res.json()
}

export const apiClient = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) }),
  put: (path, body) => request(path, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (path) => request(path, { method: 'DELETE' }),
}

// Not used yet — leadsApi.js and authApi.js currently serve mock data instead.
// When the backend is ready, swap their function bodies to call apiClient.get(...)
// / apiClient.post(...) instead of the mock delay + mockLeads lookup. This file
// itself won't need to change.
