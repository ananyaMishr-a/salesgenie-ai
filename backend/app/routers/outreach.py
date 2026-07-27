<<<<<<< HEAD
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app import models, schemas
=======
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import models, schemas
from app.database import get_db
>>>>>>> 0a08b43 (Update backend code)
from app.services import ai_service

router = APIRouter(tags=["3. AI Outreach"])


@router.post("/leads/{lead_id}/generate-email", response_model=schemas.OutreachCampaignOut)
def generate_email(lead_id: int, db: Session = Depends(get_db)):
<<<<<<< HEAD
    """Generate a personalized cold email for this lead and save it as a campaign."""
=======
>>>>>>> 0a08b43 (Update backend code)
    lead = db.query(models.Lead).filter(models.Lead.lead_id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    result = ai_service.generate_outreach_email(lead)

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
<<<<<<< HEAD
    """All outreach campaigns across every lead (for a campaigns list page)."""
=======
>>>>>>> 0a08b43 (Update backend code)
    return db.query(models.OutreachCampaign).order_by(models.OutreachCampaign.created_at.desc()).all()


@router.put("/campaigns/{campaign_id}/status", response_model=schemas.OutreachCampaignOut)
def update_campaign_status(campaign_id: int, update: schemas.OutreachCampaignUpdate, db: Session = Depends(get_db)):
<<<<<<< HEAD
    """Update campaign status e.g. after the email is Sent / Opened / Replied."""
=======
>>>>>>> 0a08b43 (Update backend code)
    campaign = db.query(models.OutreachCampaign).filter(models.OutreachCampaign.campaign_id == campaign_id).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    campaign.campaign_status = update.campaign_status
    db.commit()
    db.refresh(campaign)
    return campaign
