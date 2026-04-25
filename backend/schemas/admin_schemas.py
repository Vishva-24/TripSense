from pydantic import BaseModel

class AgentRequestStatusUpdate(BaseModel):
    status: str
