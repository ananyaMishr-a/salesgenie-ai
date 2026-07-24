import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app import models, schemas
from app.services import ai_service

router = APIRouter(tags=["5. Conversation Intelligence & CRM"])


@router.post("/leads/{lead_id}/conversations", response_model=schemas.InteractionOut)
def add_conversation(lead_id: int, payload: schemas.InteractionCreate, db: Session = Depends(get_db)):
    """
    Submit a raw call/meeting transcript. The AI service summarizes it
    and extracts action items automatically.
    """
    lead = db.query(models.Lead).filter(models.Lead.lead_id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    result = ai_service.summarize_conversation(payload.raw_transcript)

    interaction = models.SalesInteraction(
        lead_id=lead.lead_id,
        interaction_type=payload.interaction_type,
        raw_transcript=payload.raw_transcript,
        summary=result["summary"],
        action_items=json.dumps(result["action_items"]),
    )
    db.add(interaction)
    db.commit()
    db.refresh(interaction)
    return interaction


@router.get("/leads/{lead_id}/conversations", response_model=List[schemas.InteractionOut])
def get_conversations(lead_id: int, db: Session = Depends(get_db)):
    interactions = (
        db.query(models.SalesInteraction)
        .filter(models.SalesInteraction.lead_id == lead_id)
        .order_by(models.SalesInteraction.interaction_date.desc())
        .all()
    )
    return interactions


@router.post("/leads/{lead_id}/crm-sync", response_model=schemas.CRMSyncOut)
def crm_sync(lead_id: int, crm_platform: str = "Salesforce", db: Session = Depends(get_db)):
    """Simulate pushing this lead's latest data to a CRM platform."""
    lead = db.query(models.Lead).filter(models.Lead.lead_id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    log = models.CRMSyncLog(
        lead_id=lead.lead_id,
        crm_platform=crm_platform,
        sync_status="Synced",
    )
    db.add(log)
    db.commit()
    db.refresh(log)
    return log


@router.get("/crm-sync-logs", response_model=List[schemas.CRMSyncOut])
def get_crm_logs(db: Session = Depends(get_db)):
    return db.query(models.CRMSyncLog).order_by(models.CRMSyncLog.timestamp.desc()).all()
