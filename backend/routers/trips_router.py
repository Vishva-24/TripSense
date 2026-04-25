"""
Trips router — all /api/trips/* endpoints.
"""
from __future__ import annotations

import asyncio
from datetime import date, datetime
from typing import Optional
from urllib.parse import quote

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from db.models import Activity, ActivityTypeEnum, AgentRequest, ItineraryDay, Trip, User
from db.session import get_db
from schemas.trip_schemas import (
    ClaimGuestRequest,
    FromDiscoverRequest,
    GenerateTripRequest,
    ReRollRequest,
    RegenerateTripRequest,
)
from services.auth_service import (
    find_user_by_email,
    is_guest_like_email,
    is_valid_email,
    normalize_email,
)
from services.gemini_service import generate_structured_json
from services.image_service import get_location_image_url
from services.pricing_service import (
    normalize_estimated_cost_for_db,
    normalize_estimated_currency,
    normalize_estimate_note,
)
from services.trip_service import (
    build_generate_prompt,
    build_reroll_prompt,
    days_between_inclusive,
    fetch_unique_image,
    get_today_iso,
    is_transient_ai_error,
    is_valid_date_string,
    parse_positive_int,
    resolve_user_id,
    safe_array,
    sanitize_itinerary,
    save_trip_with_itinerary,
)

router = APIRouter(prefix="/api/trips", tags=["trips"])


def _fmt_date(val) -> str:
    if isinstance(val, (date, datetime)):
        return val.isoformat()[:10]
    return str(val or "")


# ---------------------------------------------------------------------------
# GET /api/trips
# ---------------------------------------------------------------------------

@router.get("")
async def list_trips(
    userId: Optional[str] = None,
    userEmail: Optional[str] = None,
    db: Session = Depends(get_db),
):
    user_id: Optional[int] = None

    if userId:
        uid = parse_positive_int(userId.strip())
        if not uid:
            raise HTTPException(400, "Invalid query param: userId")
        user_id = uid
    elif userEmail:
        user = find_user_by_email(db, userEmail.strip().lower())
        if not user:
            return {"trips": []}
        user_id = user.id
    else:
        raise HTTPException(400, "Missing query param: userId or userEmail")

    trip_rows = (
        db.query(Trip)
        .filter(Trip.user_id == user_id)
        .order_by(Trip.created_at.desc())
        .all()
    )

    result = []
    for trip in trip_rows:
        first_act = (
            db.query(Activity)
            .join(ItineraryDay, Activity.day_id == ItineraryDay.id)
            .filter(ItineraryDay.trip_id == trip.id)
            .order_by(ItineraryDay.day_number, Activity.time)
            .first()
        )
        image = None
        if first_act:
            img = first_act.image_url or ""
            needs_backfill = not img or "source.unsplash.com" in img or "placehold.co" in img
            if needs_backfill:
                image = await get_location_image_url(
                    trip.destination, trip.destination, "landmark"
                )
                if first_act:
                    first_act.image_url = image
                    db.commit()
            else:
                image = img
        if not image:
            seed = quote(f"{trip.destination} trip cover")
            image = f"https://picsum.photos/seed/{seed}/960/640"

        result.append({
            "id": trip.id,
            "destination": trip.destination,
            "startDate": _fmt_date(trip.start_date),
            "endDate": _fmt_date(trip.end_date),
            "budgetTier": trip.budget_tier,
            "travelGroup": trip.travel_group,
            "createdAt": trip.created_at.isoformat() if trip.created_at else None,
            "coverImage": image,
            "agentNotified": db.query(AgentRequest).filter(AgentRequest.trip_id == trip.id).first() is not None,
        })

    return {"trips": result}


# ---------------------------------------------------------------------------
# Static sub-paths must come before {id}
# ---------------------------------------------------------------------------

