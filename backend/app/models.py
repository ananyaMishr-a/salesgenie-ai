<<<<<<< HEAD
from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
=======
from datetime import datetime

from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

>>>>>>> 0a08b43 (Update backend code)
from app.database import Base


class User(Base):
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    role = Column(String, default="Sales Representative")
    department = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class Lead(Base):
<<<<<<< HEAD
    """Core table - every prospect/company we are tracking."""
=======
>>>>>>> 0a08b43 (Update backend code)
    __tablename__ = "leads"

    lead_id = Column(Integer, primary_key=True, index=True)
    company_name = Column(String, nullable=False)
    industry = Column(String, nullable=True)
    contact_name = Column(String, nullable=True)
    email = Column(String, nullable=True)
    phone = Column(String, nullable=True)
<<<<<<< HEAD
    company_size = Column(String, nullable=True)       # e.g. "250-500 employees"
    annual_revenue = Column(String, nullable=True)      # e.g. "$45M - $60M"
    location = Column(String, nullable=True)
    funding_stage = Column(String, nullable=True)       # e.g. "Series C"
    technology_stack = Column(String, nullable=True)    # comma separated, e.g. "AWS,Python,React"
    lead_status = Column(String, default="New")         # New, Qualified, Proposal, Negotiation, Closed Won, Closed Lost
    deal_value = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)

    # relationships - lets us easily do lead.insights, lead.scores, etc.
=======
    company_size = Column(String, nullable=True)
    annual_revenue = Column(String, nullable=True)
    location = Column(String, nullable=True)
    funding_stage = Column(String, nullable=True)
    technology_stack = Column(String, nullable=True)
    lead_status = Column(String, default="New")
    deal_value = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)

>>>>>>> 0a08b43 (Update backend code)
    insights = relationship("CompanyInsight", back_populates="lead", cascade="all, delete-orphan")
    scores = relationship("LeadScore", back_populates="lead", cascade="all, delete-orphan")
    campaigns = relationship("OutreachCampaign", back_populates="lead", cascade="all, delete-orphan")
    interactions = relationship("SalesInteraction", back_populates="lead", cascade="all, delete-orphan")
    crm_logs = relationship("CRMSyncLog", back_populates="lead", cascade="all, delete-orphan")


class CompanyInsight(Base):
<<<<<<< HEAD
    """Module 2: Lead Intelligence & Company Analysis results."""
=======
>>>>>>> 0a08b43 (Update backend code)
    __tablename__ = "company_insights"

    insight_id = Column(Integer, primary_key=True, index=True)
    lead_id = Column(Integer, ForeignKey("leads.lead_id"))
    business_needs = Column(Text)
    opportunities = Column(Text)
    industry_analysis = Column(Text)
    generated_at = Column(DateTime, default=datetime.utcnow)

    lead = relationship("Lead", back_populates="insights")


class LeadScore(Base):
<<<<<<< HEAD
    """Module 4: Lead Scoring & Recommendation Engine results."""
=======
>>>>>>> 0a08b43 (Update backend code)
    __tablename__ = "lead_scores"

    score_id = Column(Integer, primary_key=True, index=True)
    lead_id = Column(Integer, ForeignKey("leads.lead_id"))
<<<<<<< HEAD
    lead_score = Column(Integer)                # 0-100
    conversion_probability = Column(Float)       # 0-100 (%)
    priority_level = Column(String)              # High / Medium / Low
    scoring_factors = Column(Text)               # JSON string explaining the score
=======
    lead_score = Column(Integer)
    conversion_probability = Column(Float)
    priority_level = Column(String)
    scoring_factors = Column(Text)
>>>>>>> 0a08b43 (Update backend code)
    generated_at = Column(DateTime, default=datetime.utcnow)

    lead = relationship("Lead", back_populates="scores")


class OutreachCampaign(Base):
<<<<<<< HEAD
    """Module 3: AI Outreach Generation results."""
=======
>>>>>>> 0a08b43 (Update backend code)
    __tablename__ = "outreach_campaigns"

    campaign_id = Column(Integer, primary_key=True, index=True)
    lead_id = Column(Integer, ForeignKey("leads.lead_id"))
    email_subject = Column(String)
    email_content = Column(Text)
<<<<<<< HEAD
    campaign_status = Column(String, default="Draft")  # Draft, Sent, Opened, Replied
=======
    campaign_status = Column(String, default="Draft")
>>>>>>> 0a08b43 (Update backend code)
    created_at = Column(DateTime, default=datetime.utcnow)

    lead = relationship("Lead", back_populates="campaigns")


class SalesInteraction(Base):
<<<<<<< HEAD
    """Module 5: Conversation Intelligence (meeting/call summaries)."""
=======
>>>>>>> 0a08b43 (Update backend code)
    __tablename__ = "sales_interactions"

    interaction_id = Column(Integer, primary_key=True, index=True)
    lead_id = Column(Integer, ForeignKey("leads.lead_id"))
<<<<<<< HEAD
    interaction_type = Column(String)   # Call, Meeting, Email
    raw_transcript = Column(Text, nullable=True)
    summary = Column(Text)
    action_items = Column(Text)         # JSON string list of action items
=======
    interaction_type = Column(String)
    raw_transcript = Column(Text, nullable=True)
    summary = Column(Text)
    action_items = Column(Text)
>>>>>>> 0a08b43 (Update backend code)
    interaction_date = Column(DateTime, default=datetime.utcnow)

    lead = relationship("Lead", back_populates="interactions")


class CRMSyncLog(Base):
<<<<<<< HEAD
    """Module 5: CRM Integration sync history (mocked - no real CRM needed)."""
=======
>>>>>>> 0a08b43 (Update backend code)
    __tablename__ = "crm_sync_logs"

    sync_id = Column(Integer, primary_key=True, index=True)
    lead_id = Column(Integer, ForeignKey("leads.lead_id"))
    crm_platform = Column(String, default="Salesforce")
    sync_status = Column(String, default="Synced")
    timestamp = Column(DateTime, default=datetime.utcnow)

    lead = relationship("Lead", back_populates="crm_logs")
