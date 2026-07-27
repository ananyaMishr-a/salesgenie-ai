# SalesGenie AI Backend

This backend powers a simple AI-assisted sales CRM demo built with FastAPI, SQLAlchemy, and SQLite. It supports lead management, company intelligence, outreach generation, lead scoring, conversation summarization, CRM-style sync logging, and a basic dashboard.

## What is included

The backend currently covers these functional areas:

- Lead management and CSV import
- Company insight generation
- Outreach email generation
- Lead scoring and ranking
- Conversation summarization and action-item extraction
- CRM sync simulation and log history
- Sales dashboard metrics and pipeline views

The main API entry point is in `app/main.py`, and the feature modules live under `app/routers/`.

## AI behavior

The app can use AI when a key is available, but it also works without one.

- If `GROQ_API_KEY` is set, the app uses Groq’s OpenAI-compatible API for company analysis, scoring explanations, outreach emails, and conversation summaries.
- If `GROQ_API_KEY` is not available but `OPENAI_API_KEY` is set, the app falls back to OpenAI.
- If neither key is set, the app uses built-in template-based logic so the project still runs normally.

This makes the demo reliable for local testing and classroom submission.

## Setup

From the `backend` folder:

```bash
python -m venv venv

# Windows
venv\Scripts\activate

# macOS / Linux
source venv/bin/activate

pip install -r requirements.txt
```

Create a `.env` file with any optional API key:

```env
GROQ_API_KEY=your_key_here
# or OPENAI_API_KEY=your_key_here
```

Run the server:

```bash
uvicorn app.main:app --reload
```

Open the API docs here:

- http://127.0.0.1:8000/docs

The SQLite database file is created automatically on first run.

## Main API endpoints

### Leads

- `POST /leads/` – create a lead
- `GET /leads/` – list leads with optional filters
- `GET /leads/{lead_id}` – get one lead
- `PUT /leads/{lead_id}` – update a lead
- `DELETE /leads/{lead_id}` – delete a lead
- `POST /leads/import-csv` – import leads from a CSV file

### Intelligence

- `POST /leads/{lead_id}/analyze` – generate company insights
- `GET /leads/{lead_id}/insights` – get stored insights

### Outreach

- `POST /leads/{lead_id}/generate-email` – generate a draft outreach email
- `GET /leads/{lead_id}/campaigns` – get campaigns for a lead
- `GET /campaigns` – get all campaigns
- `PUT /campaigns/{campaign_id}/status` – update a campaign status

### Scoring

- `POST /leads/{lead_id}/score` – calculate and save a lead score
- `GET /leads/{lead_id}/scores` – score history
- `GET /leads/{lead_id}/score/latest` – latest score for a lead

### Conversations and CRM

- `POST /leads/{lead_id}/conversations` – add a transcript summary
- `GET /leads/{lead_id}/conversations` – get conversation history
- `POST /leads/{lead_id}/crm-sync` – simulate CRM sync
- `GET /crm-sync-logs` – view CRM sync logs

### Dashboard

- `GET /dashboard/overview` – summary metrics
- `GET /dashboard/pipeline` – pipeline grouped by status
- `GET /dashboard/top-leads` – top scored leads

## Project structure

```text
backend/
├── app/
│   ├── main.py
│   ├── database.py
│   ├── models.py
│   ├── schemas.py
│   ├── routers/
│   │   ├── leads.py
│   │   ├── intelligence.py
│   │   ├── outreach.py
│   │   ├── scoring.py
│   │   ├── conversations.py
│   │   └── dashboard.py
│   └── services/
│       └── ai_service.py
├── requirements.txt
├── sample_leads.csv
└── README.md
```

## Notes

- The project uses SQLite for simplicity and easy local demos.
- CRM syncing is intentionally simulated, since real CRM APIs usually require paid accounts or developer approvals.
- The sample CSV file can be used to quickly populate test leads for demo purposes.
