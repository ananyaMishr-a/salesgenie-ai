import { useState, useEffect } from 'react'
import { fetchLeads } from '../api/leadsApi.js'

/**
 * Loads the full prospect list once on mount.
 * Returns { leads, isLoading, error } — components never call the API
 * directly or handle Promises themselves.
 */
export function useLeads() {
  const [leads, setLeads] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    async function load() {
      setIsLoading(true)
      setError('')
      try {
        const data = await fetchLeads()
        if (!cancelled) setLeads(data)
      } catch (err) {
        if (!cancelled) setError(err.message)
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  return { leads, isLoading, error }
}
