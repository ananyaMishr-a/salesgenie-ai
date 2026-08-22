import { apiClient } from "./client";

export function formatIST(dateInput) {
  if (!dateInput) return null;
  let str = String(dateInput).trim();
  if (str.endsWith(' IST')) return str;

  // Append 'Z' to naive UTC ISO timestamps from database so JS Date converts to IST (+05:30)
  if (!str.endsWith('Z') && !str.includes('+') && /^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}/.test(str)) {
    str = str.replace(' ', 'T') + 'Z';
  }

  const date = new Date(str);
  if (isNaN(date.getTime())) return String(dateInput);

  const formatted = date.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  });

  return `${formatted} IST`;
}

function mapLead(lead) {
  const techStackList = Array.isArray(lead.technology_stack)
    ? lead.technology_stack
    : lead.technology_stack
    ? lead.technology_stack.split(",").map((t) => t.trim())
    : [];

  const createdAtDisplay = lead.created_at ? formatIST(lead.created_at) : null;
  const updatedAtDisplay = lead.updated_at ? formatIST(lead.updated_at) : createdAtDisplay;

  return {
    id: lead.lead_id,
    company: lead.company_name,
    company_name: lead.company_name,
    industry: lead.industry || null,
    contactName: lead.contact_name || null,
    contact_name: lead.contact_name || null,
    contactTitle: null,
    role: null,
    email: lead.email || null,
    phone: lead.phone || null,
    companySize: lead.company_size || null,
    size: lead.company_size || null,
    annualRevenue: lead.annual_revenue || null,
    revenue: lead.annual_revenue || null,
    location: lead.location || null,
    fundingStage: lead.funding_stage || null,
    funding: lead.funding_stage || null,
    techStack: techStackList,
    technology_stack: techStackList.join(", "),
    status: lead.lead_status || "New",
    stage: lead.stage || "new",
    segment: lead.lead_status || "New",
    tier: null,
    dealValue: lead.deal_value || 0,
    createdAt: createdAtDisplay,
    updatedAt: updatedAtDisplay,
    created_at: lead.created_at,
    updated_at: lead.updated_at,
    lastActivity: lead.updated_at ? `Updated: ${updatedAtDisplay}` : createdAtDisplay ? `Created: ${createdAtDisplay}` : null,
    timeAgo: null,
    qualificationScore: lead.qualification_score || 0,
    insights: [],
    hasIntelligence: false,
  };
}

// Turns one CompanyInsightOut record into the {label, detail} shape
// LeadIntelligencePanel already expects.
function mapInsightRecord(insight) {
  if (!insight) return [];
  return [
    { type: "Business Needs", label: "Business Needs", detail: insight.business_needs },
    { type: "Opportunities", label: "Opportunities", detail: insight.opportunities },
    { type: "Industry Analysis", label: "Industry Analysis", detail: insight.industry_analysis },
  ];
}

// Merges the latest insight + score records (if any exist) onto a mapped lead.
function attachIntelligence(lead, insightRecord, scoreRecord) {
  let scoringFactors = {}
  if (scoreRecord && scoreRecord.scoring_factors) {
    try {
      scoringFactors = JSON.parse(scoreRecord.scoring_factors)
    } catch (e) {
      console.error("Failed to parse scoring factors")
    }
  }

  return {
    ...lead,
    qualificationScore: scoreRecord ? scoreRecord.lead_score : lead.qualificationScore || 0,
    conversionProbability: scoreRecord ? scoreRecord.conversion_probability : 0,
    priorityLevel: scoreRecord ? scoreRecord.priority_level : 'Low',
    scoringFactors,
    insights: mapInsightRecord(insightRecord),
    hasIntelligence: Boolean(insightRecord || scoreRecord),
  };
}

