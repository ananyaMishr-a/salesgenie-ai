from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import models, schemas
from app.database import get_db
from app.services import ai_service
from app.auth_utils import get_current_user

router = APIRouter(tags=["3. AI Outreach"])


@router.post("/leads/{lead_id}/generate-email", response_model=schemas.OutreachCampaignOut)
def generate_email(lead_id: int, req: schemas.OutreachGenerateRequest, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    lead = db.query(models.Lead).filter(models.Lead.lead_id == lead_id, models.Lead.user_id == current_user.user_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    result = ai_service.generate_outreach_email(lead, tone=req.tone, strategy=req.strategy, db=db)

    campaign = models.OutreachCampaign(
        lead_id=lead.lead_id,
        email_subject=result["subject"],
        email_content=result["content"],
        campaign_status="Draft",
    )
    db.add(campaign)
    db.commit()
    db.refresh(campaign)
    return campaign


@router.get("/leads/{lead_id}/campaigns", response_model=List[schemas.OutreachCampaignOut])
def get_lead_campaigns(lead_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    lead = db.query(models.Lead).filter(models.Lead.lead_id == lead_id, models.Lead.user_id == current_user.user_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
        
    campaigns = (
        db.query(models.OutreachCampaign)
        .filter(models.OutreachCampaign.lead_id == lead_id)
        .order_by(models.OutreachCampaign.created_at.desc())
        .all()
    )
    return campaigns


@router.get("/campaigns", response_model=List[schemas.OutreachCampaignOut])
def get_all_campaigns(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return db.query(models.OutreachCampaign).join(models.Lead).filter(models.Lead.user_id == current_user.user_id).order_by(models.OutreachCampaign.created_at.desc()).all()


@router.put("/campaigns/{campaign_id}/status", response_model=schemas.OutreachCampaignOut)
def update_campaign_status(campaign_id: int, update: schemas.OutreachCampaignUpdate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    campaign = db.query(models.OutreachCampaign).join(models.Lead).filter(models.OutreachCampaign.campaign_id == campaign_id, models.Lead.user_id == current_user.user_id).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    if update.campaign_status is not None:
        campaign.campaign_status = update.campaign_status
    if update.email_subject is not None:
        campaign.email_subject = update.email_subject
    if update.email_content is not None:
        campaign.email_content = update.email_content
    db.commit()
    db.refresh(campaign)
    return campaign


@router.get("/leads/{lead_id}/strategy")
def get_outreach_strategy(lead_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    lead = db.query(models.Lead).filter(models.Lead.lead_id == lead_id, models.Lead.user_id == current_user.user_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    # Check if a strategy already exists for this lead
    import json
    existing_strategy = db.query(models.OutreachStrategy).filter(
        models.OutreachStrategy.lead_id == lead_id
    ).order_by(models.OutreachStrategy.generated_at.desc()).first()

    if existing_strategy:
        try:
            return json.loads(existing_strategy.strategy_json)
        except Exception:
            pass

    # If no strategy exists, generate one, save it, and return it
    strategy = ai_service.generate_outreach_strategy(lead)
    
    new_strat_record = models.OutreachStrategy(
        lead_id=lead.lead_id,
        strategy_json=json.dumps(strategy)
    )
    db.add(new_strat_record)
    db.commit()
    
    return strategy
