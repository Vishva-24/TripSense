# Graph Report - C:\Users\pujar\Documents\GitHub\TripSense  (2026-04-25)

## Corpus Check
- 85 files · ~86,250 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 381 nodes · 658 edges · 64 communities detected
- Extraction: 72% EXTRACTED · 28% INFERRED · 0% AMBIGUOUS · INFERRED: 184 edges (avg confidence: 0.73)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 36|Community 36]]
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Community 38|Community 38]]
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Community 40|Community 40]]
- [[_COMMUNITY_Community 41|Community 41]]
- [[_COMMUNITY_Community 42|Community 42]]
- [[_COMMUNITY_Community 43|Community 43]]
- [[_COMMUNITY_Community 44|Community 44]]
- [[_COMMUNITY_Community 45|Community 45]]
- [[_COMMUNITY_Community 46|Community 46]]
- [[_COMMUNITY_Community 47|Community 47]]
- [[_COMMUNITY_Community 48|Community 48]]
- [[_COMMUNITY_Community 49|Community 49]]
- [[_COMMUNITY_Community 50|Community 50]]
- [[_COMMUNITY_Community 51|Community 51]]
- [[_COMMUNITY_Community 52|Community 52]]
- [[_COMMUNITY_Community 53|Community 53]]
- [[_COMMUNITY_Community 54|Community 54]]
- [[_COMMUNITY_Community 55|Community 55]]
- [[_COMMUNITY_Community 56|Community 56]]
- [[_COMMUNITY_Community 57|Community 57]]
- [[_COMMUNITY_Community 58|Community 58]]
- [[_COMMUNITY_Community 59|Community 59]]
- [[_COMMUNITY_Community 60|Community 60]]
- [[_COMMUNITY_Community 61|Community 61]]
- [[_COMMUNITY_Community 62|Community 62]]
- [[_COMMUNITY_Community 63|Community 63]]

## God Nodes (most connected - your core abstractions)
1. `POST()` - 40 edges
2. `regenerate_trip()` - 20 edges
3. `from_discover()` - 18 edges
4. `generate_trip()` - 16 edges
5. `GET()` - 13 edges
6. `User` - 12 edges
7. `Trips router — all /api/trips/* endpoints.` - 12 edges
8. `get_location_image_url()` - 12 edges
9. `Base` - 11 edges
10. `save_trip_with_itinerary()` - 11 edges

## Surprising Connections (you probably didn't know these)
- `User` --uses--> `Auth service: password hashing, verification, and user CRUD.  Password format is`  [INFERRED]
  C:\Users\pujar\Documents\GitHub\TripSense\backend\db\models.py → C:\Users\pujar\Documents\GitHub\TripSense\backend\services\auth_service.py
- `User` --uses--> `Produce a salt:hash string using scrypt — identical format to Node.js.`  [INFERRED]
  C:\Users\pujar\Documents\GitHub\TripSense\backend\db\models.py → C:\Users\pujar\Documents\GitHub\TripSense\backend\services\auth_service.py
- `User` --uses--> `Verify password against a salt:hash string. Timing-safe.`  [INFERRED]
  C:\Users\pujar\Documents\GitHub\TripSense\backend\db\models.py → C:\Users\pujar\Documents\GitHub\TripSense\backend\services\auth_service.py
- `User` --uses--> `Find an existing user or create a minimal stub (guest/google flow).`  [INFERRED]
  C:\Users\pujar\Documents\GitHub\TripSense\backend\db\models.py → C:\Users\pujar\Documents\GitHub\TripSense\backend\services\auth_service.py
- `POST()` --calls--> `getDiscoverTripBySlug()`  [INFERRED]
  C:\Users\pujar\Documents\GitHub\TripSense\app\api\trips\[id]\regenerate\route.ts → C:\Users\pujar\Documents\GitHub\TripSense\lib\discoverTrips.ts

## Communities

### Community 0 - "Community 0"
Cohesion: 0.08
Nodes (43): addDays(), buildDiscoverExpansionPrompt(), buildEstimatePrompt(), buildFallbackActivitiesForDay(), buildGeneratePrompt(), buildRerollPrompt(), buildSeededFallbackImage(), daysBetweenInclusive() (+35 more)