// Reverse of mapLead: turns the camelCase form state this app uses into
// the snake_case body the backend's LeadCreate/LeadUpdate schemas expect.
function toApiPayload(values) {
  const payload = {
    company_name: (values.company || values.company_name)?.trim(),
    industry: values.industry?.trim() || null,
    contact_name: (values.contactName || values.contact_name)?.trim() || null,
    email: values.email?.trim() || null,
    phone: values.phone?.trim() || null,
    company_size: (values.companySize || values.size)?.trim() || null,
    annual_revenue: (values.annualRevenue || values.revenue)?.trim() || null,
    location: values.location?.trim() || null,
    funding_stage: (values.fundingStage || values.funding)?.trim() || null,
    technology_stack: Array.isArray(values.techStack)
      ? values.techStack.join(", ")
      : values.techStack?.trim() || null,
    stage: values.stage || "new",
    deal_value:
      values.dealValue === "" || values.dealValue == null ? 0 : Number(values.dealValue),
  };
  if (values.status || values.segment) {
    payload.lead_status = values.status || values.segment;
  }
  return payload;
}

function toDisplayMessage(err, fallback) {
  if (!err?.response) return "Could not reach the server. Is the backend running?";
  return err?.response?.data?.detail || fallback;
}

export async function fetchLeads(query = "") {
  const path = query && query.trim() ? `/leads/?q=${encodeURIComponent(query.trim())}` : "/leads/";
  const data = await apiClient.get(path);
  return data.map(mapLead);
}

// Fetches a lead AND its most recent AI insight/score, if any were
// already generated earlier. Safe to call every time the detail page
// opens — these are GET requests, they don't trigger new AI calls.
export async function fetchLeadById(id) {
  const [leadData, insights, scores] = await Promise.all([
    apiClient.get(`/leads/${id}`),
    apiClient.get(`/leads/${id}/insights`).catch(() => []),
    apiClient.get(`/leads/${id}/scores`).catch(() => []),
  ]);

  const lead = mapLead(leadData);
  const latestInsight = insights?.[0] ?? null; // endpoint returns newest first
  const latestScore = scores?.[0] ?? null;

  return attachIntelligence(lead, latestInsight, latestScore);
}

// Triggers a FRESH AI analysis + scoring run for this lead (two POSTs,
// in parallel) and returns the fields needed to update the UI.
// Wire this to an "Analyze with AI" button — don't call it automatically
// on every page load, since each call is a real Gemini/LLM request.
export async function runLeadIntelligence(id) {
  try {
    const [insight, score] = await Promise.all([
      apiClient.post(`/leads/${id}/analyze`),
      apiClient.post(`/leads/${id}/score`),
    ]);
    let scoringFactors = {}
    if (score && score.scoring_factors) {
      try {
        scoringFactors = JSON.parse(score.scoring_factors)
      } catch (e) {
        console.error("Failed to parse scoring factors")
      }
    }

    return {
      qualificationScore: score.lead_score,
      conversionProbability: score.conversion_probability,
      priorityLevel: score.priority_level,
      scoringFactors,
      insights: mapInsightRecord(insight),
      hasIntelligence: true,
    };
  } catch (err) {
    throw new Error(toDisplayMessage(err, "Couldn't run AI analysis for this lead. Please try again."));
  }
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

export async function fetchActivities() {
  const data = await apiClient.get("/dashboard/activities");
  return data;
}

export async function apiAddActivity(noteData) {
  const payload = {
    lead_id: noteData.lead_id || null,
    activity_type: noteData.type || "Note Added",
    title: noteData.title || "User note",
    company: noteData.company || "General"
  };
  const data = await apiClient.post("/dashboard/activities", payload);
  return data;
}

export async function deleteLead(id) {
  try {
    const data = await apiClient.delete(`/leads/${id}`);
    return data;
  } catch (err) {
    throw new Error(toDisplayMessage(err, "Couldn't delete lead. Please try again."));
  }
}

export async function enrichCompanyData(companyName) {
  try {
    const data = await apiClient.post("/leads/enrich", { company_name: companyName });
    return data;
  } catch (err) {
    throw new Error(toDisplayMessage(err, "Couldn't enrich company data. Please try again."));
  }
}
