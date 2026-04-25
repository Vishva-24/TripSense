from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from db.models import AgentRequest
from db.session import get_db
from schemas.admin_schemas import AgentRequestStatusUpdate

router = APIRouter(prefix="/api/admin", tags=["admin"])

@router.get("/agent-requests")
async def get_all_agent_requests(db: Session = Depends(get_db)):
    requests = (
        db.query(AgentRequest)
        .options(joinedload(AgentRequest.user), joinedload(AgentRequest.trip))
        .order_by(AgentRequest.created_at.desc())
        .all()
    )

    result = []
    for req in requests:
        start_date_str = req.trip.start_date.isoformat() if req.trip and req.trip.start_date else None
        
        result.append({
            "id": str(req.id),
            "tripId": req.trip_id,
            "userId": req.user_id,
            "status": req.status,
            "createdAt": req.created_at.isoformat() if req.created_at else None,
            "user": {
                "email": req.user.email,
                "name": getattr(req.user, "name", None) or "User",
            } if req.user else None,
            "trip": {
                "destination": req.trip.destination,
                "startDate": start_date_str,
            } if req.trip else None,
        })
        
    return {"requests": result}

@router.patch("/agent-requests/{request_id}")
async def update_agent_request_status(
    request_id: str, 
    payload: AgentRequestStatusUpdate, 
    db: Session = Depends(get_db)
):
    valid_statuses = ["pending", "contacted", "resolved"]
    if payload.status not in valid_statuses:
        raise HTTPException(status_code=400, detail="Invalid status")
        
    req = db.query(AgentRequest).filter(AgentRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")
        
    req.status = payload.status
    db.commit()
    db.refresh(req)
    
    return {"message": "Status updated successfully", "status": req.status}
