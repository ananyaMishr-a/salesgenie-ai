from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app import models, schemas
from app.services import ai_service

router = APIRouter(prefix="/leads", tags=["4. Lead Scoring"])


@router.post("/{lead_id}/score", response_model=schemas.LeadScoreOut)
def score_lead(lead_id: int, db: Session = Depends(get_db)):
    """Calculate and save a lead score + conversion probability."""
    lead = db.query(models.Lead).filter(models.Lead.lead_id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    result = ai_service.calculate_lead_score(lead)

    score = models.LeadScore(
        lead_id=lead.lead_id,
        lead_score=result["lead_score"],
        conversion_probability=result["conversion_probability"],
        priority_level=result["priority_level"],
        scoring_factors=result["scoring_factors"],
    )
    db.add(score)
    db.commit()
    db.refresh(score)
    return score


@router.get("/{lead_id}/scores", response_model=List[schemas.LeadScoreOut])
def get_lead_scores(lead_id: int, db: Session = Depends(get_db)):
    """History of all scores generated for this lead."""
    scores = (
        db.query(models.LeadScore)
        .filter(models.LeadScore.lead_id == lead_id)
        .order_by(models.LeadScore.generated_at.desc())
        .all()
    )
    return scores


@router.get("/{lead_id}/score/latest", response_model=schemas.LeadScoreOut)
def get_latest_score(lead_id: int, db: Session = Depends(get_db)):
    """Just the most recent score - handy for the dashboard."""
    score = (
        db.query(models.LeadScore)
        .filter(models.LeadScore.lead_id == lead_id)
        .order_by(models.LeadScore.generated_at.desc())
        .first()
    )
    if not score:
        raise HTTPException(status_code=404, detail="No score found for this lead yet. Call POST /leads/{id}/score first.")
    return score
