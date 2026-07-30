import { useState, useEffect } from 'react'
import { fetchLeadById } from '../api/leadsApi.js'

/**
 * Loads a single lead's detail whenever `id` changes.
 * Returns { lead, isLoading, error }.
 */
export function useLead(id) {
  const [lead, setLead] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) {
      setLead(null)
      return
    }

    let cancelled = false

    async function load() {
      setIsLoading(true)
      setError('')
      try {
        const data = await fetchLeadById(id)
        if (!cancelled) setLead(data)
      } catch (err) {
        if (!cancelled) {
          setError(err.message)
          setLead(null)
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [id])

  return { lead, isLoading, error }
}
