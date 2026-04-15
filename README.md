# TripSense MVP (Frontend + Backend)

TripSense is a full MVP for an AI-powered travel itinerary generator.

## Built With

- React + Next.js (App Router)
- Tailwind CSS
- `lucide-react` icons
- `framer-motion` (for step transitions in the form)
- NeonDB (Serverless PostgreSQL)
- Drizzle ORM
- Google Gemini (`@google/generative-ai`)

## Pages

- `/trips` -> My Trips Hub
- `/plan` -> 6-step questionnaire form
- `/itinerary` -> Active itinerary timeline dashboard

## API Routes

- `POST /api/trips/generate` -> Generate itinerary from questionnaire and save in DB
- `GET /api/trips?userId=...` -> List all trips for one user
- `GET /api/trips/:id` -> Fetch one trip with days + activities
- `POST /api/trips/re-roll` -> Re-roll one activity with Gemini and update DB

## Environment Variables

Create `.env.local` from `.env.example`:

```bash
DATABASE_URL="postgres://..."
GEMINI_API_KEY="..."
GEMINI_MODEL="gemini-2.5-flash-lite"
```

## Run Locally

```bash
npm install
npm run db:push
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

## Project Structure

- `db/schema.ts` - Drizzle schema + relations
- `db/index.ts` - Neon + Drizzle connection
- `app/api/trips/generate/route.ts` - Generate and save itinerary
- `app/api/trips/route.ts` - List trips for dashboard
- `app/api/trips/[id]/route.ts` - Trip detail with timeline data
- `app/api/trips/re-roll/route.ts` - Activity reroll endpoint
- `lib/gemini.ts` - Shared Gemini JSON utility
- `app/trips/page.jsx` - Dashboard for saved trips
- `app/plan/page.jsx` - Multi-step progressive form
- `app/itinerary/page.jsx` - Timeline, map placeholder, utilities
- `components/` - Reusable UI and feature components
- `context/TripPlannerContext.jsx` - Shared form/trip state
- `data/itineraryData.js` - Mock 3-day itinerary JSON
