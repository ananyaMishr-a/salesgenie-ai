# SalesGenie AI — AI Sales Assistant & Lead Intelligence Platform

SalesGenie AI is an end-to-end B2B Sales Assistant and Lead Intelligence platform built with React, FastAPI, SQLAlchemy, and Google Gemini AI / LLM services.

---

## 🏗 Architecture Overview

```mermaid
graph TD
    A[React 18 Frontend] -->|Axios API Service Layer| B[FastAPI Backend]
    B -->|SQLAlchemy ORM| C[(Database: PostgreSQL / SQLite)]
    B -->|Pydantic & JSON Schemas| D[AI Engine / Gemini LLM]
    B -->|Persisted Logs| E[CRM Sync Simulation Engine]
```

### Data Flow
`User Action` → `React UI` → `Axios API Call` → `FastAPI Endpoint` → `SQLAlchemy DB / Gemini AI` → `Structured Response` → `UI Update`

---

## 🚀 Key Features by Milestone

### Milestone 1 — Lead Management & Intelligence Engine
- **Lead CRUD**: Create, view, search (`?q=`), filter, edit, and delete prospects.
- **AI Company Research Agent**: Send lead details to Gemini AI to generate business needs, pain points, growth signals, and recommended approach.
- **Persistence**: All lead records and generated company insights are stored in the database.

### Milestone 2 — AI Outreach & Lead Scoring
- **Deterministic & AI Lead Scoring**: Multi-factor qualification score (0-100), priority levels (High/Medium/Low), and conversion probability.
- **Personalized Email Generation**: AI-generated cold outreach with configurable tones (`Professional`, `Casual`, `Direct`), subject line, body, and call-to-action.
- **Outreach Strategy**: Auto-generated timing, channel mix, and content strategy per lead.

### Milestone 3 — Conversation Intelligence & CRM Integration
- **Meeting Summarization**: Ingest meeting call transcripts and analyze with LLM to produce executive summaries, key discussion points, and action items.
- **Dynamic Lead Selection**: Connects conversation transcripts directly to selected lead IDs in the database.
- **CRM Sync Simulation**: Simulated bi-directional synchronization with Salesforce & HubSpot with logs stored in database (`crm_sync_logs`).

### Milestone 4 — Dashboard & Automation
- **Real-Time Analytics**: KPIs (Conversion Rate, Pipeline Value, Total Prospects) computed dynamically from database data.
- **Pipeline Kanban Board**: Drag-and-drop or status-grouped pipeline stages (`New`, `Qualified`, `Proposal`, `Negotiation`, `Closed Won`).
- **Follow-up Recommendations**: AI-driven next-best-action follow-up recommendations stored and updated in database (`followup_recommendations`).
- **Empty States**: Displays clean empty states when no data is present instead of fake hardcoded fallback metrics.

---

## ⚙️ Environment Variables Setup

Create a `.env` file inside the `backend` folder (reference `backend/.env.example`):

```env
GEMINI_API_KEY=your_gemini_api_key_here
GROQ_API_KEY=your_groq_api_key_here (optional)
DATABASE_URL=postgresql://user:password@localhost:5432/dbname (or leave blank for SQLite)
SECRET_KEY=your_random_secret_key
```

---

## 🏃 Running the Application

### Option A: Single-Click Launcher (Windows)
Double-click `run_salesgenie.bat` or run:
```cmd
run_salesgenie.bat
```
This automatically starts the FastAPI backend on port `8000`, Vite React frontend on port `5173`, and opens `http://localhost:5173/` in your browser.

### Option B: Manual Startup

#### 1. Backend (FastAPI)
```cmd
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python app/seed.py
uvicorn app.main:app --reload --port 8000
```
- API Documentation: `http://127.0.0.1:8000/docs`

#### 2. Frontend (React / Vite)
```cmd
cd frontend
npm install
npm run dev
```
- Web Application: `http://localhost:5173/`

---

## 🔌 API Endpoints Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/leads/` | List all leads (supports `?q=` search, `?status=`, `?industry=`) |
| `POST` | `/leads/` | Create a new lead |
| `GET` | `/leads/{id}` | Get single lead details |
| `PUT` | `/leads/{id}` | Update existing lead |
| `DELETE` | `/leads/{id}` | Delete lead and cascade delete related records |
| `POST` | `/leads/{id}/analyze` | Trigger Gemini AI company analysis |
| `POST` | `/leads/{id}/score` | Trigger AI lead scoring |
| `POST` | `/leads/{id}/generate-email` | Generate personalized email campaign |
| `GET` | `/leads/{id}/strategy` | Fetch outreach strategy |
| `POST` | `/leads/{id}/conversations` | Submit transcript and generate summary/action items |
| `POST` | `/leads/{id}/crm-sync` | Trigger CRM sync and log status |
| `GET` | `/crm-sync-logs` | Retrieve CRM sync logs |
| `GET` | `/dashboard/kpis` | Compute dynamic KPIs from DB |
| `GET` | `/dashboard/pipeline` | Fetch sales pipeline by stage |
| `GET` | `/dashboard/recommendations` | Retrieve follow-up recommendations |

---

## 🛠 Known Limitations & External Credentials
- **CRM Integration**: Implemented as a persistent **CRM Sync Simulation** (Salesforce & HubSpot). Real OAuth credential flows can be plugged into `backend/app/routers/conversations.py` if external CRM API credentials are provided.
- **LLM Provider**: Uses Google Gemini (`gemini-flash-latest`) as primary structured LLM provider, with Groq / OpenAI and deterministic fallback chains if API keys are missing.
