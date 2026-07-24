from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app import models, schemas
from app.services import ai_service

router = APIRouter(prefix="/leads", tags=["2. Lead Intelligence"])


@router.post("/{lead_id}/analyze", response_model=schemas.CompanyInsightOut)
def analyze_lead(lead_id: int, db: Session = Depends(get_db)):
    """Runs AI-powered company analysis for one lead and saves the insight."""
    lead = db.query(models.Lead).filter(models.Lead.lead_id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    result = ai_service.generate_company_insights(lead)

    insight = models.CompanyInsight(
        lead_id=lead.lead_id,
        business_needs=result["business_needs"],
        opportunities=result["opportunities"],
        industry_analysis=result["industry_analysis"],
    )
    db.add(insight)
    db.commit()
    db.refresh(insight)
    return insight


@router.get("/{lead_id}/insights", response_model=List[schemas.CompanyInsightOut])
def get_insights(lead_id: int, db: Session = Depends(get_db)):
    """Get all previously generated insights for a lead (most recent first)."""
    insights = (
        db.query(models.CompanyInsight)
        .filter(models.CompanyInsight.lead_id == lead_id)
        .order_by(models.CompanyInsight.generated_at.desc())
        .all()
    )
    return insights
