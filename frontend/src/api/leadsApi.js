import { apiClient } from "./client";

function mapLead(lead) {
  return {
    id: lead.lead_id,
    company: lead.company_name,
    industry: lead.industry,
    contactName: lead.contact_name,
    contactTitle: "", // Backend doesn't provide this
    email: lead.email,
    phone: lead.phone,
    companySize: lead.company_size,
    annualRevenue: lead.annual_revenue,
    location: lead.location,
    fundingStage: lead.funding_stage,
    fundingAmount: "", // Backend doesn't provide this
    techStack: lead.technology_stack
      ? lead.technology_stack.split(",").map((t) => t.trim())
      : [],
    segment: lead.lead_status,
    lastActivity: new Date(lead.created_at).toLocaleDateString(),
    qualificationScore: 75, // Placeholder until backend provides a score
    insights: [] // Placeholder until backend provides insights
  };
}

export async function fetchLeads() {
  const data = await apiClient.get("/leads/");
  return data.map(mapLead);
}

export async function fetchLeadById(id) {
  const data = await apiClient.get(`/leads/${id}`);
  return mapLead(data);
}