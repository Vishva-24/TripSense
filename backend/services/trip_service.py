"""
Core trip service — business logic shared across multiple endpoints.

Contains:
- Gemini prompt builders
- Itinerary sanitization
- Image deduplication
- DB insertion helpers (trip + days + activities)
"""

import asyncio
import re
import json
from datetime import date, timedelta
from urllib.parse import quote

from sqlalchemy.orm import Session

from db.models import Activity, ActivityTypeEnum, ItineraryDay, Trip, User
from services.gemini_service import generate_structured_json
from services.image_service import get_location_image_url
from services.pricing_service import (
    normalize_estimated_cost_for_db,
    normalize_estimated_currency,
    normalize_estimate_note,
)

VALID_ACTIVITY_TYPES = {"food", "landmark", "transit"}


# ---------------------------------------------------------------------------
# Date utilities
# ---------------------------------------------------------------------------

def get_today_iso() -> str:
    return date.today().isoformat()


def is_valid_date_string(value: str) -> bool:
    if not re.match(r"^\d{4}-\d{2}-\d{2}$", value):
        return False
    try:
        date.fromisoformat(value)
        return True
    except ValueError:
        return False


def days_between_inclusive(start: str, end: str) -> int:
    d1 = date.fromisoformat(start)
    d2 = date.fromisoformat(end)
    return (d2 - d1).days + 1


def add_days(date_string: str, amount: int) -> str:
    d = date.fromisoformat(date_string)
    return (d + timedelta(days=amount)).isoformat()


def safe_array(value) -> list[str]:
    if not isinstance(value, list):
        return []
    return [str(item).strip() for item in value if str(item).strip()]


def parse_positive_int(value) -> int | None:
    try:
        parsed = int(value)
        return parsed if parsed > 0 else None
    except (TypeError, ValueError):
        return None


def build_seeded_fallback_image(destination: str, title: str, type_: str) -> str:
    seed = quote(f"{destination}|{title}|{type_}")
    return f"https://picsum.photos/seed/{seed}/960/640"


# ---------------------------------------------------------------------------
# Transient AI error detection
# ---------------------------------------------------------------------------

def is_transient_ai_error(message: str) -> bool:
    lower = message.lower()
    match = re.search(r"\[(\d{3})\s*[A-Za-z ]*\]", lower) or re.search(r"\b(\d{3})\b", lower)
    if match and int(match.group(1)) in (429, 500, 502, 503, 504):
        return True
    return any(
        phrase in lower
        for phrase in (
            "service unavailable",
            "high demand",
            "try again later",
            "temporarily unavailable",
        )
    )


# ---------------------------------------------------------------------------
# User resolution
# ---------------------------------------------------------------------------

def resolve_user_id(db: Session, user_id_raw=None, user_email_raw: str = "") -> int:
    """
    Resolve the userId from either a userId or userEmail.
    Creates a stub user if the email doesn't exist yet (guest flow).
    """
    from services.auth_service import find_or_create_user_by_email

    if user_id_raw is not None and str(user_id_raw).strip():
        uid = parse_positive_int(user_id_raw)
        if not uid:
            raise ValueError("userId must be a positive integer")
        return uid

    email = str(user_email_raw or "").lower().strip()
    if not email:
        raise ValueError("userId or userEmail is required")

    user = find_or_create_user_by_email(db, email)
    return user.id


# ---------------------------------------------------------------------------
# Itinerary sanitization (shared by generate + regenerate)
# ---------------------------------------------------------------------------

