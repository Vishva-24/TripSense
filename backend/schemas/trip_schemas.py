"""
Pydantic schemas for trip endpoints.
"""

from __future__ import annotations
from typing import Optional, Any
from pydantic import BaseModel


# ---------------------------------------------------------------------------
# Generate trip
# ---------------------------------------------------------------------------

class GenerateTripRequest(BaseModel):
    userId: Optional[str] = None
    userEmail: Optional[str] = None
    travelerCountry: Optional[str] = None
    destination: Optional[str] = None
    startDate: Optional[str] = None
    endDate: Optional[str] = None
    budgetTier: Optional[str] = None
    travelGroup: Optional[str] = None
    vibe: Optional[list[str]] = None
    dietaryPrefs: Optional[list[str]] = None
    mustDos: Optional[str] = None


# ---------------------------------------------------------------------------
# Re-roll
# ---------------------------------------------------------------------------

class ReRollContext(BaseModel):
    destination: Optional[str] = None
    budgetTier: Optional[str] = None
    travelGroup: Optional[str] = None
    vibe: Optional[list[str]] = None
    dietaryPrefs: Optional[list[str]] = None
    mustDos: Optional[str] = None
    dayNumber: Optional[int] = None
    dayDate: Optional[str] = None


class ReRollRequest(BaseModel):
    activityId: Optional[Any] = None   # str | int from client
    customRequest: Optional[str] = None
    context: Optional[ReRollContext] = None


# ---------------------------------------------------------------------------
# Regenerate trip (full itinerary refresh)
# ---------------------------------------------------------------------------

class RegenerateTripRequest(BaseModel):
    destination: Optional[str] = None
    startDate: Optional[str] = None
    endDate: Optional[str] = None
    budgetTier: Optional[str] = None
    travelGroup: Optional[str] = None
    vibe: Optional[list[str]] = None
    dietaryPrefs: Optional[list[str]] = None
    mustDos: Optional[str] = None
    travelerCountry: Optional[str] = None


# ---------------------------------------------------------------------------
# From-discover
# ---------------------------------------------------------------------------

class FromDiscoverRequest(BaseModel):
    slug: Optional[str] = None
    userEmail: Optional[str] = None
    travelerCountry: Optional[str] = None
    travelGroup: Optional[str] = None
    budgetTier: Optional[str] = None
    vibe: Optional[list[str]] = None
    startDate: Optional[str] = None


# ---------------------------------------------------------------------------
# Claim guest
# ---------------------------------------------------------------------------

class ClaimEntry(BaseModel):
    tripId: Optional[Any] = None   # int | str
    guestEmail: Optional[str] = None


class ClaimGuestRequest(BaseModel):
    targetEmail: Optional[str] = None
    claims: Optional[list[ClaimEntry]] = None


# ---------------------------------------------------------------------------
# Output models
# ---------------------------------------------------------------------------

class ActivityOut(BaseModel):
    id: int
    time: str
    type: str
    title: str
    description: str
    costEstimate: Optional[str] = None
    imageUrl: Optional[str] = None


class DayOut(BaseModel):
    id: int
    dayNumber: int
    date: Any   # date or str
    activities: list[ActivityOut]


class TripListItem(BaseModel):
    id: int
    destination: str
    startDate: Any
    endDate: Any
    budgetTier: str
    travelGroup: str
    createdAt: Any
    coverImage: Optional[str] = None


class TripDetailResponse(BaseModel):
    trip: dict
    days: list[dict]


class AgentRequestCreate(BaseModel):
    trip_id: int
    user_id: int
