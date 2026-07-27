from fastapi import APIRouter, Depends
<<<<<<< HEAD
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app import models, schemas
=======
from sqlalchemy import func
from sqlalchemy.orm import Session

from app import models, schemas
from app.database import get_db
>>>>>>> 0a08b43 (Update backend code)

router = APIRouter(prefix="/dashboard", tags=["6. Dashboard & Analytics"])


@router.get("/overview", response_model=schemas.DashboardOverview)
def get_overview(db: Session = Depends(get_db)):
    total_leads = db.query(models.Lead).count()

    closed_won = db.query(models.Lead).filter(models.Lead.lead_status == "Closed Won").count()
    conversion_rate = round((closed_won / total_leads) * 100, 1) if total_leads else 0.0

    pipeline_value = db.query(func.coalesce(func.sum(models.Lead.deal_value), 0.0)).scalar()

<<<<<<< HEAD
    # count leads grouped by status, e.g. {"New": 5, "Qualified": 3, ...}
=======
>>>>>>> 0a08b43 (Update backend code)
    status_counts = (
        db.query(models.Lead.lead_status, func.count(models.Lead.lead_id))
        .group_by(models.Lead.lead_status)
        .all()
    )
    leads_by_status = {status: count for status, count in status_counts}

    avg_score = db.query(func.avg(models.LeadScore.lead_score)).scalar()
    avg_lead_score = round(avg_score, 1) if avg_score else 0.0

    return schemas.DashboardOverview(
        total_leads=total_leads,
        conversion_rate=conversion_rate,
        pipeline_value=pipeline_value,
        leads_by_status=leads_by_status,
        avg_lead_score=avg_lead_score,
    )


@router.get("/pipeline")
def get_pipeline(db: Session = Depends(get_db)):
<<<<<<< HEAD
    """
    Kanban-style pipeline view: leads grouped by stage, each with
    company name and deal value - matches the "Sales Pipeline" board
    shown in the project's dashboard mockup.
    """
=======
>>>>>>> 0a08b43 (Update backend code)
    stages = ["New", "Qualified", "Proposal", "Negotiation", "Closed Won", "Closed Lost"]
    pipeline = {}
    for stage in stages:
        leads = db.query(models.Lead).filter(models.Lead.lead_status == stage).all()
        pipeline[stage] = [
            {"lead_id": l.lead_id, "company_name": l.company_name, "deal_value": l.deal_value}
            for l in leads
        ]
    return pipeline


@router.get("/top-leads")
def get_top_leads(limit: int = 5, db: Session = Depends(get_db)):
<<<<<<< HEAD
    """Top N leads ranked by their latest lead score (highest conversion probability first)."""
=======
>>>>>>> 0a08b43 (Update backend code)
    results = (
        db.query(models.Lead, models.LeadScore)
        .join(models.LeadScore, models.Lead.lead_id == models.LeadScore.lead_id)
        .order_by(models.LeadScore.lead_score.desc())
        .limit(limit)
        .all()
    )
    return [
        {
            "lead_id": lead.lead_id,
            "company_name": lead.company_name,
            "lead_score": score.lead_score,
            "conversion_probability": score.conversion_probability,
            "priority_level": score.priority_level,
        }
        for lead, score in results
    ]
