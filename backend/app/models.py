from datetime import datetime

from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from app.database import Base


class User(Base):
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(String, default="Sales Representative")
    department = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class Lead(Base):
    __tablename__ = "leads"

    lead_id = Column(Integer, primary_key=True, index=True)
    company_name = Column(String, nullable=False)
    industry = Column(String, nullable=True)
    contact_name = Column(String, nullable=True)
    email = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    company_size = Column(String, nullable=True)
    annual_revenue = Column(String, nullable=True)
    location = Column(String, nullable=True)
    funding_stage = Column(String, nullable=True)
    technology_stack = Column(String, nullable=True)
    lead_status = Column(String, default="New")
    stage = Column(String, default="new")
    deal_value = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    insights = relationship("CompanyInsight", back_populates="lead", cascade="all, delete-orphan")
    scores = relationship("LeadScore", back_populates="lead", cascade="all, delete-orphan")
    campaigns = relationship("OutreachCampaign", back_populates="lead", cascade="all, delete-orphan")
    interactions = relationship("SalesInteraction", back_populates="lead", cascade="all, delete-orphan")
    crm_logs = relationship("CRMSyncLog", back_populates="lead", cascade="all, delete-orphan")
    recommendations = relationship("FollowUpRecommendation", back_populates="lead", cascade="all, delete-orphan")

    @property
    def qualification_score(self):
        if self.scores:
            return sorted(self.scores, key=lambda s: s.generated_at, reverse=True)[0].lead_score
        return 0


class CompanyInsight(Base):
    __tablename__ = "company_insights"

    insight_id = Column(Integer, primary_key=True, index=True)
    lead_id = Column(Integer, ForeignKey("leads.lead_id", ondelete="CASCADE"))
    business_needs = Column(Text)
    opportunities = Column(Text)
    industry_analysis = Column(Text)
    generated_at = Column(DateTime, default=datetime.utcnow)

    lead = relationship("Lead", back_populates="insights")


class LeadScore(Base):
    __tablename__ = "lead_scores"

    score_id = Column(Integer, primary_key=True, index=True)
    lead_id = Column(Integer, ForeignKey("leads.lead_id", ondelete="CASCADE"))
    lead_score = Column(Integer)
    conversion_probability = Column(Float)
    priority_level = Column(String)
    scoring_factors = Column(Text)
    generated_at = Column(DateTime, default=datetime.utcnow)

    lead = relationship("Lead", back_populates="scores")


class OutreachCampaign(Base):
    __tablename__ = "outreach_campaigns"

    campaign_id = Column(Integer, primary_key=True, index=True)
    lead_id = Column(Integer, ForeignKey("leads.lead_id", ondelete="CASCADE"))
    email_subject = Column(String)
    email_content = Column(Text)
    campaign_status = Column(String, default="Draft")
    created_at = Column(DateTime, default=datetime.utcnow)

    lead = relationship("Lead", back_populates="campaigns")


class SalesInteraction(Base):
    __tablename__ = "sales_interactions"

    interaction_id = Column(Integer, primary_key=True, index=True)
    lead_id = Column(Integer, ForeignKey("leads.lead_id", ondelete="CASCADE"))
    interaction_type = Column(String)
    raw_transcript = Column(Text, nullable=True)
    summary = Column(Text)
    discussion_points = Column(Text, nullable=True)
    action_items = Column(Text)
    notes = Column(Text, nullable=True)
    interaction_date = Column(DateTime, default=datetime.utcnow)

    lead = relationship("Lead", back_populates="interactions")


class CRMSyncLog(Base):
    __tablename__ = "crm_sync_logs"

    sync_id = Column(Integer, primary_key=True, index=True)
    lead_id = Column(Integer, ForeignKey("leads.lead_id", ondelete="CASCADE"))
    crm_platform = Column(String, default="Salesforce")
    sync_status = Column(String, default="Synced")
    direction = Column(String, default="Outbound (SalesGenie → CRM)")
    changed_fields = Column(String, default="Lead Qualification Score, AI Insights, Contact Profile, Interaction Logs")
    timestamp = Column(DateTime, default=datetime.utcnow)

    lead = relationship("Lead", back_populates="crm_logs")


class SalesAnalytics(Base):
    __tablename__ = "sales_analytics"

    analytics_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=True)
    conversion_rate = Column(Float, default=24.8)
    pipeline_value = Column(Float, default=2400000.0)
    avg_response_time = Column(String, default="2.4h")
    avg_sales_cycle = Column(String, default="28 days")
    generated_at = Column(DateTime, default=datetime.utcnow)


class FollowUpRecommendation(Base):
    __tablename__ = "followup_recommendations"

    recommendation_id = Column(Integer, primary_key=True, index=True)
    lead_id = Column(Integer, ForeignKey("leads.lead_id", ondelete="CASCADE"), nullable=True)
    company_name = Column(String, nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    priority_level = Column(String, default="High Priority")
    created_at = Column(DateTime, default=datetime.utcnow)

    lead = relationship("Lead", back_populates="recommendations")


class ActivityLog(Base):
    __tablename__ = "activity_logs"

    activity_id = Column(Integer, primary_key=True, index=True)
    lead_id = Column(Integer, ForeignKey("leads.lead_id", ondelete="CASCADE"), nullable=True)
    activity_type = Column(String, default="Note Added")
    title = Column(String, nullable=False)
    company = Column(String, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
