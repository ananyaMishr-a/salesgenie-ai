# SalesGenie AI – Backend (Internship Project)

AI Sales Assistant & Lead Intelligence Platform — **backend only**, built with
FastAPI + SQLite + SQLAlchemy. Simple, well-commented code so it's easy to
explain in a viva/demo.

---

## 1. What this covers

All 6 modules from the project document:

| # | Module | Files |
|---|--------|-------|
| 1 | Lead Management & Prospect Database | `app/routers/leads.py` |
| 2 | Lead Intelligence & Company Analysis | `app/routers/intelligence.py` |
| 3 | AI Outreach Generation | `app/routers/outreach.py` |
| 4 | Lead Scoring & Recommendation Engine | `app/routers/scoring.py` |
| 5 | Conversation Intelligence & CRM Integration | `app/routers/conversations.py` |
| 6 | Dashboard & Sales Analytics | `app/routers/dashboard.py` |

All "AI" logic lives in one place: `app/services/ai_service.py`.

---

## 2. How the "AI" works (important!)

- If you set `GROQ_API_KEY` in a `.env` file, the app calls Groq's free
  Llama 3.3 API for insights, scoring reasoning, emails, and summaries.
  **Groq is recommended for students** - free, no credit card, sign up at
  https://console.groq.com
- `OPENAI_API_KEY` is also supported as an alternative, but OpenAI no
  longer reliably gives free trial credits to new accounts.
- If you set **neither** key, every AI function automatically falls back
  to simple rule-based / template logic (point-based scoring, template
  emails, keyword-based summaries). The app still works 100%.

This means you can demo/submit the project without needing to pay for
any API key.

---

## 3. Setup (step-by-step, for a student machine)

```bash
# 1. Create and activate a virtual environment
python3 -m venv venv
source venv/bin/activate        # on Windows: venv\Scripts\activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. (Optional) add your OpenAI key
cp .env.example .env
# open .env and paste your key if you have one — otherwise leave it blank

# 4. Run the server
uvicorn app.main:app --reload

# 5. Open the interactive API docs in your browser
http://127.0.0.1:8000/docs
```

The database (`salesgenie.db`, a single SQLite file) is created
automatically the first time you run the app — no separate DB
installation needed.

---

## 4. Typical demo flow (use the /docs page — Swagger UI)

1. `POST /leads/` – create a lead (or `POST /leads/import-csv` with
   `sample_leads.csv` included in this folder to bulk-load 4 leads).
2. `POST /leads/{lead_id}/analyze` – generate company insights.
3. `POST /leads/{lead_id}/score` – generate lead score + priority.
4. `POST /leads/{lead_id}/generate-email` – generate a personalized
   outreach email.
5. `POST /leads/{lead_id}/conversations` – paste a call transcript,
   get an AI summary + action items.
6. `POST /leads/{lead_id}/crm-sync` – simulate syncing to a CRM.
7. `GET /dashboard/overview`, `GET /dashboard/pipeline`,
   `GET /dashboard/top-leads` – see the analytics.

---

## 5. Project structure

```
salesgenie_backend/
├── app/
│   ├── main.py          # FastAPI app, mounts all routers
│   ├── database.py       # DB connection (SQLite via SQLAlchemy)
│   ├── models.py         # Database tables (ORM classes)
│   ├── schemas.py        # Request/response validation (Pydantic)
│   ├── routers/           # One file per module (API endpoints)
│   │   ├── leads.py
│   │   ├── intelligence.py
│   │   ├── outreach.py
│   │   ├── scoring.py
│   │   ├── conversations.py
│   │   └── dashboard.py
│   └── services/
│       └── ai_service.py  # All "AI" logic + fallback rules
├── sample_leads.csv       # sample data for CSV import
├── requirements.txt
├── .env.example
└── README.md
```

## 6. Why SQLite instead of PostgreSQL?

The architecture diagram in the project doc shows PostgreSQL, but SQLite
uses the exact same SQLAlchemy code and needs zero server setup — perfect
for a laptop demo. To switch to PostgreSQL later, just:
1. `pip install psycopg2-binary`
2. Change `DATABASE_URL` in `.env` to something like
   `postgresql://user:password@localhost:5432/salesgenie`

No other code changes needed — that's the benefit of using SQLAlchemy.

## 7. Notes on CRM integration

Real CRM APIs (Salesforce/HubSpot) require paid developer accounts, so
`POST /leads/{id}/crm-sync` **simulates** a sync and logs it to our own
`crm_sync_logs` table (matches the schema diagram). You can mention in
your report that this is designed so a real CRM SDK call can be dropped
into that one function later with minimal changes.

## 8. Evaluation criteria mapping (from the project doc)

- Lead scoring accuracy ≥85% → transparent point-based rules in
  `ai_service.calculate_lead_score()`, easy to justify/tune.
- Personalized outreach for multiple industries → prompt/template uses
  `industry`, `funding_stage`, `technology_stack` per lead.
- CRM integration functional → `/crm-sync` + `/crm-sync-logs`.
- Sales conversation summaries → `/leads/{id}/conversations`.
- Dashboard fully operational → `/dashboard/overview`, `/pipeline`,
  `/top-leads`.

---

## 9. Recent Updates (Milestones 3 & 4)

The backend has been recently updated to fully support the dynamic frontend UI for Milestones 3 & 4:

### 🚀 Bug Fixes & Refactors
- **CRM Sync Webhook (`POST /crm-sync`)**: Fixed payload rejection issues. The backend now properly parses incoming JSON action items and successfully writes them as completed tasks into the local SQLite `CRMSyncLog` table.
- **Lead Deletion (`DELETE /leads/{lead_id}`)**: Verified and successfully connected the deletion endpoint. Deleting a lead on the React frontend now reliably triggers the backend ORM to securely drop the record from the SQLite database.
- **AI Rate Limit Handling (`ai_service.py`)**: Added detailed exception logging for Google Gemini / Groq API limits. Fixed an issue where the outreach generator would silently loop; it now reliably falls back to rule-based templates if a `429 Too Many Requests` error occurs, preventing application crashes.

### 📊 Dashboard Live Data Endpoints
The following endpoints now supply 100% pure real-time data to the React frontend (zero hardcoded fallback data):
- `GET /dashboard/kpis`: Live calculation of Conversion Rate, Pipeline Value, Avg Response Time, and Avg Sales Cycle.
- `GET /dashboard/pipeline`: Grouped dictionary of leads perfectly formatted for the 5-column Kanban board (`New`, `Qualified`, `Proposal`, `Negotiation`, `Closed Won`).
- `GET /dashboard/recommendations`: AI-driven automated follow-up recommendations (e.g., "Schedule a call to discuss technical requirements").