def sanitize_itinerary(raw_output, start_date: str, total_days: int) -> list[dict]:
    fallback_days = [
        {
            "day_number": i + 1,
            "date": add_days(start_date, i),
            "activities": [
                {
                    "time": "09:00",
                    "type": "landmark",
                    "title": "Free Exploration Block",
                    "description": "Use this block for a local recommendation or spontaneous plan.",
                    "cost_estimate": None,
                }
            ],
        }
        for i in range(total_days)
    ]

    if not raw_output or not isinstance(raw_output, dict):
        return fallback_days

    raw_days = raw_output.get("days")
    if not isinstance(raw_days, list):
        return fallback_days

    result = []
    for index in range(total_days):
        day_number = index + 1
        matching_day = next(
            (d for d in raw_days if d and int(d.get("day_number", 0)) == day_number),
            raw_days[index] if index < len(raw_days) else None,
        )

        safe_date = (
            str(matching_day["date"])
            if matching_day
            and is_valid_date_string(str(matching_day.get("date", "")))
            else add_days(start_date, index)
        )

        raw_activities = (
            matching_day.get("activities", [])
            if matching_day and isinstance(matching_day.get("activities"), list)
            else []
        )

        activities_for_day = []
        for activity in raw_activities[:6]:
            parsed_type = str(activity.get("type", "")).lower()
            act_type = parsed_type if parsed_type in VALID_ACTIVITY_TYPES else "landmark"
            time_val = (
                str(activity["time"])
                if re.match(r"^\d{2}:\d{2}$", str(activity.get("time", "")))
                else "09:00"
            )
            title = str(activity.get("title", "")).strip() or "Activity Suggestion"
            description = (
                str(activity.get("description", "")).strip()
                or "A local activity generated by TripSense."
            )
            cost_estimate = (
                str(activity["cost_estimate"]) if activity.get("cost_estimate") else None
            )
            if title and description:
                activities_for_day.append(
                    {
                        "time": time_val,
                        "type": act_type,
                        "title": title,
                        "description": description,
                        "cost_estimate": cost_estimate,
                    }
                )

        result.append(
            {
                "day_number": day_number,
                "date": safe_date,
                "activities": activities_for_day if activities_for_day else fallback_days[index]["activities"],
            }
        )

    return result


# ---------------------------------------------------------------------------
# Gemini prompt builders
# ---------------------------------------------------------------------------

def build_generate_prompt(
    destination: str,
    start_date: str,
    end_date: str,
    total_days: int,
    budget_tier: str,
    travel_group: str,
    vibe: list[str],
    dietary_prefs: list[str],
    must_dos: str,
    traveler_country: str,
) -> str:
    trip_input = json.dumps(
        {
            "destination": destination,
            "startDate": start_date,
            "endDate": end_date,
            "budgetTier": budget_tier,
            "travelGroup": travel_group,
            "vibe": vibe,
            "dietaryPrefs": dietary_prefs,
            "mustDos": must_dos or "None",
            "travelerCountry": traveler_country or "Guest / Unknown",
        },
        indent=2,
    )
    return f"""
SYSTEM INSTRUCTIONS:
You are TripSense's itinerary engine. Return ONLY valid JSON, without markdown or code fences.

REQUIRED JSON SHAPE:
{{
  "estimated_total": 0,
  "currency_code": "USD",
  "pricing_note": "short explanation",
  "days": [
    {{
      "day_number": 1,
      "date": "YYYY-MM-DD",
      "activities": [
        {{
          "time": "HH:MM",
          "type": "food | landmark | transit",
          "title": "short title",
          "description": "1-2 sentence description",
          "cost_estimate": "string or null"
        }}
      ]
    }}
  ]
}}

RULES:
- Return one realistic trip total estimate for the full trip in estimated_total.
- estimated_total should be a plain number, not a formatted string.
- Include accommodation, local transport, food, and major activity tickets in the estimate.
- Exclude international flights, visa fees, and personal shopping.
- Use the traveler's currency when travelerCountry is provided. If no travelerCountry is provided, use USD.
- currency_code must be a 3-letter ISO style currency code such as USD, INR, EUR, JPY.
- pricing_note should be one short sentence explaining what is included.
- Generate exactly {total_days} day objects.
- day_number must start from 1 and be sequential.
- Dates must stay in range {start_date} to {end_date}.
- Each day should have 3 to 5 activities.
- type must be one of: food, landmark, transit.
- time must be in 24-hour HH:MM format.
- Keep plan realistic with short transit and budget-aware options.
- Respect dietary preferences and must-dos/dealbreakers strictly.

TRIP INPUT:
{trip_input}
"""


