import json
from datetime import datetime, timedelta
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import models, schemas
from app.database import get_db
from app.services import ai_service

router = APIRouter(tags=["5. Conversation Intelligence & CRM"])


@router.post("/leads/{lead_id}/conversations", response_model=schemas.InteractionOut)
def add_conversation(lead_id: int, payload: schemas.InteractionCreate, db: Session = Depends(get_db)):
    lead = db.query(models.Lead).filter(models.Lead.lead_id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    result = ai_service.summarize_conversation(payload.raw_transcript, lead=lead)

    interaction = models.SalesInteraction(
        lead_id=lead.lead_id,
        interaction_type=payload.interaction_type,
        raw_transcript=payload.raw_transcript,
        summary=result["summary"],
        discussion_points=json.dumps(result.get("discussion_points", [])),
        action_items=json.dumps(result.get("action_items", [])),
    )
    db.add(interaction)

    rec_title = f"Follow up with {lead.company_name}"
    rec_desc = result["summary"][:150] + "..." if len(result["summary"]) > 150 else result["summary"]
    rec = models.FollowUpRecommendation(
        lead_id=lead.lead_id,
        company_name=lead.company_name,
        title=rec_title,
        description=rec_desc,
        priority_level="High Priority" if lead.qualification_score >= 75 else "Medium Priority"
    )
    db.add(rec)

    act = models.ActivityLog(
        lead_id=lead.lead_id,
        activity_type="Meeting Analyzed",
        title=f"Analyzed {payload.interaction_type} transcript for {lead.company_name}",
        company=lead.company_name,
        timestamp=datetime.utcnow()
    )
    db.add(act)

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


@router.get("/conversations", response_model=List[schemas.InteractionOut])
def get_all_conversations(db: Session = Depends(get_db)):
    """
    Returns all sales interactions across all leads in the database.
    """
    return db.query(models.SalesInteraction).order_by(models.SalesInteraction.interaction_date.desc()).all()


@router.put("/conversations/{interaction_id}", response_model=schemas.InteractionOut)
def update_conversation(interaction_id: int, payload: dict, db: Session = Depends(get_db)):
    """
    Updates action items, summary, or transcript fields for a sales interaction in the database.
    """
    interaction = db.query(models.SalesInteraction).filter(models.SalesInteraction.interaction_id == interaction_id).first()
    if not interaction:
        raise HTTPException(status_code=404, detail="Conversation interaction not found")
    
    if "action_items" in payload:
        if isinstance(payload["action_items"], (list, dict)):
            interaction.action_items = json.dumps(payload["action_items"])
        else:
            interaction.action_items = str(payload["action_items"])
    if "notes" in payload:
        if isinstance(payload["notes"], (list, dict)):
            interaction.notes = json.dumps(payload["notes"])
        else:
            interaction.notes = str(payload["notes"])
    if "summary" in payload:
        interaction.summary = str(payload["summary"])
    
    db.commit()
    db.refresh(interaction)
    return interaction


@router.post("/leads/{lead_id}/crm-sync", response_model=schemas.CRMSyncOut)
def crm_sync(
    lead_id: int,
    crm_platform: str = "Salesforce",
    direction: str = "Outbound (SalesGenie → CRM)",
    changed_fields: str = "Lead Qualification Score, AI Insights, Contact Profile, Interaction Logs",
    db: Session = Depends(get_db)
):
    lead = db.query(models.Lead).filter(models.Lead.lead_id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    # Idempotency Check:
    # If a sync was performed for this lead & platform within the last 60 seconds,
    # return the existing recent log instead of creating a duplicate log entry!
    cutoff = datetime.utcnow() - timedelta(seconds=60)
    recent = (
        db.query(models.CRMSyncLog)
        .filter(
            models.CRMSyncLog.lead_id == lead_id,
            models.CRMSyncLog.crm_platform == crm_platform,
            models.CRMSyncLog.timestamp >= cutoff
        )
        .order_by(models.CRMSyncLog.timestamp.desc())
        .first()
    )

    if recent:
        return recent

    log = models.CRMSyncLog(
        lead_id=lead.lead_id,
        crm_platform=crm_platform,
        sync_status="Synced",
        direction=direction,
        changed_fields=changed_fields,
        timestamp=datetime.utcnow()
    )
    db.add(log)

    act = models.ActivityLog(
        lead_id=lead.lead_id,
        activity_type="CRM Sync",
        title=f"Synced {lead.company_name} with {crm_platform}",
        company=lead.company_name,
        timestamp=datetime.utcnow()
    )
    db.add(act)

    db.commit()
    db.refresh(log)
    return log


@router.get("/crm-sync-logs", response_model=List[schemas.CRMSyncOut])
def get_crm_logs(db: Session = Depends(get_db)):
    return db.query(models.CRMSyncLog).order_by(models.CRMSyncLog.timestamp.desc()).all()
