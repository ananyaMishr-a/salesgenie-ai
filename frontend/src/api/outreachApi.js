import { apiClient } from './client'

export async function fetchLeadCampaigns(leadId) {
  const data = await apiClient.get(`/leads/${leadId}/campaigns`)
  return data
}

export async function generateOutreachEmail(leadId, tone = 'Professional') {
  const data = await apiClient.post(`/leads/${leadId}/generate-email`, { tone })
  return data
}

export async function fetchOutreachStrategy(leadId) {
  const data = await apiClient.get(`/leads/${leadId}/strategy`)
  return data
}
