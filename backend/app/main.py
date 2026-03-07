from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from .api.market_routes import router as market_router
from .api.incident_routes import router as incident_router

load_dotenv()

app = FastAPI(
    title="TriageIQ Unified Intelligence Platform",
    description="Backend APIs for Market Intelligence and Incident Analyst agents.",
    version="1.0.0",
)

# Allow React app frontends
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(market_router, prefix="/api/market", tags=["Market Intelligence"])
app.include_router(incident_router, prefix="/api/incident", tags=["Incident Analyst"])

@app.get("/health")
def health_check():
    return {"status": "ok"}
