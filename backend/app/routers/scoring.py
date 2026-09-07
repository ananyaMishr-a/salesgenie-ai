from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import models, schemas
from app.database import get_db
from app.services import ai_service
from app.auth_utils import get_current_user

router = APIRouter(prefix="/leads", tags=["4. Lead Scoring"])


@router.post("/{lead_id}/score", response_model=schemas.LeadScoreOut)
def score_lead(lead_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    lead = db.query(models.Lead).filter(models.Lead.lead_id == lead_id, models.Lead.user_id == current_user.user_id).first()
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
def get_lead_scores(lead_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    lead = db.query(models.Lead).filter(models.Lead.lead_id == lead_id, models.Lead.user_id == current_user.user_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
        
    scores = (
        db.query(models.LeadScore)
        .filter(models.LeadScore.lead_id == lead_id)
        .order_by(models.LeadScore.generated_at.desc())
        .all()
    )
    return scores


@router.get("/{lead_id}/score/latest", response_model=schemas.LeadScoreOut)
def get_latest_score(lead_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    lead = db.query(models.Lead).filter(models.Lead.lead_id == lead_id, models.Lead.user_id == current_user.user_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
        
    score = (
        db.query(models.LeadScore)
        .filter(models.LeadScore.lead_id == lead_id)
        .order_by(models.LeadScore.generated_at.desc())
        .first()
    )
    if not score:
        raise HTTPException(status_code=404, detail="No score found for this lead yet. Call POST /leads/{id}/score first.")
    return score