### Community 1 - "Community 1"
Cohesion: 0.14
Nodes (36): generate_structured_json(), Async wrapper — runs the sync Gemini call in a thread pool., normalize_estimate_note(), normalize_estimated_cost_for_db(), normalize_estimated_currency(), Pricing normalization helpers — direct port of lib/trip-pricing.ts., Convert raw Gemini cost estimate to a 2-decimal string or None., Extract a 3-letter ISO currency code, or return fallback. (+28 more)

### Community 2 - "Community 2"
Cohesion: 0.15
Nodes (23): Base, DeclarativeBase, Run migrations in 'offline' mode.      This configures the context with just a U, Run migrations in 'online' mode.      In this scenario we need to create an Engi, run_migrations_offline(), run_migrations_online(), create_agent_request(), FastAPI application entry point. (+15 more)

### Community 3 - "Community 3"
Cohesion: 0.17
Nodes (22): auth_email(), change_password(), delete_account(), patch_account(), Auth router — maps to:   POST   /api/auth/email    (signin / signup / google), create_user(), delete_user(), find_or_create_user_by_email() (+14 more)

### Community 4 - "Community 4"
Cohesion: 0.13
Nodes (22): AgentRequestStatusUpdate, AuthRequest, AuthResponse, ChangePasswordRequest, DeleteAccountRequest, PatchAccountRequest, Pydantic schemas for authentication endpoints., UserOut (+14 more)

### Community 5 - "Community 5"
Cohesion: 0.14
Nodes (6): handleSaveDefaults(), handleSaveProfile(), isValidEmail(), getTodayIsoDate(), isPastPlannerDate(), normalizePlannerVibes()

### Community 6 - "Community 6"
Cohesion: 0.33
Nodes (11): _dedupe_queries(), _extract_place_hints_from_title(), _get_fallback_image(), get_location_image_url(), _is_usable_image_url(), _normalize_search_query(), Image service — async port of lib/location-image.ts.  Searches Wikipedia Summary, Fetch the best available image for an activity.     Strategy: Wikipedia Summary (+3 more)

### Community 7 - "Community 7"
Cohesion: 0.31
Nodes (8): applyLoveSwipe(), applySwipeResult(), deriveBudgetHint(), derivePlannerVibes(), resolveImageSource(), resolveImageStage(), resolvePersona(), triggerSwipe()

