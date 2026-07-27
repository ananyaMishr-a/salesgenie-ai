<<<<<<< HEAD
from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional, List
from datetime import datetime


# ---------- Lead ----------
=======
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict

>>>>>>> 0a08b43 (Update backend code)

class LeadCreate(BaseModel):
    company_name: str
    industry: Optional[str] = None
    contact_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    company_size: Optional[str] = None
    annual_revenue: Optional[str] = None
    location: Optional[str] = None
    funding_stage: Optional[str] = None
    technology_stack: Optional[str] = None
    deal_value: Optional[float] = 0.0


class LeadUpdate(BaseModel):
    company_name: Optional[str] = None
    industry: Optional[str] = None
    contact_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    company_size: Optional[str] = None
    annual_revenue: Optional[str] = None
    location: Optional[str] = None
    funding_stage: Optional[str] = None
    technology_stack: Optional[str] = None
    lead_status: Optional[str] = None
    deal_value: Optional[float] = None


class LeadOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    lead_id: int
    company_name: str
    industry: Optional[str] = None
    contact_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    company_size: Optional[str] = None
    annual_revenue: Optional[str] = None
    location: Optional[str] = None
    funding_stage: Optional[str] = None
    technology_stack: Optional[str] = None
    lead_status: str
    deal_value: float
    created_at: datetime


<<<<<<< HEAD
# ---------- Company Insight ----------

=======
>>>>>>> 0a08b43 (Update backend code)
class CompanyInsightOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    insight_id: int
    lead_id: int
    business_needs: str
    opportunities: str
    industry_analysis: str
    generated_at: datetime


<<<<<<< HEAD
# ---------- Lead Score ----------

=======
>>>>>>> 0a08b43 (Update backend code)
class LeadScoreOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    score_id: int
    lead_id: int
    lead_score: int
    conversion_probability: float
    priority_level: str
    scoring_factors: str
    generated_at: datetime


<<<<<<< HEAD
# ---------- Outreach Campaign ----------

=======
>>>>>>> 0a08b43 (Update backend code)
class OutreachCampaignOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    campaign_id: int
    lead_id: int
    email_subject: str
    email_content: str
    campaign_status: str
    created_at: datetime


class OutreachCampaignUpdate(BaseModel):
<<<<<<< HEAD
    campaign_status: str  # e.g. "Sent", "Opened", "Replied"


# ---------- Sales Interaction (conversation intelligence) ----------

class InteractionCreate(BaseModel):
    interaction_type: str = "Call"   # Call / Meeting / Email
    raw_transcript: str              # paste the meeting/call transcript text here
=======
    campaign_status: str


class InteractionCreate(BaseModel):
    interaction_type: str = "Call"
    raw_transcript: str
>>>>>>> 0a08b43 (Update backend code)


class InteractionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    interaction_id: int
    lead_id: int
    interaction_type: str
    summary: str
    action_items: str
    interaction_date: datetime


<<<<<<< HEAD
# ---------- CRM Sync ----------

=======
>>>>>>> 0a08b43 (Update backend code)
class CRMSyncOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    sync_id: int
    lead_id: int
    crm_platform: str
    sync_status: str
    timestamp: datetime


<<<<<<< HEAD
# ---------- Dashboard ----------

=======
>>>>>>> 0a08b43 (Update backend code)
class DashboardOverview(BaseModel):
    total_leads: int
    conversion_rate: float
    pipeline_value: float
    leads_by_status: dict
    avg_lead_score: float