# POST /api/trips/generate
@router.post("/generate", status_code=201)
async def generate_trip(body: GenerateTripRequest, db: Session = Depends(get_db)):
    destination = str(body.destination or "").strip()
    start_date  = str(body.startDate or "").strip()
    end_date    = str(body.endDate or "").strip()
    budget_tier = str(body.budgetTier or "").strip()
    travel_group= str(body.travelGroup or "").strip()
    vibe        = safe_array(body.vibe)
    dietary     = safe_array(body.dietaryPrefs)
    must_dos    = str(body.mustDos or "").strip()
    country     = str(body.travelerCountry or "").strip()

    if not all([destination, start_date, end_date, budget_tier, travel_group]):
        raise HTTPException(400, "Missing required questionnaire fields.")
    if not is_valid_date_string(start_date) or not is_valid_date_string(end_date):
        raise HTTPException(400, "Dates must be in YYYY-MM-DD format.")
    if start_date < get_today_iso():
        raise HTTPException(400, "Start date cannot be in the past.")
    total_days = days_between_inclusive(start_date, end_date)
    if total_days <= 0 or total_days > 30:
        raise HTTPException(400, "Invalid date range. Trip length must be between 1 and 30 days.")

    try:
        user_id = resolve_user_id(db, body.userId, body.userEmail or "")
    except ValueError as e:
        raise HTTPException(400, str(e))

    prompt = build_generate_prompt(
        destination, start_date, end_date, total_days,
        budget_tier, travel_group, vibe, dietary, must_dos, country,
    )

    try:
        gemini_out = await generate_structured_json(prompt, temperature=0.3)
    except Exception as e:
        msg = str(e)
        if is_transient_ai_error(msg):
            raise HTTPException(503, "TripSense AI is busy right now. Please wait a few seconds and try again.")
        raise HTTPException(502, f"Trip generation failed. {msg}")

    sanitized = sanitize_itinerary(gemini_out, start_date, total_days)
    est_cost   = normalize_estimated_cost_for_db(gemini_out.get("estimated_total") if gemini_out else None)
    est_curr   = normalize_estimated_currency(gemini_out.get("currency_code") if gemini_out else None)
    est_note   = normalize_estimate_note(gemini_out.get("pricing_note") if gemini_out else None)

    trip_id = await save_trip_with_itinerary(
        db, user_id, destination, start_date, end_date,
        budget_tier, travel_group, vibe, dietary, must_dos or None,
        est_cost, est_curr, est_note, sanitized,
    )
    return {"tripId": trip_id}


