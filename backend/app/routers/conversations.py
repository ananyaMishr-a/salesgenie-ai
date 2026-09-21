import json
from datetime import datetime, timedelta
from typing import List

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
import os
import shutil
import pypdf

from app import models, schemas
from app.database import get_db
from app.services import ai_service
from app.auth_utils import get_current_user

router = APIRouter(tags=["5. Conversation Intelligence & CRM"])


@router.post("/leads/{lead_id}/conversations", response_model=schemas.InteractionOut)
def add_conversation(lead_id: int, payload: schemas.InteractionCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    lead = db.query(models.Lead).filter(models.Lead.lead_id == lead_id, models.Lead.user_id == current_user.user_id).first()
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

    action_items = result.get("action_items", [])
    if action_items and len(action_items) > 0:
        first_item = action_items[0]
        # action_items can be a list of strings OR a list of dicts with 'description' key
        if isinstance(first_item, dict):
            item_text = first_item.get("description", str(first_item))
        else:
            item_text = str(first_item)
        rec_title = f"Follow up on Action Item for {lead.company_name}"
        rec_desc = f"{item_text} Schedule a quick sync with {lead.contact_name or 'the team'} to discuss execution."
    else:
        rec_title = f"Schedule Follow-up with {lead.company_name}"
        rec_desc = f"Based on the recent {payload.interaction_type.lower()}, reach out to {lead.contact_name or 'the stakeholder'} to align on technical requirements and next steps."

    rec = models.FollowUpRecommendation(
        lead_id=lead.lead_id,
        company_name=lead.company_name,
        title=rec_title,
        description=rec_desc,
        priority_level="High Priority" if (lead.qualification_score or 0) >= 75 else "Medium Priority"
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

@router.post("/leads/{lead_id}/conversations/upload", response_model=schemas.InteractionOut)
def upload_conversation_transcript(
    lead_id: int, 
    interaction_type: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(get_current_user)
):
    lead = db.query(models.Lead).filter(models.Lead.lead_id == lead_id, models.Lead.user_id == current_user.user_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
        
    transcript_text = ""
    
    # Save file temporarily
    temp_dir = "temp_uploads"
    os.makedirs(temp_dir, exist_ok=True)
    file_path = os.path.join(temp_dir, file.filename)
    
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        content_type = file.content_type or ""
        
        if file.filename.lower().endswith('.pdf') or "pdf" in content_type:
            try:
                reader = pypdf.PdfReader(file_path)
                for page in reader.pages:
                    transcript_text += page.extract_text() + "\n"
            except Exception as e:
                raise HTTPException(status_code=400, detail=f"Failed to parse PDF: {str(e)}")
        elif file.filename.lower().endswith(('.mp3', '.m4a', '.wav', '.ogg')) or "audio" in content_type:
            try:
                transcript_text = ai_service.transcribe_audio(file_path)
            except Exception as e:
                raise HTTPException(status_code=500, detail=f"Failed to transcribe audio: {str(e)}")
        else:
            # Assume text
            try:
                with open(file_path, "r", encoding="utf-8") as text_file:
                    transcript_text = text_file.read()
            except UnicodeDecodeError:
                raise HTTPException(status_code=400, detail="Unsupported file format or encoding.")
    finally:
        if os.path.exists(file_path):
            os.remove(file_path)
            
    if not transcript_text.strip():
        raise HTTPException(status_code=400, detail="Could not extract any text from the uploaded file.")
        
    result = ai_service.summarize_conversation(transcript_text, lead=lead)

    interaction = models.SalesInteraction(
        lead_id=lead.lead_id,
        interaction_type=interaction_type,
        raw_transcript=transcript_text,
        summary=result["summary"],
        discussion_points=json.dumps(result.get("discussion_points", [])),
        action_items=json.dumps(result.get("action_items", [])),
    )
    db.add(interaction)
    
    action_items = result.get("action_items", [])
    if action_items and len(action_items) > 0:
        first_item = action_items[0]
        if isinstance(first_item, dict):
            item_text = first_item.get("description", str(first_item))
        else:
            item_text = str(first_item)
        rec_title = f"Follow up on Action Item for {lead.company_name}"
        rec_desc = f"{item_text} Schedule a quick sync with {lead.contact_name or 'the team'} to discuss execution."
    else:
        rec_title = f"Schedule Follow-up with {lead.company_name}"
        rec_desc = f"Based on the recent {interaction_type.lower()}, reach out to {lead.contact_name or 'the stakeholder'} to align on technical requirements and next steps."

    rec = models.FollowUpRecommendation(
        lead_id=lead.lead_id,
        company_name=lead.company_name,
        title=rec_title,
        description=rec_desc,
        priority_level="High Priority" if (lead.qualification_score or 0) >= 75 else "Medium Priority"
    )
    db.add(rec)

    act = models.ActivityLog(
        lead_id=lead.lead_id,
        activity_type="Meeting Analyzed",
        title=f"Analyzed {interaction_type} transcript for {lead.company_name}",
        company=lead.company_name,
        timestamp=datetime.utcnow()
    )
    db.add(act)

    db.commit()
    db.refresh(interaction)
    return interaction


@router.get("/leads/{lead_id}/conversations", response_model=List[schemas.InteractionOut])
def get_conversations(lead_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    # Verify lead ownership
    lead = db.query(models.Lead).filter(models.Lead.lead_id == lead_id, models.Lead.user_id == current_user.user_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
        
    interactions = (
        db.query(models.SalesInteraction)
        .filter(models.SalesInteraction.lead_id == lead_id)
        .order_by(models.SalesInteraction.interaction_date.desc())
        .all()
    )
    return interactions


@router.get("/conversations", response_model=List[schemas.InteractionOut])
def get_all_conversations(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    """
    Returns all sales interactions across all leads for the current user.
    """
    return db.query(models.SalesInteraction).join(models.Lead).filter(models.Lead.user_id == current_user.user_id).order_by(models.SalesInteraction.interaction_date.desc()).all()


@router.put("/conversations/{interaction_id}", response_model=schemas.InteractionOut)
def update_conversation(interaction_id: int, payload: dict, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    """
    Updates action items, summary, or transcript fields for a sales interaction in the database.
    """
    interaction = db.query(models.SalesInteraction).join(models.Lead).filter(models.SalesInteraction.interaction_id == interaction_id, models.Lead.user_id == current_user.user_id).first()
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
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    lead = db.query(models.Lead).filter(models.Lead.lead_id == lead_id, models.Lead.user_id == current_user.user_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    from app.services.crm_service import push_lead_to_salesforce
    try:
        # Call the real Salesforce API integration
        sf_result = push_lead_to_salesforce(lead)
    except Exception as e:
        # Pass up the HTTP exception from the service
        raise e

    # Log successful sync
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
        title=f"Synced {lead.company_name} with {crm_platform} (SF_ID: {sf_result.get('sf_id')})",
        company=lead.company_name,
        timestamp=datetime.utcnow()
    )
    db.add(act)

    db.commit()
    db.refresh(log)
    return log


@router.get("/crm-sync-logs", response_model=List[schemas.CRMSyncOut])
def get_crm_logs(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return db.query(models.CRMSyncLog).join(models.Lead).filter(models.Lead.user_id == current_user.user_id).order_by(models.CRMSyncLog.timestamp.desc()).all()
