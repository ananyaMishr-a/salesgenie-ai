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

// Reverse of mapLead: turns the camelCase form state this app uses into
// the snake_case body the backend's LeadCreate/LeadUpdate schemas expect.
function toApiPayload(values) {
  const payload = {
    company_name: values.company?.trim(),
    industry: values.industry?.trim() || null,
    contact_name: values.contactName?.trim() || null,
    email: values.email?.trim() || null,
    phone: values.phone?.trim() || null,
    company_size: values.companySize?.trim() || null,
    annual_revenue: values.annualRevenue?.trim() || null,
    location: values.location?.trim() || null,
    funding_stage: values.fundingStage?.trim() || null,
    technology_stack: values.techStack?.trim() || null,
    deal_value:
      values.dealValue === "" || values.dealValue == null ? 0 : Number(values.dealValue),
  };
  if (values.status) {
    payload.lead_status = values.status;
  }
  return payload;
}

function toDisplayMessage(err, fallback) {
  if (!err?.response) return "Could not reach the server. Is the backend running?";
  return err?.response?.data?.detail || fallback;
}

export async function fetchLeads() {
  const data = await apiClient.get("/leads/");
  return data.map(mapLead);
}

export async function fetchLeadById(id) {
  const data = await apiClient.get(`/leads/${id}`);
  return mapLead(data);
}

export async function createLead(values) {
  try {
    const data = await apiClient.post("/leads/", toApiPayload(values));
    return mapLead(data);
  } catch (err) {
    throw new Error(toDisplayMessage(err, "Couldn't create this lead. Please try again."));
  }
}

export async function updateLead(id, values) {
  try {
    const data = await apiClient.put(`/leads/${id}`, toApiPayload(values));
    return mapLead(data);
  } catch (err) {
    throw new Error(toDisplayMessage(err, "Couldn't save these changes. Please try again."));
  }
}