# POST /api/trips/from-discover
@router.post("/from-discover")
async def from_discover(body: FromDiscoverRequest, db: Session = Depends(get_db)):
    from data.discover_trips import get_discover_trip_by_slug

    slug = str(body.slug or "").strip()
    if not slug:
        raise HTTPException(400, "Trip slug is required.")

    discover = get_discover_trip_by_slug(slug)
    if not discover:
        raise HTTPException(404, "Discover trip not found.")

    import re
    matched = re.search(r"\d+", str(discover.get("duration", "")))
    total_days = int(matched.group()) if matched else 3

    start_date = str(body.startDate or "").strip()
    if not is_valid_date_string(start_date):
        from services.trip_service import get_today_iso
        start_date = get_today_iso()

    from services.trip_service import add_days
    end_date = add_days(start_date, total_days - 1)

    persona = discover.get("persona", "")
    persona_budget = {"High-Roller": "Luxury"}
    provided_budget = str(body.budgetTier or "")
    budget_tier = provided_budget if provided_budget in ("Shoestring", "Standard", "Luxury") else (persona_budget.get(persona) or "Standard")

    travel_group = str(body.travelGroup or "Solo").strip() or "Solo"
    traveler_country = str(body.travelerCountry or "").strip()

    provided_vibe = safe_array(body.vibe)
    persona_vibes = {
        "Concrete Jungle Explorer": ["Urban", "Food-focused", "Foodie"],
        "Zen Seeker": ["Chill", "Nature", "Relaxation"],
        "Time Traveler": ["Culture", "History"],
        "Thrill Chaser": ["Adventure", "Nature"],
        "High-Roller": ["Party", "Luxury"],
    }
    vibe = list(set(provided_vibe)) if provided_vibe else list(set(
        (persona_vibes.get(persona) or []) +
        [v.strip() for v in re.split(r"[&|,/]", str(discover.get("vibe", ""))) if v.strip()]
    ))

    email = normalize_email(str(body.userEmail or ""))
    if not email:
        raise HTTPException(400, "userEmail is required.")
    from services.auth_service import find_or_create_user_by_email
    user = find_or_create_user_by_email(db, email)
    user_id = user.id

    discover_days = discover.get("days", [])
    destination   = discover.get("location", "")

    from services.trip_service import build_discover_expansion_prompt, build_estimate_prompt, sanitize_discover_itinerary

    prompt = build_discover_expansion_prompt(
        destination=destination,
        duration=discover.get("duration", ""),
        persona=persona,
        vibe=discover.get("vibe", ""),
        budget_tier=budget_tier,
        travel_group=travel_group,
        traveler_country=traveler_country,
        discover_days=discover_days,
    )
    try:
        raw_itinerary = await generate_structured_json(prompt, temperature=0.35)
    except Exception:
        raw_itinerary = None

    sanitized = sanitize_discover_itinerary(raw_itinerary, discover_days, start_date, destination)

    try:
        est_prompt = build_estimate_prompt(
            destination=destination,
            duration=discover.get("duration", ""),
            persona=persona,
            vibe=discover.get("vibe", ""),
            budget_tier=budget_tier,
            travel_group=travel_group,
            traveler_country=traveler_country,
            days=discover_days,
        )
        est_out = await generate_structured_json(est_prompt, temperature=0.2)
        est_cost = normalize_estimated_cost_for_db(est_out.get("estimated_total") if est_out else None)
        est_curr = normalize_estimated_currency(est_out.get("currency_code") if est_out else None)
        est_note = normalize_estimate_note(est_out.get("pricing_note") if est_out else None)
    except Exception:
        est_cost, est_curr, est_note = None, "USD", "Estimated by TripSense AI during trip generation."

    must_dos = f"Customized from Discover: {discover.get('title', '')} ({persona})"
    trip_id = await save_trip_with_itinerary(
        db, user_id, destination, start_date, end_date,
        budget_tier, travel_group, vibe, ["None"], must_dos,
        est_cost, est_curr, est_note, sanitized,
    )
    return {"tripId": trip_id}


# POST /api/trips/claim-guest
@router.post("/claim-guest")
async def claim_guest(body: ClaimGuestRequest, db: Session = Depends(get_db)):
    target_email = normalize_email(str(body.targetEmail or ""))
    if not target_email or not is_valid_email(target_email):
        raise HTTPException(400, "Valid targetEmail is required.")

    raw_claims = body.claims or []
    normalized = []
    for c in raw_claims[:100]:
        tid = parse_positive_int(c.tripId)
        if not tid:
            continue
        ge_raw = normalize_email(str(c.guestEmail or ""))
        ge = ge_raw if is_guest_like_email(ge_raw) else None
        normalized.append({"tripId": tid, "guestEmail": ge})

    if not normalized:
        return {"claimedTripIds": [], "alreadyOwnedTripIds": []}

    from services.auth_service import find_or_create_user_by_email
    target_user = find_or_create_user_by_email(db, target_email)
    target_uid = target_user.id

    claimed, already_owned = [], []
    for claim in normalized:
        trip = db.query(Trip).filter(Trip.id == claim["tripId"]).first()
        if not trip:
            continue
        if trip.user_id == target_uid:
            already_owned.append(trip.id)
            continue

        if claim["guestEmail"]:
            guest = find_user_by_email(db, claim["guestEmail"])
            if not guest or guest.id != trip.user_id:
                continue
            guest_uid = guest.id
        else:
            owner = db.query(User).filter(User.id == trip.user_id).first()
            if not owner or not is_guest_like_email(owner.email):
                continue
            guest_uid = owner.id

        if trip.user_id == guest_uid:
            trip.user_id = target_uid
            db.commit()
            claimed.append(trip.id)

    return {"claimedTripIds": claimed, "alreadyOwnedTripIds": already_owned}


