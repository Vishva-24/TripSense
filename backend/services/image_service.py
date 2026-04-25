"""
Image service — async port of lib/location-image.ts.

Searches Wikipedia Summary API, then Wikipedia Search API,
then falls back to a deterministic picsum seed URL.
"""

import asyncio
import re
from urllib.parse import urlencode, quote_plus

import httpx

TIMEOUT_SECONDS = 7.0


def _get_fallback_image(label: str) -> str:
    from urllib.parse import quote
    return f"https://picsum.photos/seed/{quote(label)}/960/640"


def _normalize_search_query(value: str) -> str:
    text = re.sub(r"[|,;:()\[\]{}]+", " ", str(value or ""))
    return re.sub(r"\s+", " ", text).strip()


def _dedupe_queries(values: list[str]) -> list[str]:
    seen: set[str] = set()
    result: list[str] = []
    for v in values:
        normalized = _normalize_search_query(v)
        if normalized and normalized not in seen:
            seen.add(normalized)
            result.append(normalized)
    return result


_GENERIC_PREFIXES = re.compile(
    r"^(arrival|arrive|depart|departure|travel|transfer|visit|explore|exploration|"
    r"check[\s-]?in|check[\s-]?out|breakfast|lunch|dinner|snack|walk|stroll|tour|"
    r"metro|bus|train|ferry|cruise|flight)[\s:-]*",
    re.IGNORECASE,
)


def _trim_generic_prefix(title: str) -> str:
    return _GENERIC_PREFIXES.sub("", title).strip()


def _extract_place_hints_from_title(title: str) -> list[str]:
    clean = _normalize_search_query(title)
    if not clean:
        return []

    hints: set[str] = {clean}
    connectors = [" to ", " in ", " at ", " near ", " around ", " from ", " via "]
    lower = clean.lower()

    for connector in connectors:
        idx = lower.find(connector)
        if idx >= 0:
            after = clean[idx + len(connector):].strip()
            before = clean[:idx].strip()
            if after:
                hints.add(after)
            if before:
                hints.add(before)

    without_prefix = _trim_generic_prefix(clean)
    if without_prefix:
        hints.add(without_prefix)

    return [h for h in hints if len(h) >= 2]


def _is_usable_image_url(url: str | None) -> bool:
    if not url:
        return False
    url = str(url).strip()
    if not re.match(r"^https?://", url, re.IGNORECASE):
        return False
    if re.search(r"placehold\.co", url, re.IGNORECASE):
        return False
    if re.search(r"\.svg(\?|#|$)", url, re.IGNORECASE):
        return False
    return True


async def _search_wikipedia_summary_image(
    client: httpx.AsyncClient, query: str
) -> str | None:
    normalized = query.strip().replace(" ", "_")
    if not normalized:
        return None
    url = f"https://en.wikipedia.org/api/rest_v1/page/summary/{quote_plus(normalized)}"
    try:
        resp = await client.get(url, timeout=TIMEOUT_SECONDS)
        if not resp.is_success:
            return None
        data = resp.json()
        image_url = data.get("thumbnail", {}).get("source") or None
        return image_url if _is_usable_image_url(image_url) else None
    except Exception:
        return None


async def _search_wikipedia_image(
    client: httpx.AsyncClient, query: str
) -> str | None:
    params = {
        "action": "query",
        "format": "json",
        "origin": "*",
        "generator": "search",
        "gsrsearch": query,
        "gsrlimit": "8",
        "prop": "pageimages",
        "piprop": "thumbnail",
        "pithumbsize": "800",
    }
    url = f"https://en.wikipedia.org/w/api.php?{urlencode(params)}"
    try:
        resp = await client.get(url, timeout=TIMEOUT_SECONDS)
        if not resp.is_success:
            return None
        data = resp.json()
        pages = data.get("query", {}).get("pages", {})
        for page in pages.values():
            candidate = page.get("thumbnail", {}).get("source")
            if _is_usable_image_url(candidate):
                return candidate
        return None
    except Exception:
        return None


async def get_location_image_url(
    destination: str,
    title: str,
    type: str,  # "food" | "landmark" | "transit"
) -> str:
    """
    Fetch the best available image for an activity.
    Strategy: Wikipedia Summary → Wikipedia Search → picsum fallback.
    """
    dest = _normalize_search_query(destination)
    ttl = _normalize_search_query(title)
    type_label = (
        "restaurant" if type == "food"
        else "transport" if type == "transit"
        else "landmark"
    )

    place_hints = _extract_place_hints_from_title(ttl)

    specific_queries = _dedupe_queries(
        [
            item
            for hint in place_hints
            for item in [
                f"{hint} {dest}" if dest else hint,
                hint,
                f"{hint} {type_label}",
            ]
        ]
    )

    generic_queries = _dedupe_queries(
        [
            f"{dest} {type_label}",
            f"{dest} tourism",
            f"{dest} travel",
            dest,
        ]
    )

    async with httpx.AsyncClient() as client:
        # Phase 1: specific summary
        for query in specific_queries:
            img = await _search_wikipedia_summary_image(client, query)
            if img:
                return img

        # Phase 2: specific search
        for query in specific_queries:
            img = await _search_wikipedia_image(client, query)
            if img:
                return img

        # Phase 3: generic summary
        for query in generic_queries:
            img = await _search_wikipedia_summary_image(client, query)
            if img:
                return img

        # Phase 4: generic search
        for query in generic_queries:
            img = await _search_wikipedia_image(client, query)
            if img:
                return img

    return _get_fallback_image(f"{ttl or dest} Trip")
