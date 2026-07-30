import { useState, useEffect, useCallback } from 'react'
import { fetchLeads } from '../api/leadsApi.js'

/**
 * Loads the full prospect list once on mount.
 * Returns { leads, isLoading, error, refetch } — components never call the
 * API directly or handle Promises themselves.
 */
export function useLeads() {
  const [leads, setLeads] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setIsLoading(true)
    setError('')
    try {
      const data = await fetchLeads()
      setLeads(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return { leads, isLoading, error, refetch: load }
}