# POST /api/trips/re-roll
@router.post("/re-roll")
async def re_roll(body: ReRollRequest, db: Session = Depends(get_db)):
    activity_id = parse_positive_int(body.activityId)
    if not activity_id:
        raise HTTPException(400, "Missing or invalid field: activityId")

    act = (
        db.query(Activity, ItineraryDay, Trip)
        .join(ItineraryDay, Activity.day_id == ItineraryDay.id)
        .join(Trip, ItineraryDay.trip_id == Trip.id)
        .filter(Activity.id == activity_id)
        .first()
    )
    if not act:
        raise HTTPException(404, "Activity not found.")

    activity, day, trip = act
    ctx = body.context or {}

    prompt = build_reroll_prompt(
        destination=ctx.destination or trip.destination,
        budget_tier=ctx.budgetTier or trip.budget_tier,
        travel_group=ctx.travelGroup or trip.travel_group,
        vibe=ctx.vibe or list(trip.vibe or []),
        dietary_prefs=ctx.dietaryPrefs or list(trip.dietary_prefs or []),
        must_dos=ctx.mustDos or trip.must_dos or "",
        day_number=ctx.dayNumber or day.day_number,
        day_date=ctx.dayDate or _fmt_date(day.date),
        time=activity.time,
        type_=activity.type.value,
        current_title=activity.title,
        current_description=activity.description,
        custom_request=str(body.customRequest or "").strip(),
    )

    try:
        reroll = await generate_structured_json(prompt, temperature=0.4)
    except Exception as e:
        raise HTTPException(502, f"Gemini reroll failed: {e}")

    title = str((reroll or {}).get("title", "")).strip()
    description = str((reroll or {}).get("description", "")).strip()
    if not title or not description:
        raise HTTPException(502, "Gemini returned incomplete reroll output.")

    cost_raw = (reroll or {}).get("cost_estimate")
    cost_str = str(cost_raw) if cost_raw else None
    cost = normalize_estimated_cost_for_db(cost_str)
    image_url = await get_location_image_url(trip.destination, title, activity.type.value)

    activity.title = title
    activity.description = description
    activity.cost_estimate = float(cost) if cost else None
    activity.image_url = image_url
    db.commit()
    db.refresh(activity)

    return {
        "activity": {
            "id": activity.id,
            "time": activity.time,
            "type": activity.type.value,
            "title": activity.title,
            "description": activity.description,
            "costEstimate": str(activity.cost_estimate) if activity.cost_estimate else None,
            "imageUrl": activity.image_url,
        }
    }


# ---------------------------------------------------------------------------
# GET /api/trips/{id}
# ---------------------------------------------------------------------------