### Community 8 - "Community 8"
Cohesion: 0.31
Nodes (10): generate_structured_json_sync(), _get_candidate_models(), _get_client(), _get_error_status_code(), _is_model_not_found_error(), _is_transient_gemini_error(), _parse_gemini_json(), Gemini service — port of lib/gemini.ts.  Uses the new google-genai SDK (replaces (+2 more)

### Community 9 - "Community 9"
Cohesion: 0.36
Nodes (10): generateStructuredJson(), getCandidateModels(), getErrorMessage(), getErrorStatusCode(), getGeminiClient(), isModelNotFoundError(), isTransientGeminiError(), parseGeminiJson() (+2 more)

### Community 10 - "Community 10"
Cohesion: 0.4
Nodes (10): dedupeQueries(), extractPlaceHintsFromTitle(), fetchWithTimeout(), getFallbackImage(), getLocationImageUrl(), isUsableImageUrl(), normalizeSearchQuery(), searchWikipediaImage() (+2 more)

### Community 11 - "Community 11"
Cohesion: 0.36
Nodes (5): claimGuestTripsForUser(), claimGuestTripsToUser(), normalizeGuestClaims(), readGuestTripClaims(), writeGuestTripClaims()

### Community 12 - "Community 12"
Cohesion: 0.33
Nodes (2): formatDateRange(), ItineraryExperience()

### Community 13 - "Community 13"
Cohesion: 0.38
Nodes (3): estimateActivityCost(), estimateTripTotal(), getNormalizedBudgetTier()

### Community 14 - "Community 14"
Cohesion: 0.33
Nodes (2): PlanTripPage(), useTripPlanner()

### Community 15 - "Community 15"
Cohesion: 0.4
Nodes (3): get_discover_trip_by_slug(), Statically ported discover trips data from lib/discoverTrips.ts. Do not edit ma, Return the discover trip dict for a given slug, or None if not found.

### Community 16 - "Community 16"
Cohesion: 0.7
Nodes (4): addGuestTripClaim(), handleCreateTrip(), readTravelDefaults(), resolvePlannerIdentity()

### Community 17 - "Community 17"
Cohesion: 0.5
Nodes (2): CarouselNext(), useCarousel()

### Community 18 - "Community 18"
Cohesion: 0.6
Nodes (3): animate(), drawDots(), drawRoutes()

### Community 19 - "Community 19"
Cohesion: 0.4
Nodes (2): getDiscoverTripBySlug(), DiscoverTripPage()

### Community 20 - "Community 20"
Cohesion: 0.5
Nodes (3): BaseSettings, Application settings loaded from .env.local (or environment variables). Secrets, Settings

### Community 21 - "Community 21"
Cohesion: 0.5
Nodes (1): Convert discoverTrips.ts into a Python data file. Run from project root: python

### Community 22 - "Community 22"
Cohesion: 0.5
Nodes (1): add agent_requests table  Revision ID: bc2da90f0a71 Revises:  Create Date: 2026-

### Community 23 - "Community 23"
Cohesion: 0.5
Nodes (1): Add agent_requests table  Revision ID: d0c29906beb3 Revises: bc2da90f0a71 Create

### Community 24 - "Community 24"
Cohesion: 0.67
Nodes (1): get_all_agent_requests()

### Community 25 - "Community 25"
Cohesion: 0.67
Nodes (0): 

### Community 26 - "Community 26"
Cohesion: 1.0
Nodes (0): 

### Community 27 - "Community 27"
Cohesion: 1.0
Nodes (0): 

### Community 28 - "Community 28"
Cohesion: 1.0
Nodes (0): 

### Community 29 - "Community 29"
Cohesion: 1.0
Nodes (0): 

### Community 30 - "Community 30"
Cohesion: 1.0
Nodes (0): 

### Community 31 - "Community 31"
Cohesion: 1.0
Nodes (0): 

### Community 32 - "Community 32"
Cohesion: 1.0
Nodes (0): 

### Community 33 - "Community 33"
Cohesion: 1.0
Nodes (0): 

### Community 34 - "Community 34"
Cohesion: 1.0
Nodes (0): 

### Community 35 - "Community 35"
Cohesion: 1.0
Nodes (0): 

### Community 36 - "Community 36"
Cohesion: 1.0
Nodes (0): 

### Community 37 - "Community 37"
Cohesion: 1.0
Nodes (0): 

### Community 38 - "Community 38"
Cohesion: 1.0
Nodes (0): 

### Community 39 - "Community 39"
Cohesion: 1.0
Nodes (0): 

### Community 40 - "Community 40"
Cohesion: 1.0
Nodes (0): 

### Community 41 - "Community 41"
Cohesion: 1.0
Nodes (0): 

### Community 42 - "Community 42"
Cohesion: 1.0
Nodes (0): 

### Community 43 - "Community 43"
Cohesion: 1.0
Nodes (0): 

### Community 44 - "Community 44"
Cohesion: 1.0
Nodes (0): 

### Community 45 - "Community 45"
Cohesion: 1.0
Nodes (0): 

### Community 46 - "Community 46"
Cohesion: 1.0
Nodes (0): 

### Community 47 - "Community 47"
Cohesion: 1.0
Nodes (0): 

### Community 48 - "Community 48"
Cohesion: 1.0
Nodes (0): 

### Community 49 - "Community 49"
Cohesion: 1.0
Nodes (0): 

### Community 50 - "Community 50"
Cohesion: 1.0
Nodes (0): 

### Community 51 - "Community 51"
Cohesion: 1.0
Nodes (0): 

### Community 52 - "Community 52"
Cohesion: 1.0
Nodes (0): 

### Community 53 - "Community 53"
Cohesion: 1.0
Nodes (0): 

### Community 54 - "Community 54"
Cohesion: 1.0
Nodes (0): 

### Community 55 - "Community 55"
Cohesion: 1.0
Nodes (0): 

### Community 56 - "Community 56"
Cohesion: 1.0
Nodes (0): 

### Community 57 - "Community 57"
Cohesion: 1.0
Nodes (0): 

### Community 58 - "Community 58"
Cohesion: 1.0
Nodes (0): 

### Community 59 - "Community 59"
Cohesion: 1.0
Nodes (0): 

### Community 60 - "Community 60"
Cohesion: 1.0
Nodes (0): 

### Community 61 - "Community 61"
Cohesion: 1.0
Nodes (0): 

### Community 62 - "Community 62"
Cohesion: 1.0
Nodes (0): 

### Community 63 - "Community 63"
Cohesion: 1.0
Nodes (0): 

## Knowledge Gaps
- **20 isolated node(s):** `Application settings loaded from .env.local (or environment variables). Secrets`, `Convert discoverTrips.ts into a Python data file. Run from project root: python`, `add agent_requests table  Revision ID: bc2da90f0a71 Revises:  Create Date: 2026-`, `Add agent_requests table  Revision ID: d0c29906beb3 Revises: bc2da90f0a71 Create`, `Statically ported discover trips data from lib/discoverTrips.ts. Do not edit ma` (+15 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 26`** (2 nodes): `layout.js`, `RootLayout()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 27`** (2 nodes): `page.jsx`, `AgentDeskPage()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 28`** (2 nodes): `page.tsx`, `TrailCardPreviewPage()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 29`** (2 nodes): `page.jsx`, `LegacyItineraryPage()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 30`** (2 nodes): `page.tsx`, `TripItineraryPage()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 31`** (2 nodes): `ActivityCard()`, `ActivityCard.jsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 32`** (2 nodes): `Navbar.tsx`, `syncAuthState()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 33`** (2 nodes): `TripCard.jsx`, `TripCard()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 34`** (2 nodes): `UtilityDrawer.jsx`, `UtilityDrawer()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 35`** (2 nodes): `cobe-globe.tsx`, `Globe()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 36`** (2 nodes): `demo.tsx`, `DemoAiAssistatBasic()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 37`** (2 nodes): `floating-action-menu.tsx`, `toggleMenu()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 38`** (2 nodes): `globe-demo.tsx`, `GlobeDemo()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 39`** (2 nodes): `motion-footer.tsx`, `scrollToTop()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 40`** (2 nodes): `OptionChip.jsx`, `OptionChip()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 41`** (2 nodes): `ProgressBar.jsx`, `ProgressBar()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 42`** (2 nodes): `sparkles.tsx`, `SparklesCore()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 43`** (2 nodes): `trail-card-demo.tsx`, `TrailCardDemo()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 44`** (2 nodes): `trail-card.tsx`, `StatItem()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 45`** (2 nodes): `apiFetch()`, `api.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 46`** (2 nodes): `utils.ts`, `cn()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 47`** (1 nodes): `drizzle.config.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 48`** (1 nodes): `next-env.d.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 49`** (1 nodes): `next.config.mjs`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 50`** (1 nodes): `postcss.config.mjs`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 51`** (1 nodes): `tailwind.config.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 52`** (1 nodes): `icon.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 53`** (1 nodes): `page.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 54`** (1 nodes): `page.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 55`** (1 nodes): `__init__.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 56`** (1 nodes): `__init__.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 57`** (1 nodes): `__init__.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 58`** (1 nodes): `__init__.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 59`** (1 nodes): `__init__.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 60`** (1 nodes): `Button.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 61`** (1 nodes): `itineraryData.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 62`** (1 nodes): `index.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 63`** (1 nodes): `schema.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `POST()` connect `Community 0` to `Community 10`, `Community 19`?**
  _High betweenness centrality (0.152) - this node is a cross-community bridge._
- **Why does `DELETE()` connect `Community 0` to `Community 1`, `Community 3`?**
  _High betweenness centrality (0.147) - this node is a cross-community bridge._
- **Why does `regenerate_trip()` connect `Community 1` to `Community 0`, `Community 2`?**
  _High betweenness centrality (0.129) - this node is a cross-community bridge._
- **Are the 6 inferred relationships involving `POST()` (e.g. with `getDiscoverTripBySlug()` and `normalizeEstimatedCostForDb()`) actually correct?**
  _`POST()` has 6 INFERRED edges - model-reasoned connections that need verification._
- **Are the 28 inferred relationships involving `str` (e.g. with `create_agent_request()` and `get_all_agent_requests()`) actually correct?**
  _`str` has 28 INFERRED edges - model-reasoned connections that need verification._
- **Are the 18 inferred relationships involving `regenerate_trip()` (e.g. with `str` and `safe_array()`) actually correct?**
  _`regenerate_trip()` has 18 INFERRED edges - model-reasoned connections that need verification._
- **Are the 17 inferred relationships involving `from_discover()` (e.g. with `str` and `get_discover_trip_by_slug()`) actually correct?**
  _`from_discover()` has 17 INFERRED edges - model-reasoned connections that need verification._