def build_reroll_prompt(
    destination: str,
    budget_tier: str,
    travel_group: str,
    vibe: list[str],
    dietary_prefs: list[str],
    must_dos: str,
    day_number: int,
    day_date: str,
    time: str,
    type_: str,
    current_title: str,
    current_description: str,
    custom_request: str,
) -> str:
    context_json = json.dumps(
        {
            "destination": destination,
            "budgetTier": budget_tier,
            "travelGroup": travel_group,
            "vibe": vibe,
            "dietaryPrefs": dietary_prefs,
            "mustDos": must_dos,
        },
        indent=2,
    )
    activity_json = json.dumps(
        {"time": time, "type": type_, "title": current_title, "description": current_description},
        indent=2,
    )
    return f"""
SYSTEM INSTRUCTIONS:
You are TripSense's itinerary optimizer. Return ONLY valid JSON (no markdown).

REQUIRED JSON SHAPE:
{{
  "title": "new activity title",
  "description": "1-2 sentence replacement description",
  "cost_estimate": "string or null"
}}

RULES:
- Keep the same activity type: {type_}
- Keep similar timing: {time}
- Respect destination, budget, travel group, vibe, dietary preferences, and must-dos.
- Do not repeat the current activity title or description.
- Keep suggestion realistic for Day {day_number} ({day_date}).
- If a custom request is provided, make it the top priority while staying realistic for the same destination and time slot.

CURRENT TRIP CONTEXT:
{context_json}

CURRENT ACTIVITY:
{activity_json}

CUSTOM REQUEST:
{custom_request or "None"}
"""


# ---------------------------------------------------------------------------
# Image deduplication helper
# ---------------------------------------------------------------------------

async def fetch_unique_image(
    destination: str,
    title: str,
    type_: str,
    image_cache: dict,
    used_image_urls: set,
) -> str:
    cache_key = f"{destination}|{title}|{type_}"
    image_url = image_cache.get(cache_key)

    if not image_url:
        image_url = await get_location_image_url(destination, title, type_)
        image_cache[cache_key] = image_url

    if image_url in used_image_urls:
        retry_image = await get_location_image_url(destination, f"{title} {type_}", type_)
        if retry_image not in used_image_urls:
            image_url = retry_image

    if image_url in used_image_urls:
        image_url = build_seeded_fallback_image(destination, title, type_)

    used_image_urls.add(image_url)
    return image_url


# ---------------------------------------------------------------------------
# DB insertion — trip + days + activities
# ---------------------------------------------------------------------------

async def save_trip_with_itinerary(
    db: Session,
    user_id: int,
    destination: str,
    start_date: str,
    end_date: str,
    budget_tier: str,
    travel_group: str,
    vibe: list[str],
    dietary_prefs: list[str],
    must_dos: str | None,
    estimated_cost: str | None,
    estimated_currency: str,
    estimated_cost_note: str,
    sanitized_days: list[dict],
) -> int:
    """Insert trip, days, and activities into DB. Returns the new trip ID."""
    trip = Trip(
        user_id=user_id,
        destination=destination,
        start_date=date.fromisoformat(start_date),
        end_date=date.fromisoformat(end_date),
        budget_tier=budget_tier,
        travel_group=travel_group,
        vibe=vibe,
        dietary_prefs=dietary_prefs,
        must_dos=must_dos,
        estimated_cost=estimated_cost,
        estimated_currency=estimated_currency,
        estimated_cost_note=estimated_cost_note,
    )
    db.add(trip)
    db.flush()  # get trip.id without committing

    image_cache: dict[str, str] = {}
    used_image_urls: set[str] = set()

    for day_data in sanitized_days:
        day = ItineraryDay(
            trip_id=trip.id,
            day_number=day_data["day_number"],
            date=date.fromisoformat(day_data["date"]),
        )
        db.add(day)
        db.flush()

        # Fetch images concurrently for all activities in this day
        activity_list = day_data.get("activities", [])
        image_tasks = [
            fetch_unique_image(
                destination,
                act["title"],
                act["type"],
                image_cache,
                used_image_urls,
            )
            for act in activity_list
        ]
        image_urls = await asyncio.gather(*image_tasks)

        for act_data, image_url in zip(activity_list, image_urls):
            act_type = ActivityTypeEnum(act_data["type"])
            activity = Activity(
                day_id=day.id,
                time=act_data["time"],
                type=act_type,
                title=act_data["title"],
                description=act_data["description"],
                cost_estimate=normalize_estimated_cost_for_db(act_data.get("cost_estimate")),
                image_url=image_url,
            )
            db.add(activity)

    db.commit()
    db.refresh(trip)
    return trip.id


