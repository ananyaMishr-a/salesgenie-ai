import { useState, useEffect, useCallback, useRef } from 'react'
import { fetchLeadById } from '../api/leadsApi.js'

/**
 * Loads a single lead's detail whenever `id` changes.
 * Returns { lead, isLoading, error, refetch }.
 */
export function useLead(id) {
  const [lead, setLead] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const requestId = useRef(0)

  const load = useCallback(async () => {
    if (!id) {
      setLead(null)
      return
    }
    const thisRequest = ++requestId.current
    setIsLoading(true)
    setError('')
    try {
      const data = await fetchLeadById(id)
      if (thisRequest === requestId.current) setLead(data)
    } catch (err) {
      if (thisRequest === requestId.current) {
        setError(err.message)
        setLead(null)
      }
    } finally {
      if (thisRequest === requestId.current) setIsLoading(false)
    }
  }, [id])

  useEffect(() => {
    load()
  }, [load])

  return { lead, isLoading, error, refetch: load }
}
