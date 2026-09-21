from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from app import models, schemas
from app.database import get_db
from app.auth_utils import get_current_user

router = APIRouter(prefix="/dashboard", tags=["6. Dashboard & Analytics"])


@router.get("/overview", response_model=schemas.DashboardOverview)
def get_overview(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    total_leads = db.query(models.Lead).filter(models.Lead.user_id == current_user.user_id).count()

    closed_won = db.query(models.Lead).filter(models.Lead.lead_status == "Closed Won", models.Lead.user_id == current_user.user_id).count()
    conversion_rate = round((closed_won / total_leads) * 100, 1) if total_leads else 0.0

    pipeline_value = db.query(func.coalesce(func.sum(models.Lead.deal_value), 0.0)).filter(models.Lead.user_id == current_user.user_id).scalar()

    status_counts = (
        db.query(models.Lead.lead_status, func.count(models.Lead.lead_id))
        .filter(models.Lead.user_id == current_user.user_id)
        .group_by(models.Lead.lead_status)
        .all()
    )
    leads_by_status = {status: count for status, count in status_counts}

    avg_score = db.query(func.avg(models.LeadScore.lead_score)).join(models.Lead).filter(models.Lead.user_id == current_user.user_id).scalar()
    avg_lead_score = round(avg_score, 1) if avg_score else 0.0

    return schemas.DashboardOverview(
        total_leads=total_leads,
        conversion_rate=conversion_rate,
        pipeline_value=pipeline_value,
        leads_by_status=leads_by_status,
        avg_lead_score=avg_lead_score,
    )


@router.get("/pipeline")
def get_pipeline(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    stages = ["New", "Qualified", "Proposal", "Negotiation", "Closed Won"]
    pipeline = {s: [] for s in stages}
    all_leads = db.query(models.Lead).filter(models.Lead.user_id == current_user.user_id).all()
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
def get_kpis(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    total_leads = db.query(models.Lead).filter(models.Lead.user_id == current_user.user_id).count()
    closed_won = db.query(models.Lead).filter(models.Lead.lead_status == "Closed Won", models.Lead.user_id == current_user.user_id).count()
    conversion_rate = round((closed_won / total_leads) * 100, 1) if total_leads > 0 else 0.0

    sum_deal = db.query(func.coalesce(func.sum(models.Lead.deal_value), 0.0)).filter(models.Lead.user_id == current_user.user_id).scalar() or 0.0

    if sum_deal >= 1000000:
        fmt_pipeline = f"${sum_deal/1000000:.1f}M"
    elif sum_deal >= 1000:
        fmt_pipeline = f"${sum_deal/1000:.1f}K"
    else:
        fmt_pipeline = f"${sum_deal:,.0f}"

    all_leads = db.query(models.Lead).filter(models.Lead.user_id == current_user.user_id).all()
    response_times = []
    sales_cycles = []

    for l in all_leads:
        first_act = db.query(models.ActivityLog).filter(models.ActivityLog.lead_id == l.lead_id).order_by(models.ActivityLog.timestamp.asc()).first()
        if first_act and first_act.timestamp and l.created_at:
            diff_hours = (first_act.timestamp - l.created_at).total_seconds() / 3600.0
            if diff_hours > 0:
                response_times.append(diff_hours)
        
        stage_lower = (l.stage or l.lead_status or "").lower().replace(" ", "-")
        is_closed_won = stage_lower in ["closed-won", "closed_won", "won"]
        if is_closed_won and l.updated_at and l.created_at:
            diff_days = (l.updated_at - l.created_at).total_seconds() / (3600.0 * 24.0)
            if diff_days >= 0:
                sales_cycles.append(diff_days)
    
    if response_times:
        avg_resp = sum(response_times) / len(response_times)
        if avg_resp < 1.0:
            avg_response_time = f"{int(avg_resp * 60)} mins"
        else:
            avg_response_time = f"{avg_resp:.1f} hrs"
        response_change = f"Across {len(response_times)} leads"
    else:
        avg_response_time = "0 mins"
        response_change = "No interactions logged yet"
        
    if sales_cycles:
        avg_cycle = sum(sales_cycles) / len(sales_cycles)
        avg_sales_cycle = f"{avg_cycle:.1f} days"
        cycle_change = f"From {len(sales_cycles)} closed deals"
    else:
        avg_sales_cycle = "0 days"
        cycle_change = f"{total_leads} active prospects (0 closed)"

    return {
        "conversion_rate": f"{conversion_rate}%",
        "conversion_change": f"{closed_won} of {total_leads} leads closed",
        "pipeline_value": fmt_pipeline,
        "pipeline_change": "Total deal value across stages",
        "avg_response_time": avg_response_time,
        "response_change": response_change,
        "avg_sales_cycle": avg_sales_cycle,
        "cycle_change": cycle_change
    }


from datetime import timedelta

def format_ist(dt):
    if not dt:
        return "Not provided"
    # Convert UTC to IST (+5:30)
    ist_dt = dt + timedelta(hours=5, minutes=30)
    return ist_dt.strftime("%d %b %Y, %I:%M %p IST")


@router.get("/recommendations")
def get_recommendations(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    recs = db.query(models.FollowUpRecommendation).join(models.Lead).filter(models.Lead.user_id == current_user.user_id).order_by(models.FollowUpRecommendation.created_at.desc()).all()
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
def get_recent_activities(limit: int = 15, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    activities = []

    # 1. Custom user notes persisted in DB
    custom_acts = db.query(models.ActivityLog).join(models.Lead).filter(models.Lead.user_id == current_user.user_id).order_by(models.ActivityLog.timestamp.desc()).limit(10).all()
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
    leads = db.query(models.Lead).filter(models.Lead.user_id == current_user.user_id).order_by(models.Lead.created_at.desc()).limit(10).all()
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
    interactions = db.query(models.SalesInteraction, models.Lead).join(models.Lead, models.SalesInteraction.lead_id == models.Lead.lead_id).filter(models.Lead.user_id == current_user.user_id).order_by(models.SalesInteraction.interaction_date.desc()).limit(10).all()
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
    crm_logs = db.query(models.CRMSyncLog, models.Lead).join(models.Lead, models.CRMSyncLog.lead_id == models.Lead.lead_id).filter(models.Lead.user_id == current_user.user_id).order_by(models.CRMSyncLog.timestamp.desc()).limit(10).all()
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
def create_activity(payload: schemas.ActivityCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if payload.lead_id:
        lead = db.query(models.Lead).filter(models.Lead.lead_id == payload.lead_id, models.Lead.user_id == current_user.user_id).first()
        if not lead:
            raise HTTPException(status_code=403, detail="Not authorized")
            
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
def get_top_leads(limit: int = 5, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    results = (
        db.query(models.Lead, models.LeadScore)
        .join(models.LeadScore, models.Lead.lead_id == models.LeadScore.lead_id)
        .filter(models.Lead.user_id == current_user.user_id)
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
