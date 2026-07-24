from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app.routers import leads, intelligence, outreach, scoring, conversations, dashboard

# Create all tables in the database if they don't already exist.
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="SalesGenie AI - Backend API",
    description="AI Sales Assistant & Lead Intelligence Platform (backend)",
    version="1.0.0",
)

# Allow the frontend (running on any origin/port) to call this API.
# For a real production app you would restrict this to your actual frontend URL.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register all module routers
app.include_router(leads.router)
app.include_router(intelligence.router)
app.include_router(outreach.router)
app.include_router(scoring.router)
app.include_router(conversations.router)
app.include_router(dashboard.router)


@app.get("/", tags=["Health Check"])
def root():
    return {
        "message": "SalesGenie AI backend is running 🚀",
        "docs": "/docs",
    }