@router.get("/{trip_id}")
async def get_trip(trip_id: int, userId: Optional[str] = None, userEmail: Optional[str] = None, db: Session = Depends(get_db)):
    if trip_id <= 0:
        raise HTTPException(400, "Trip id is required.")

    user_id: Optional[int] = None
    provided = False

    if userId:
        uid = parse_positive_int(userId.strip())
        if not uid:
            raise HTTPException(400, "Invalid query param: userId")
        user_id = uid
        provided = True
    elif userEmail:
        u = find_user_by_email(db, userEmail.strip().lower())
        user_id = u.id if u else None
        provided = True

    if provided and not user_id:
        raise HTTPException(404, "User not found.")

    query = db.query(Trip).filter(Trip.id == trip_id)
    if user_id:
        query = query.filter(Trip.user_id == user_id)
    trip = query.first()
    if not trip:
        raise HTTPException(404, "Trip not found.")

    rows = (
        db.query(ItineraryDay, Activity)
        .outerjoin(Activity, Activity.day_id == ItineraryDay.id)
        .filter(ItineraryDay.trip_id == trip_id)
        .order_by(ItineraryDay.day_number, Activity.time)
        .all()
    )

    image_cache: dict = {}
    used_urls: set = set()
    day_map: dict = {}

    for day, act in rows:
        if day.id not in day_map:
            day_map[day.id] = {
                "id": day.id,
                "dayNumber": day.day_number,
                "date": _fmt_date(day.date),
                "activities": [],
            }
        if act:
            img = act.image_url or ""
            needs = not img or "source.unsplash.com" in img or "placehold.co" in img
            if needs:
                key = f"{trip.destination}|{act.title}|{act.type.value}"
                if key not in image_cache:
                    image_cache[key] = await get_location_image_url(trip.destination, act.title, act.type.value)
                img = image_cache[key]
                act.image_url = img
                db.commit()

            if img in used_urls:
                retry = await get_location_image_url(trip.destination, f"{act.title} {act.type.value}", act.type.value)
                if retry not in used_urls:
                    img = retry
                else:
                    seed = quote(f"{trip.destination}|{act.title}|{act.type.value}")
                    img = f"https://picsum.photos/seed/{seed}/960/640"
                act.image_url = img
                db.commit()
            used_urls.add(img)

            day_map[day.id]["activities"].append({
                "id": act.id,
                "time": act.time,
                "type": act.type.value,
                "title": act.title,
                "description": act.description,
                "costEstimate": str(act.cost_estimate) if act.cost_estimate else None,
                "imageUrl": act.image_url,
            })

    days = sorted(day_map.values(), key=lambda d: d["dayNumber"])
    return {
        "trip": {
            "id": trip.id,
            "userId": trip.user_id,
            "destination": trip.destination,
            "startDate": _fmt_date(trip.start_date),
            "endDate": _fmt_date(trip.end_date),
            "budgetTier": trip.budget_tier,
            "travelGroup": trip.travel_group,
            "vibe": list(trip.vibe or []),
            "dietaryPrefs": list(trip.dietary_prefs or []),
            "mustDos": trip.must_dos,
            "estimatedCost": str(trip.estimated_cost) if trip.estimated_cost else None,
            "estimatedCurrency": trip.estimated_currency,
            "estimatedCostNote": trip.estimated_cost_note,
            "createdAt": trip.created_at.isoformat() if trip.created_at else None,
            "agentNotified": db.query(AgentRequest).filter(AgentRequest.trip_id == trip_id).first() is not None,
        },
        "days": days,
    }


# DELETE /api/trips/{id}
@router.delete("/{trip_id}")
async def delete_trip(trip_id: int, userId: Optional[str] = None, userEmail: Optional[str] = None, db: Session = Depends(get_db)):
    if trip_id <= 0:
        raise HTTPException(400, "Trip id is required.")

    user_id: Optional[int] = None
    provided = False

    if userId:
        uid = parse_positive_int(userId.strip())
        if not uid:
            raise HTTPException(400, "Invalid query param: userId")
        user_id = uid
        provided = True
    elif userEmail:
        u = find_user_by_email(db, userEmail.strip().lower())
        user_id = u.id if u else None
        provided = True

    if not provided:
        raise HTTPException(400, "Missing query param: userId or userEmail")
    if not user_id:
        raise HTTPException(404, "User not found.")

    trip = db.query(Trip).filter(Trip.id == trip_id, Trip.user_id == user_id).first()
    if not trip:
        raise HTTPException(404, "Trip not found.")

    db.delete(trip)
    db.commit()
    return {"deleted": True, "tripId": trip_id}


