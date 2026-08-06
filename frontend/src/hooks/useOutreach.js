import { useState, useCallback } from 'react'
import { generateOutreachEmail, fetchLeadCampaigns, fetchOutreachStrategy } from '../api/outreachApi.js'

export function useOutreach() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [campaigns, setCampaigns] = useState([])
  const [strategy, setStrategy] = useState(null)
  const [isGeneratingStrategy, setIsGeneratingStrategy] = useState(false)

  const loadCampaigns = useCallback(async (leadId) => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await fetchLeadCampaigns(leadId)
      setCampaigns(data)
    } catch (err) {
      setError(err.message || 'Failed to load campaigns')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const generateEmail = useCallback(async (leadId, tone) => {
    setIsLoading(true)
    setError(null)
    try {
      const campaign = await generateOutreachEmail(leadId, tone)
      setCampaigns((prev) => [campaign, ...prev])
      return campaign
    } catch (err) {
      setError(err.message || 'Failed to generate outreach')
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const generateStrategy = useCallback(async (leadId) => {
    setIsGeneratingStrategy(true)
    setError(null)
    try {
      const data = await fetchOutreachStrategy(leadId)
      setStrategy(data)
      return data
    } catch (err) {
      setError(err.message || 'Failed to generate outreach strategy')
      throw err
    } finally {
      setIsGeneratingStrategy(false)
    }
  }, [])

  return {
    campaigns,
    isLoading,
    error,
    strategy,
    isGeneratingStrategy,
    loadCampaigns,
    generateEmail,
    generateStrategy,
  }
}
