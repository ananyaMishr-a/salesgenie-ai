"""
Day 2: Pydantic schemas for the Company Research Agent.

These define the exact shape of data going IN and coming OUT of the agent.
Share this file with your Backend Lead (Aditi) so she can build the API
endpoint and database table to match these fields exactly.
"""

from pydantic import BaseModel, Field
from typing import List


class CompanyResearchInput(BaseModel):
    """What the agent needs to run its analysis."""
    company_name: str = Field(..., description="Name of the company, e.g. 'Stripe'")
    domain: str | None = Field(None, description="Optional company website domain, e.g. 'stripe.com'")


class CompanyInsights(BaseModel):
    """What the agent returns after analyzing a company."""
    industry: str = Field(..., description="Primary industry, e.g. 'Fintech / Payments'")
    company_size: str = Field(..., description="Estimated employee range, e.g. '1000-5000 employees'")
    tech_stack: List[str] = Field(..., description="Likely technologies the company uses")
    funding_stage: str = Field(..., description="e.g. 'Series C', 'Public', 'Bootstrapped'")
    growth_signals: List[str] = Field(..., description="Signals suggesting growth or buying potential")
    qualification_score: int = Field(..., ge=0, le=100, description="0-100 score for lead quality")
    reasoning: str = Field(..., description="Short explanation for the score, 1-2 sentences")