# POST /api/trips/{id}/regenerate
@router.post("/{trip_id}/regenerate")
async def regenerate_trip(trip_id: int, body: RegenerateTripRequest, db: Session = Depends(get_db)):
    if trip_id <= 0:
        raise HTTPException(400, "Trip id is required.")

    existing = db.query(Trip).filter(Trip.id == trip_id).first()
    if not existing:
        raise HTTPException(404, "Trip not found.")

    destination = str(body.destination or existing.destination or "").strip()
    start_date  = str(body.startDate or _fmt_date(existing.start_date)).strip()
    end_date    = str(body.endDate or _fmt_date(existing.end_date)).strip()
    budget_tier = str(body.budgetTier or existing.budget_tier or "").strip()
    travel_group= str(body.travelGroup or existing.travel_group or "").strip()
    vibe        = safe_array(body.vibe) if body.vibe is not None else list(existing.vibe or [])
    dietary     = safe_array(body.dietaryPrefs) if body.dietaryPrefs is not None else list(existing.dietary_prefs or [])
    must_dos    = str(body.mustDos or existing.must_dos or "").strip()
    country     = str(body.travelerCountry or "").strip()

    if not all([destination, start_date, end_date, budget_tier, travel_group]):
        raise HTTPException(400, "Missing required plan fields.")
    if not is_valid_date_string(start_date) or not is_valid_date_string(end_date):
        raise HTTPException(400, "Dates must be in YYYY-MM-DD format.")
    if start_date < get_today_iso():
        raise HTTPException(400, "Start date cannot be in the past.")
    total_days = days_between_inclusive(start_date, end_date)
    if total_days <= 0 or total_days > 30:
        raise HTTPException(400, "Invalid date range.")

    prompt = build_generate_prompt(
        destination, start_date, end_date, total_days,
        budget_tier, travel_group, vibe, dietary, must_dos, country,
    )
    try:
        gemini_out = await generate_structured_json(prompt, temperature=0.3)
    except Exception as e:
        msg = str(e)
        if is_transient_ai_error(msg):
            raise HTTPException(503, "TripSense AI is busy. Please try again.")
        raise HTTPException(500, f"Regeneration failed. {msg}")

    sanitized  = sanitize_itinerary(gemini_out, start_date, total_days)
    est_cost   = normalize_estimated_cost_for_db(gemini_out.get("estimated_total") if gemini_out else None)
    est_curr   = normalize_estimated_currency(gemini_out.get("currency_code") if gemini_out else None)
    est_note   = normalize_estimate_note(gemini_out.get("pricing_note") if gemini_out else None)

    existing.destination        = destination
    existing.start_date         = date.fromisoformat(start_date)
    existing.end_date           = date.fromisoformat(end_date)
    existing.budget_tier        = budget_tier
    existing.travel_group       = travel_group
    existing.vibe               = vibe
    existing.dietary_prefs      = dietary
    existing.must_dos           = must_dos or None
    existing.estimated_cost     = float(est_cost) if est_cost else None
    existing.estimated_currency = est_curr
    existing.estimated_cost_note= est_note

    for old_day in db.query(ItineraryDay).filter(ItineraryDay.trip_id == trip_id).all():
        db.delete(old_day)
    db.commit()

    image_cache: dict = {}
    used_urls: set   = set()
    resp_days = []

    for day_data in sanitized:
        new_day = ItineraryDay(trip_id=trip_id, day_number=day_data["day_number"], date=date.fromisoformat(day_data["date"]))
        db.add(new_day)
        db.flush()
        acts_out = []
        for ad in day_data.get("activities", []):
            img = await fetch_unique_image(destination, ad["title"], ad["type"], image_cache, used_urls)
            a = Activity(
                day_id=new_day.id,
                time=ad["time"],
                type=ActivityTypeEnum(ad["type"]),
                title=ad["title"],
                description=ad["description"],
                cost_estimate=float(normalize_estimated_cost_for_db(ad.get("cost_estimate"))) if normalize_estimated_cost_for_db(ad.get("cost_estimate")) else None,
                image_url=img,
            )
            db.add(a)
            db.flush()
            acts_out.append({
                "id": a.id, "time": a.time, "type": a.type.value,
                "title": a.title, "description": a.description,
                "costEstimate": str(a.cost_estimate) if a.cost_estimate else None,
                "imageUrl": a.image_url,
            })
        resp_days.append({"id": new_day.id, "dayNumber": new_day.day_number, "date": day_data["date"], "activities": acts_out})

    db.commit()
    db.refresh(existing)

    return {
        "trip": {
            "id": existing.id, "userId": existing.user_id,
            "destination": destination, "startDate": start_date, "endDate": end_date,
            "budgetTier": budget_tier, "travelGroup": travel_group,
            "vibe": vibe, "dietaryPrefs": dietary, "mustDos": must_dos,
            "estimatedCost": est_cost, "estimatedCurrency": est_curr, "estimatedCostNote": est_note,
        },
        "days": resp_days,
    }
