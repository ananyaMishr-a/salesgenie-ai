import { apiClient } from './client'

export async function fetchLeadCampaigns(leadId) {
  const data = await apiClient.get(`/leads/${leadId}/campaigns`)
  return data
}

export async function generateOutreachEmail(leadId, tone = 'Professional', strategy = null) {
  const data = await apiClient.post(`/leads/${leadId}/generate-email`, { tone, strategy })
  return data
}

export async function fetchOutreachStrategy(leadId) {
  const data = await apiClient.get(`/leads/${leadId}/strategy`)
  return data
}
