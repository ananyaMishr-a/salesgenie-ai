from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app import models, schemas
from app.database import get_db

router = APIRouter(prefix="/dashboard", tags=["6. Dashboard & Analytics"])


@router.get("/overview", response_model=schemas.DashboardOverview)
def get_overview(db: Session = Depends(get_db)):
    total_leads = db.query(models.Lead).count()

    closed_won = db.query(models.Lead).filter(models.Lead.lead_status == "Closed Won").count()
    conversion_rate = round((closed_won / total_leads) * 100, 1) if total_leads else 0.0

    pipeline_value = db.query(func.coalesce(func.sum(models.Lead.deal_value), 0.0)).scalar()

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
    stages = ["New", "Qualified", "Proposal", "Negotiation", "Closed Won"]
    pipeline = {s: [] for s in stages}
    all_leads = db.query(models.Lead).all()
    for l in all_leads:
        st = (l.stage or l.lead_status or "new").lower().replace(" ", "-")
        if st in ["new", "lead"]:
            col_name = "New"
        elif st in ["qualified", "qualify"]:
            col_name = "Qualified"
        elif st in ["proposal"]:
            col_name = "Proposal"
        elif st in ["negotiation", "negotiate"]:
            col_name = "Negotiation"
        elif st in ["closed-won", "closed_won", "won"]:
            col_name = "Closed Won"
        else:
            col_name = "New"

        pipeline[col_name].append({
            "lead_id": l.lead_id,
            "company_name": l.company_name,
            "contact_name": l.contact_name,
            "stage": l.stage or "new",
            "deal_value": l.deal_value or 0.0
        })
    return pipeline


@router.get("/kpis")
def get_kpis(db: Session = Depends(get_db)):
    """
    Milestone 4: Returns top sales analytics metrics computed dynamically from DB data.
    """
    total_leads = db.query(models.Lead).count()
    closed_won = db.query(models.Lead).filter(models.Lead.lead_status == "Closed Won").count()
    conversion_rate = round((closed_won / total_leads) * 100, 1) if total_leads > 0 else 0.0

    sum_deal = db.query(func.coalesce(func.sum(models.Lead.deal_value), 0.0)).scalar() or 0.0

    if sum_deal >= 1000000:
        fmt_pipeline = f"${sum_deal/1000000:.1f}M"
    elif sum_deal >= 1000:
        fmt_pipeline = f"${sum_deal/1000:.1f}K"
    else:
        fmt_pipeline = f"${sum_deal:,.0f}"

    return {
        "conversion_rate": f"{conversion_rate}%",
        "conversion_change": f"{closed_won} of {total_leads} leads closed",
        "pipeline_value": fmt_pipeline,
        "pipeline_change": "Total deal value across stages",
        "avg_response_time": "Real-time AI",
        "response_change": "Automated workflow",
        "avg_sales_cycle": "Active pipeline",
        "cycle_change": f"{total_leads} total active prospects"
    }


from datetime import timedelta

def format_ist(dt):
    if not dt:
        return "Not provided"
    # Convert UTC to IST (+5:30)
    ist_dt = dt + timedelta(hours=5, minutes=30)
    return ist_dt.strftime("%d %b %Y, %I:%M %p IST")


@router.get("/recommendations")
def get_recommendations(db: Session = Depends(get_db)):
    """
    Milestone 4: Returns AI-generated automated follow-up recommendations.
    If database is empty, returns empty list so UI displays clean empty state.
    """
    recs = db.query(models.FollowUpRecommendation).order_by(models.FollowUpRecommendation.created_at.desc()).all()
    return [
        {
            "id": f"rec-{r.recommendation_id}",
            "company_name": r.company_name,
            "title": r.title,
            "description": r.description,
            "priority_level": r.priority_level,
            "time_ago": format_ist(r.created_at)
        }
        for r in recs
    ]


@router.get("/activities")
def get_recent_activities(limit: int = 15, db: Session = Depends(get_db)):
    """
    Returns real persisted timeline activities compiled directly from database records formatted in IST.
    If database is empty, returns empty list.
    """
    activities = []

    # 1. Custom user notes persisted in DB
    custom_acts = db.query(models.ActivityLog).order_by(models.ActivityLog.timestamp.desc()).limit(10).all()
    for act in custom_acts:
        if act.timestamp:
            activities.append({
                "id": f"act-custom-{act.activity_id}",
                "type": act.activity_type or "Note Added",
                "title": act.title,
                "company": act.company or "General",
                "timestamp": act.timestamp.isoformat(),
                "timeAgo": format_ist(act.timestamp),
                "icon": "StickyNote"
            })

    # 2. Lead creation & updates
    leads = db.query(models.Lead).order_by(models.Lead.created_at.desc()).limit(10).all()
    for l in leads:
        if l.created_at:
            activities.append({
                "id": f"act-lead-{l.lead_id}",
                "type": "Lead Created",
                "title": f"New lead created: {l.contact_name or l.company_name} ({l.lead_status})",
                "company": l.company_name,
                "timestamp": l.created_at.isoformat(),
                "timeAgo": format_ist(l.created_at),
                "icon": "UserCheck"
            })
        if l.updated_at and l.updated_at != l.created_at:
            activities.append({
                "id": f"act-lead-upd-{l.lead_id}",
                "type": "Lead Updated",
                "title": f"Updated lead details for {l.company_name}",
                "company": l.company_name,
                "timestamp": l.updated_at.isoformat(),
                "timeAgo": format_ist(l.updated_at),
                "icon": "StickyNote"
            })

    # 3. Sales interactions (conversations)
    interactions = db.query(models.SalesInteraction, models.Lead).join(models.Lead, models.SalesInteraction.lead_id == models.Lead.lead_id).order_by(models.SalesInteraction.interaction_date.desc()).limit(10).all()
    for inter, l in interactions:
        if inter.interaction_date:
            activities.append({
                "id": f"act-inter-{inter.interaction_id}",
                "type": "Transcript Analyzed",
                "title": f"Analyzed call transcript for {l.contact_name or l.company_name}",
                "company": l.company_name,
                "timestamp": inter.interaction_date.isoformat(),
                "timeAgo": format_ist(inter.interaction_date),
                "icon": "FileText"
            })

    # 4. CRM Sync logs
    crm_logs = db.query(models.CRMSyncLog, models.Lead).join(models.Lead, models.CRMSyncLog.lead_id == models.Lead.lead_id).order_by(models.CRMSyncLog.timestamp.desc()).limit(10).all()
    for log, l in crm_logs:
        if log.timestamp:
            activities.append({
                "id": f"act-crm-{log.sync_id}",
                "type": "CRM Synced",
                "title": f"CRM sync completed ({log.crm_platform}) for {l.company_name}",
                "company": l.company_name,
                "timestamp": log.timestamp.isoformat(),
                "timeAgo": format_ist(log.timestamp),
                "icon": "MailCheck"
            })

    # Sort all by timestamp descending
    activities.sort(key=lambda x: x["timestamp"], reverse=True)
    return activities[:limit]


@router.post("/activities", response_model=schemas.ActivityOut)
def create_activity(payload: schemas.ActivityCreate, db: Session = Depends(get_db)):
    """
    Persists a custom timeline activity / note directly to SQLite database.
    """
    act = models.ActivityLog(
        lead_id=payload.lead_id,
        activity_type=payload.activity_type,
        title=payload.title,
        company=payload.company
    )
    db.add(act)
    db.commit()
    db.refresh(act)
    return act


@router.get("/top-leads")
def get_top_leads(limit: int = 5, db: Session = Depends(get_db)):
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
