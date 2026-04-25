# TripSense FastAPI Backend

Python FastAPI backend for TripSense — replaces the Next.js API routes while keeping the frontend unchanged.

## Prerequisites

- Python 3.11+
- A Neon PostgreSQL database (existing schema, no changes needed)
- A Gemini API key

## Setup

```bash
cd backend

# Create virtual environment
python -m venv .venv
.venv\Scripts\activate        # Windows
# source .venv/bin/activate   # macOS / Linux

# Install dependencies
pip install -r requirements.txt

# Copy and fill in secrets
cp .env.example .env.local
# Edit .env.local: set DATABASE_URL, GEMINI_API_KEY
```

## First-time database stamp (DB schema already exists)

```bash
alembic stamp head
```

## Run the development server

```bash
uvicorn main:app --reload --port 8000
```

OpenAPI docs: http://localhost:8000/docs

## Environment variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string (Neon) |
| `GEMINI_API_KEY` | Google Gemini API key |
| `GEMINI_MODEL` | Model name (default: `gemini-2.5-flash-lite`) |
| `FRONTEND_ORIGIN` | CORS origin (default: `http://localhost:3000`) |

## API Endpoints

| Method | Path | Description |
|---|---|---|
| POST | `/api/auth/email` | Sign in / sign up / Google auth |
| PATCH | `/api/auth/account` | Update profile |
| POST | `/api/auth/account` | Change password |
| DELETE | `/api/auth/account` | Delete account |
| GET | `/api/trips` | List trips by userId or userEmail |
| POST | `/api/trips/generate` | Generate new trip with Gemini |
| POST | `/api/trips/from-discover` | Create trip from Discover template |
| POST | `/api/trips/claim-guest` | Claim guest trips to real account |
| GET | `/api/trips/{id}` | Fetch trip detail with days/activities |
| DELETE | `/api/trips/{id}` | Delete trip (owner only) |
| POST | `/api/trips/{id}/regenerate` | Regenerate full itinerary |
| POST | `/api/trips/re-roll` | Re-roll a single activity |
