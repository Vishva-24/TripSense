"""
FastAPI application entry point.
"""

from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from config import settings
from db.models import AgentRequest
from db.session import get_db
from routers.auth_router import router as auth_router
from routers.trips_router import router as trips_router
from routers.admin_router import router as admin_router
from schemas.trip_schemas import AgentRequestCreate

app = FastAPI(
    title="TripSense API",
    description="Python FastAPI backend for TripSense — Gemini-powered trip planning.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_ORIGIN],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(trips_router)
app.include_router(admin_router)


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.post("/api/agent-requests", status_code=201)
async def create_agent_request(payload: AgentRequestCreate, db: Session = Depends(get_db)):
    existing = db.query(AgentRequest).filter(AgentRequest.trip_id == payload.trip_id).first()
    if existing:
        return {"message": "Success", "id": str(existing.id)}
        
    db_request = AgentRequest(trip_id=payload.trip_id, user_id=payload.user_id)
    db.add(db_request)
    db.commit()
    db.refresh(db_request)
    return {"message": "Success", "id": str(db_request.id)}
