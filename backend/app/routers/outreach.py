from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import models, schemas
from app.database import get_db
from app.services import ai_service

router = APIRouter(tags=["3. AI Outreach"])


@router.post("/leads/{lead_id}/generate-email", response_model=schemas.OutreachCampaignOut)
def generate_email(lead_id: int, req: schemas.OutreachGenerateRequest, db: Session = Depends(get_db)):
    lead = db.query(models.Lead).filter(models.Lead.lead_id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    result = ai_service.generate_outreach_email(lead, tone=req.tone)

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
def get_lead_campaigns(lead_id: int, db: Session = Depends(get_db)):
    campaigns = (
        db.query(models.OutreachCampaign)
        .filter(models.OutreachCampaign.lead_id == lead_id)
        .order_by(models.OutreachCampaign.created_at.desc())
        .all()
    )
    return campaigns


@router.get("/campaigns", response_model=List[schemas.OutreachCampaignOut])
def get_all_campaigns(db: Session = Depends(get_db)):
    return db.query(models.OutreachCampaign).order_by(models.OutreachCampaign.created_at.desc()).all()


@router.put("/campaigns/{campaign_id}/status", response_model=schemas.OutreachCampaignOut)
def update_campaign_status(campaign_id: int, update: schemas.OutreachCampaignUpdate, db: Session = Depends(get_db)):
    campaign = db.query(models.OutreachCampaign).filter(models.OutreachCampaign.campaign_id == campaign_id).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    campaign.campaign_status = update.campaign_status
    db.commit()
    db.refresh(campaign)
    return campaign


@router.get("/leads/{lead_id}/strategy")
def get_outreach_strategy(lead_id: int, db: Session = Depends(get_db)):
    lead = db.query(models.Lead).filter(models.Lead.lead_id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    
    strategy = ai_service.generate_outreach_strategy(lead)
    return strategy
