"""
Gemini service — port of lib/gemini.ts.

Uses the new google-genai SDK (replaces deprecated google-generativeai).
Implements model fallback, exponential backoff retry on transient errors,
and JSON parsing with code-fence stripping.
"""

import asyncio
import json
import random
import re
import time

from google import genai
from google.genai import types as genai_types

from config import settings

_client: genai.Client | None = None


def _get_client() -> genai.Client:
    global _client
    if _client is None:
        if not settings.GEMINI_API_KEY:
            raise RuntimeError("GEMINI_API_KEY is missing. Add it to .env.local")
        _client = genai.Client(api_key=settings.GEMINI_API_KEY)
    return _client


def _get_candidate_models() -> list[str]:
    configured = settings.GEMINI_MODEL.strip() if settings.GEMINI_MODEL else ""
    candidates = [
        configured,
        "gemini-2.5-flash-lite-preview-06-17",
        "gemini-2.5-flash",
        "gemini-2.0-flash",
    ]
    seen: set[str] = set()
    result: list[str] = []
    for m in candidates:
        if m and m not in seen:
            seen.add(m)
            result.append(m)
    return result


def _strip_code_fences(raw: str) -> str:
    text = raw.strip()
    text = re.sub(r"^```json\s*", "", text, flags=re.IGNORECASE)
    text = re.sub(r"^```", "", text)
    text = re.sub(r"```$", "", text)
    return text.strip()


def _parse_gemini_json(raw_text: str) -> dict:
    cleaned = _strip_code_fences(raw_text)
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        raise ValueError("Gemini returned invalid JSON")


def _get_error_status_code(error: Exception) -> int | None:
    msg = str(error)
    match = re.search(r"\[(\d{3})\s*[A-Za-z ]*\]", msg) or re.search(r"\b(\d{3})\b", msg)
    return int(match.group(1)) if match else None


def _is_model_not_found_error(error: Exception) -> bool:
    msg = str(error).lower()
    return (
        "404" in msg
        or "not found" in msg
        or "is not supported for generatecontent" in msg
    )


def _is_transient_gemini_error(error: Exception) -> bool:
    status = _get_error_status_code(error)
    if status and status in (429, 500, 502, 503, 504):
        return True
    msg = str(error).lower()
    return any(
        phrase in msg
        for phrase in (
            "service unavailable",
            "high demand",
            "temporarily unavailable",
            "try again later",
            "timeout",
        )
    )


def generate_structured_json_sync(prompt: str, temperature: float = 0.25) -> dict:
    """
    Synchronous Gemini call with model fallback and retry.
    Run via asyncio.to_thread() from async context.
    """
    client = _get_client()
    candidate_models = _get_candidate_models()
    max_attempts_per_model = 3
    last_error: Exception | None = None

    for model_name in candidate_models:
        for attempt in range(1, max_attempts_per_model + 1):
            try:
                response = client.models.generate_content(
                    model=model_name,
                    contents=prompt,
                    config=genai_types.GenerateContentConfig(
                        temperature=temperature,
                        response_mime_type="application/json",
                    ),
                )
                return _parse_gemini_json(response.text)
            except Exception as exc:
                last_error = exc

                if _is_model_not_found_error(exc):
                    break  # try next model

                is_transient = _is_transient_gemini_error(exc)
                can_retry = is_transient and attempt < max_attempts_per_model

                if can_retry:
                    backoff = 0.7 * (2 ** (attempt - 1)) + random.uniform(0, 0.25)
                    time.sleep(backoff)
                    continue

                if is_transient:
                    break  # try next model

                raise  # non-transient — surface immediately

    configured_model = settings.GEMINI_MODEL.strip()
    fallback_msg = (
        f'Configured GEMINI_MODEL "{configured_model}" is unavailable.'
        if configured_model
        else "No working Gemini model found."
    )
    tried = ", ".join(candidate_models)
    last_msg = str(last_error) if last_error else ""
    raise RuntimeError(f"{fallback_msg} Tried models: {tried}. {last_msg}".strip())


async def generate_structured_json(prompt: str, temperature: float = 0.25) -> dict:
    """Async wrapper — runs the sync Gemini call in a thread pool."""
    return await asyncio.to_thread(generate_structured_json_sync, prompt, temperature)