# ---------------------------------------------------------------------------
# Discover-trip helpers
# ---------------------------------------------------------------------------

VALID_ACTIVITY_TYPES_SET = {"food", "landmark", "transit"}


def build_discover_expansion_prompt(
    destination: str,
    duration: str,
    persona: str,
    vibe: str,
    budget_tier: str,
    travel_group: str,
    traveler_country: str,
    discover_days: list[dict],
) -> str:
    payload = json.dumps(
        {
            "destination": destination,
            "duration": duration,
            "persona": persona,
            "vibe": vibe,
            "budgetTier": budget_tier,
            "travelGroup": travel_group,
            "travelerCountry": traveler_country or "Guest / Unknown",
            "discoverDays": discover_days,
        },
        indent=2,
    )
    return f"""
SYSTEM INSTRUCTIONS:
You are TripSense's itinerary engine. Expand a preplanned Discover trip into a fuller real-world itinerary.
Return ONLY valid JSON without markdown or code fences.

REQUIRED JSON SHAPE:
{{
  "days": [
    {{
      "day_number": 1,
      "date": "YYYY-MM-DD",
      "activities": [
        {{
          "time": "HH:MM",
          "type": "food | landmark | transit",
          "title": "short title",
          "description": "1-2 sentence description",
          "cost_estimate": "string or null"
        }}
      ]
    }}
  ]
}}

RULES:
- Generate exactly {len(discover_days)} day objects.
- For each day, keep the provided Discover title/description as the day's anchor highlight.
- Each day should have 4 to 6 activities with a natural flow.
- type must be one of: food, landmark, transit.
- Use 24-hour times in chronological order.

DISCOVER TRIP INPUT:
{payload}
"""


def build_estimate_prompt(
    destination: str,
    duration: str,
    persona: str,
    vibe: str,
    budget_tier: str,
    travel_group: str,
    traveler_country: str,
    days: list[dict],
) -> str:
    payload = json.dumps(
        {
            "destination": destination,
            "duration": duration,
            "persona": persona,
            "vibe": vibe,
            "budgetTier": budget_tier,
            "travelGroup": travel_group,
            "travelerCountry": traveler_country or "Guest / Unknown",
            "days": days,
        },
        indent=2,
    )
    return f"""
SYSTEM INSTRUCTIONS:
You are TripSense's trip pricing assistant. Return ONLY valid JSON without markdown or code fences.

REQUIRED JSON SHAPE:
{{
  "estimated_total": 0,
  "currency_code": "USD",
  "pricing_note": "short explanation"
}}

RULES:
- estimated_total must be one plain number for the full trip.
- Include accommodation, local transport, food, and major activity tickets.
- Exclude international flights, visa fees, and personal shopping.
- Use the traveler's currency when travelerCountry is provided. If not, use USD.
- currency_code must be a 3-letter ISO style code.
- pricing_note should be one short sentence.

TRIP INPUT:
{payload}
"""


