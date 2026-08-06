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
    // see attachIntelligence() below. These stay as safe defaults until
    // real data (or a user-triggered analysis) is available.
    qualificationScore: lead.qualification_score || 0,
    insights: [],
    hasIntelligence: false, // lets the UI show "Run AI Analysis" vs the real panel
  };
}

// Turns one CompanyInsightOut record into the {label, detail} shape
// LeadIntelligencePanel already expects.
function mapInsightRecord(insight) {
  if (!insight) return [];
  return [
    { label: "Business Needs", detail: insight.business_needs },
    { label: "Opportunities", detail: insight.opportunities },
    { label: "Industry Analysis", detail: insight.industry_analysis },
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
    qualificationScore: scoreRecord ? scoreRecord.lead_score : 0,
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

export async function enrichCompanyData(companyName) {
  try {
    const data = await apiClient.post("/leads/enrich", { company_name: companyName });
    return data;
  } catch (err) {
    throw new Error(toDisplayMessage(err, "Couldn't enrich company data. Please try again."));
  }
}
