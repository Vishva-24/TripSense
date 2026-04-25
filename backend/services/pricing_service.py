"""
Pricing normalization helpers — direct port of lib/trip-pricing.ts.
"""

import re

DEFAULT_CURRENCY = "USD"


def normalize_estimated_cost_for_db(value) -> str | None:
    """Convert raw Gemini cost estimate to a 2-decimal string or None."""
    if value is None:
        return None
    raw = str(value).strip()
    if not raw or raw.lower() in ("null", "n/a"):
        return None
    numeric_part = re.sub(r"[^0-9.]", "", raw)
    if not numeric_part:
        return None
    try:
        parsed = float(numeric_part)
    except ValueError:
        return None
    if not (parsed >= 0):
        return None
    return f"{parsed:.2f}"


def normalize_estimated_currency(value, fallback: str = DEFAULT_CURRENCY) -> str:
    """Extract a 3-letter ISO currency code, or return fallback."""
    raw = re.sub(r"[^A-Z]", "", str(value or "").strip().upper())
    return raw if len(raw) == 3 else fallback


def normalize_estimate_note(value) -> str:
    """Return a clean pricing note string."""
    raw = re.sub(r"\s+", " ", str(value or "")).strip()
    return raw or "Estimated by TripSense AI during trip generation."