def sanitize_discover_itinerary(
    raw_output,
    discover_days: list[dict],
    start_date: str,
    destination: str,
) -> list[dict]:
    total = len(discover_days)

    def fallback_acts(day_data: dict, idx: int) -> list[dict]:
        short = destination.split(",")[0].strip()
        title = day_data.get("title", "Highlight")
        desc  = str(day_data.get("description", "")).strip()
        if idx == 0:
            return [
                {"time": "14:00", "type": "transit", "title": f"Arrival in {short}",
                 "description": f"Arrive in {short} and transfer to accommodation.", "cost_estimate": None},
                {"time": "16:00", "type": "landmark", "title": title, "description": desc or "Explore the area.", "cost_estimate": None},
                {"time": "18:30", "type": "food", "title": "Welcome Dinner", "description": "Start your trip with a local meal.", "cost_estimate": None},
            ]
        if idx == total - 1:
            return [
                {"time": "09:00", "type": "food", "title": "Breakfast", "description": f"Final morning in {short}.", "cost_estimate": None},
                {"time": "11:00", "type": "landmark", "title": title, "description": desc or "Explore the area.", "cost_estimate": None},
                {"time": "17:30", "type": "transit", "title": f"Departure from {short}", "description": "Head to the airport/station.", "cost_estimate": None},
            ]
        return [
            {"time": "09:00", "type": "food", "title": "Breakfast", "description": "Start the day with a local breakfast.", "cost_estimate": None},
            {"time": "10:30", "type": "landmark", "title": title, "description": desc or "Explore the area.", "cost_estimate": None},
            {"time": "13:30", "type": "food", "title": "Lunch Stop", "description": "Midday food break.", "cost_estimate": None},
            {"time": "19:00", "type": "food", "title": "Dinner and Evening Stroll", "description": "Close the day with dinner.", "cost_estimate": None},
        ]

    if not raw_output or not isinstance(raw_output, dict):
        return [
            {"day_number": d["day"], "date": add_days(start_date, i), "activities": fallback_acts(d, i)}
            for i, d in enumerate(discover_days)
        ]

    raw_days = raw_output.get("days")
    if not isinstance(raw_days, list):
        return [
            {"day_number": d["day"], "date": add_days(start_date, i), "activities": fallback_acts(d, i)}
            for i, d in enumerate(discover_days)
        ]

    result = []
    for idx, disc_day in enumerate(discover_days):
        matching = next(
            (rd for rd in raw_days if rd and int(rd.get("day_number", 0)) == disc_day["day"]),
            raw_days[idx] if idx < len(raw_days) else None,
        )
        safe_date = (
            str(matching["date"])
            if matching and is_valid_date_string(str(matching.get("date", "")))
            else add_days(start_date, idx)
        )
        raw_acts = matching.get("activities", []) if matching and isinstance(matching.get("activities"), list) else []
        sanitized = []
        for act in raw_acts[:6]:
            t = str(act.get("type", "")).lower()
            act_type = t if t in VALID_ACTIVITY_TYPES_SET else "landmark"
            time_val = str(act["time"]) if re.match(r"^\d{2}:\d{2}$", str(act.get("time", ""))) else "09:00"
            title = str(act.get("title", "")).strip() or disc_day.get("title", "Activity")
            desc  = str(act.get("description", "")).strip() or "A local activity."
            sanitized.append({"time": time_val, "type": act_type, "title": title,
                               "description": desc, "cost_estimate": str(act["cost_estimate"]) if act.get("cost_estimate") else None})
        if len(sanitized) < 4:
            fb = fallback_acts(disc_day, idx)
            seen = {f"{a['time']}|{a['title']}".lower() for a in sanitized}
            for fa in fb:
                if len(sanitized) >= 5:
                    break
                if f"{fa['time']}|{fa['title']}".lower() not in seen:
                    sanitized.append(fa)
            sanitized.sort(key=lambda x: x["time"])
        result.append({"day_number": disc_day["day"], "date": safe_date, "activities": sanitized or fallback_acts(disc_day, idx)})
    return result
