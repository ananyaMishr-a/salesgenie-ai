import csv
import io
import sys
import os
from typing import List

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app import models, schemas
from app.database import get_db

router = APIRouter(prefix="/leads", tags=["1. Lead Management"])


@router.post("/", response_model=schemas.LeadOut)
def create_lead(lead: schemas.LeadCreate, db: Session = Depends(get_db)):
    new_lead = models.Lead(**lead.model_dump())
    db.add(new_lead)
    db.commit()
    db.refresh(new_lead)
    return new_lead


@router.get("/", response_model=List[schemas.LeadOut])
def list_leads(status: str = None, industry: str = None, db: Session = Depends(get_db)):
    query = db.query(models.Lead)
    if status:
        query = query.filter(models.Lead.lead_status == status)
    if industry:
        query = query.filter(models.Lead.industry == industry)
    return query.order_by(models.Lead.created_at.desc()).all()


@router.get("/{lead_id}", response_model=schemas.LeadOut)
def get_lead(lead_id: int, db: Session = Depends(get_db)):
    lead = db.query(models.Lead).filter(models.Lead.lead_id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    return lead


@router.put("/{lead_id}", response_model=schemas.LeadOut)
def update_lead(lead_id: int, updates: schemas.LeadUpdate, db: Session = Depends(get_db)):
    lead = db.query(models.Lead).filter(models.Lead.lead_id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    for field, value in updates.model_dump(exclude_unset=True).items():
        setattr(lead, field, value)
    db.commit()
    db.refresh(lead)
    return lead


@router.delete("/{lead_id}")
def delete_lead(lead_id: int, db: Session = Depends(get_db)):
    lead = db.query(models.Lead).filter(models.Lead.lead_id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    db.delete(lead)
    db.commit()
    return {"message": f"Lead {lead_id} deleted successfully"}


@router.post("/import-csv")
async def import_leads_csv(file: UploadFile = File(...), db: Session = Depends(get_db)):
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Please upload a .csv file")

    content = await file.read()
    decoded = content.decode("utf-8")
    reader = csv.DictReader(io.StringIO(decoded))

    created_count = 0
    for row in reader:
        if not row.get("company_name"):
            continue
        lead = models.Lead(
            company_name=row.get("company_name"),
            industry=row.get("industry"),
            contact_name=row.get("contact_name"),
            email=row.get("email"),
            phone=row.get("phone"),
            company_size=row.get("company_size"),
            annual_revenue=row.get("annual_revenue"),
            location=row.get("location"),
            funding_stage=row.get("funding_stage"),
            technology_stack=row.get("technology_stack"),
        )
        db.add(lead)
        created_count += 1

    db.commit()
    return {"message": f"Imported {created_count} leads successfully"}


@router.post("/enrich", response_model=schemas.CompanyEnrichResponse)
def enrich_lead_data(req: schemas.CompanyEnrichRequest):
    sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../")))
    from ai.company_research_agent import analyze_company
    
    # We will pass the company_name to the standalone AI agent
    try:
        insights = analyze_company(req.company_name)
        return {
            "industry": insights.industry,
            "company_size": insights.company_size,
            "tech_stack": insights.tech_stack,
            "funding_stage": insights.funding_stage,
            "growth_signals": insights.growth_signals,
            "qualification_score": insights.qualification_score,
            "reasoning": insights.reasoning
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
