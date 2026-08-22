import os
import json
from datetime import datetime
from sqlalchemy.orm import Session
from app.database import SessionLocal, engine
from app import models

def auto_seed_leads():
    db: Session = SessionLocal()
    try:
        count = db.query(models.Lead).count()
        # Seed initial pipeline data if database is empty (0 leads)
        if count == 0:
            print("[SalesGenie Seed] Populating initial dataset across all modules...")
            
            sample_leads = [
                # New Leads
                {"company_name": "TechStart Inc", "industry": "Technology", "contact_name": "Sarah Johnson", "email": "sarah@techstart.io", "phone": "555-0192", "company_size": "50-100", "annual_revenue": "$10M", "location": "San Francisco, CA", "funding_stage": "Series A", "technology_stack": "AWS, Python, React", "lead_status": "New", "deal_value": 85000.0},
                {"company_name": "Global Systems", "industry": "Enterprise Software", "contact_name": "Michael Brown", "email": "mbrown@globalsys.com", "phone": "555-0184", "company_size": "500-1000", "annual_revenue": "$45M", "location": "Chicago, IL", "funding_stage": "Series C", "technology_stack": "Kubernetes, PostgreSQL", "lead_status": "New", "deal_value": 65000.0},
                
                # Qualified Leads
                {"company_name": "DataFlow Systems", "industry": "Data Analytics", "contact_name": "Emily Davis", "email": "emily@dataflow.io", "phone": "555-0173", "company_size": "100-250", "annual_revenue": "$25M", "location": "Boston, MA", "funding_stage": "Series B", "technology_stack": "Python, Node.js, AWS", "lead_status": "Qualified", "deal_value": 210000.0},
                {"company_name": "CloudNine Networks", "industry": "Cloud Infrastructure", "contact_name": "David Wilson", "email": "dwilson@cloudnine.com", "phone": "555-0165", "company_size": "250-500", "annual_revenue": "$35M", "location": "Seattle, WA", "funding_stage": "Series B", "technology_stack": "Azure, Kubernetes", "lead_status": "Qualified", "deal_value": 150000.0},
                {"company_name": "TechCorp Solutions", "industry": "Enterprise Software", "contact_name": "Robert Lee", "email": "rlee@techcorp.com", "phone": "555-0158", "company_size": "1000+", "annual_revenue": "$80M", "location": "Austin, TX", "funding_stage": "Public", "technology_stack": "AWS, React, Python", "lead_status": "Qualified", "deal_value": 180000.0},

                # Proposal Stage
                {"company_name": "InnovateAI Labs", "industry": "Artificial Intelligence", "contact_name": "Mark Chen", "email": "mark@innovateai.com", "phone": "555-0142", "company_size": "250-500", "annual_revenue": "$30M", "location": "New York, NY", "funding_stage": "Series B", "technology_stack": "Python, PyTorch, React", "lead_status": "Proposal", "deal_value": 320000.0},
                {"company_name": "WebScale Commerce", "industry": "E-Commerce", "contact_name": "Jessica Taylor", "email": "jtaylor@webscale.io", "phone": "555-0139", "company_size": "100-250", "annual_revenue": "$15M", "location": "Los Angeles, CA", "funding_stage": "Series A", "technology_stack": "Node.js, PostgreSQL", "lead_status": "Proposal", "deal_value": 95000.0},

                # Negotiation Stage
                {"company_name": "FutureTech Corp", "industry": "FinTech", "contact_name": "James Anderson", "email": "janderson@futuretech.com", "phone": "555-0128", "company_size": "500-1000", "annual_revenue": "$60M", "location": "San Jose, CA", "funding_stage": "Series C", "technology_stack": "AWS, Go, React", "lead_status": "Negotiation", "deal_value": 275000.0},
                {"company_name": "Quantum Corp", "industry": "Cybersecurity", "contact_name": "Amanda White", "email": "awhite@quantum.io", "phone": "555-0115", "company_size": "250-500", "annual_revenue": "$40M", "location": "Denver, CO", "funding_stage": "Series B", "technology_stack": "Kubernetes, Python", "lead_status": "Negotiation", "deal_value": 190000.0},

                # Closed Won
                {"company_name": "NexGen Dynamics", "industry": "SaaS Platform", "contact_name": "Chris Martinez", "email": "cmartinez@nexgen.com", "phone": "555-0104", "company_size": "1000+", "annual_revenue": "$120M", "location": "Atlanta, GA", "funding_stage": "Public", "technology_stack": "AWS, Python, React", "lead_status": "Closed Won", "deal_value": 350000.0},
                {"company_name": "AlphaTech Innovations", "industry": "HealthTech", "contact_name": "Lisa Thomas", "email": "lthomas@alphatech.com", "phone": "555-0091", "company_size": "500-1000", "annual_revenue": "$50M", "location": "San Diego, CA", "funding_stage": "Series C", "technology_stack": "Azure, React", "lead_status": "Closed Won", "deal_value": 220000.0},
                {"company_name": "PrimeSolutions", "industry": "IT Services", "contact_name": "Daniel Harris", "email": "dharris@primesolutions.com", "phone": "555-0082", "company_size": "250-500", "annual_revenue": "$28M", "location": "Dallas, TX", "funding_stage": "Series B", "technology_stack": "AWS, PostgreSQL", "lead_status": "Closed Won", "deal_value": 165000.0}
            ]

            for data in sample_leads:
                existing = db.query(models.Lead).filter(models.Lead.company_name == data["company_name"]).first()
                if not existing:
                    lead = models.Lead(**data)
                    db.add(lead)
            db.commit()

            # Refresh created leads to obtain lead_ids
            all_leads = db.query(models.Lead).all()

            # Seed AI scores & initial interactions for seeded leads
            for l in all_leads:
                score = models.LeadScore(
                    lead_id=l.lead_id,
                    lead_score=88 if l.lead_status in ["Qualified", "Proposal", "Negotiation", "Closed Won"] else 65,
                    conversion_probability=0.82 if l.lead_status in ["Qualified", "Proposal", "Negotiation", "Closed Won"] else 0.55,
                    priority_level="High Priority" if l.deal_value > 150000 else "Medium Priority",
                    scoring_factors=json.dumps({"company_size": 15, "funding_stage": 20, "annual_revenue": 15, "tech_compatibility": 20})
                )
                db.add(score)

                insight = models.CompanyInsight(
                    lead_id=l.lead_id,
                    business_needs=f"{l.company_name} is evaluating AI automation and real-time CRM integration.",
                    opportunities="High intent expansion potential for enterprise software solutions.",
                    industry_analysis=f"Strong growth signals in {l.industry} market sector."
                )
                db.add(insight)

                interaction = models.SalesInteraction(
                    lead_id=l.lead_id,
                    interaction_type="Call",
                    raw_transcript=f"Initial discovery call with {l.contact_name} at {l.company_name}. Discussed scaling requirements and automated sales intelligence capabilities.",
                    summary=f"Discovery call with {l.contact_name} regarding {l.company_name}'s AI automation pipeline.",
                    action_items=json.dumps(["Send product brochure and ROI benchmarks", "Schedule technical demo with engineering team"])
                )
                db.add(interaction)

                crm_log = models.CRMSyncLog(
                    lead_id=l.lead_id,
                    crm_platform="Salesforce",
                    sync_status="Synced"
                )
                db.add(crm_log)

                rec = models.FollowUpRecommendation(
                    lead_id=l.lead_id,
                    company_name=l.company_name,
                    title=f"Follow up with {l.contact_name}",
                    description=f"Send custom proposal deck to {l.company_name} tailored to {l.industry} use cases.",
                    priority_level="High Priority"
                )
                db.add(rec)

            db.commit()
            print(f"[SalesGenie Seed] Initial dataset populated cleanly across all modules! {len(all_leads)} leads active.")
    except Exception as e:
        print("[SalesGenie Seed] Seeding warning:", e)
        db.rollback()
    finally:
        db.close()
