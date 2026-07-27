import csv
import io
<<<<<<< HEAD
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app import models, schemas
=======
from typing import List

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app import models, schemas
from app.database import get_db
>>>>>>> 0a08b43 (Update backend code)

router = APIRouter(prefix="/leads", tags=["1. Lead Management"])


@router.post("/", response_model=schemas.LeadOut)
def create_lead(lead: schemas.LeadCreate, db: Session = Depends(get_db)):
<<<<<<< HEAD
    """Add a single new prospect/lead."""
=======
>>>>>>> 0a08b43 (Update backend code)
    new_lead = models.Lead(**lead.model_dump())
    db.add(new_lead)
    db.commit()
    db.refresh(new_lead)
    return new_lead


@router.get("/", response_model=List[schemas.LeadOut])
def list_leads(status: str = None, industry: str = None, db: Session = Depends(get_db)):
<<<<<<< HEAD
    """List all leads. Optionally filter by status or industry."""
=======
>>>>>>> 0a08b43 (Update backend code)
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
<<<<<<< HEAD
    """
    Bulk-import leads from a CSV file.
    Expected columns (header row): company_name, industry, contact_name, email,
    phone, company_size, annual_revenue, location, funding_stage, technology_stack
    """
=======
>>>>>>> 0a08b43 (Update backend code)
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Please upload a .csv file")

    content = await file.read()
    decoded = content.decode("utf-8")
    reader = csv.DictReader(io.StringIO(decoded))

    created_count = 0
    for row in reader:
        if not row.get("company_name"):
<<<<<<< HEAD
            continue  # skip rows without a company name
=======
            continue
>>>>>>> 0a08b43 (Update backend code)
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
