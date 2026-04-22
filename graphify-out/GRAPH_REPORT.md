# Graph Report - C:\Users\pujar\Documents\TripSense(WAD)  (2026-04-22)

## Corpus Check
- 56 files · ~54,442 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 202 nodes · 276 edges · 44 communities detected
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 9 edges (avg confidence: 0.8)
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

## God Nodes (most connected - your core abstractions)
1. `POST()` - 40 edges
2. `getLocationImageUrl()` - 9 edges
3. `generateStructuredJson()` - 7 edges
4. `normalizeEmail()` - 6 edges
5. `isValidEmail()` - 6 edges
6. `DELETE()` - 6 edges
7. `applySwipeResult()` - 6 edges
8. `isTransientAiLoadError()` - 5 edges
9. `parsePositiveInt()` - 5 edges
10. `readGuestTripClaims()` - 5 edges

## Surprising Connections (you probably didn't know these)
- `POST()` --calls--> `sanitizeProfileText()`  [EXTRACTED]
  C:\Users\pujar\Documents\TripSense(WAD)\app\api\trips\[id]\regenerate\route.ts → C:\Users\pujar\Documents\TripSense(WAD)\app\api\auth\email\route.ts
- `POST()` --calls--> `findOrCreateUserIdByEmail()`  [EXTRACTED]
  C:\Users\pujar\Documents\TripSense(WAD)\app\api\trips\[id]\regenerate\route.ts → C:\Users\pujar\Documents\TripSense(WAD)\app\api\trips\claim-guest\route.ts
- `POST()` --calls--> `isGuestLikeEmail()`  [EXTRACTED]
  C:\Users\pujar\Documents\TripSense(WAD)\app\api\trips\[id]\regenerate\route.ts → C:\Users\pujar\Documents\TripSense(WAD)\app\api\trips\claim-guest\route.ts
- `POST()` --calls--> `getDiscoverTripBySlug()`  [INFERRED]
  C:\Users\pujar\Documents\TripSense(WAD)\app\api\trips\[id]\regenerate\route.ts → C:\Users\pujar\Documents\TripSense(WAD)\lib\discoverTrips.ts
- `POST()` --calls--> `normalizeEstimatedCostForDb()`  [INFERRED]
  C:\Users\pujar\Documents\TripSense(WAD)\app\api\trips\[id]\regenerate\route.ts → C:\Users\pujar\Documents\TripSense(WAD)\lib\trip-pricing.ts

## Communities

### Community 0 - "Community 0"
Cohesion: 0.11
Nodes (33): addDays(), buildDiscoverExpansionPrompt(), buildEstimatePrompt(), buildFallbackActivitiesForDay(), buildGeneratePrompt(), buildRerollPrompt(), buildSeededFallbackImage(), daysBetweenInclusive() (+25 more)

### Community 1 - "Community 1"
Cohesion: 0.19
Nodes (11): DELETE(), findOrCreateUserIdByEmail(), GET(), hashPassword(), isGuestLikeEmail(), isValidEmail(), normalizeEmail(), PATCH() (+3 more)

### Community 2 - "Community 2"
Cohesion: 0.14
Nodes (6): handleSaveDefaults(), handleSaveProfile(), isValidEmail(), getTodayIsoDate(), isPastPlannerDate(), normalizePlannerVibes()

### Community 3 - "Community 3"
Cohesion: 0.31
Nodes (8): applyLoveSwipe(), applySwipeResult(), deriveBudgetHint(), derivePlannerVibes(), resolveImageSource(), resolveImageStage(), resolvePersona(), triggerSwipe()

### Community 4 - "Community 4"
Cohesion: 0.36
Nodes (10): generateStructuredJson(), getCandidateModels(), getErrorMessage(), getErrorStatusCode(), getGeminiClient(), isModelNotFoundError(), isTransientGeminiError(), parseGeminiJson() (+2 more)

### Community 5 - "Community 5"
Cohesion: 0.4
Nodes (10): dedupeQueries(), extractPlaceHintsFromTitle(), fetchWithTimeout(), getFallbackImage(), getLocationImageUrl(), isUsableImageUrl(), normalizeSearchQuery(), searchWikipediaImage() (+2 more)

### Community 6 - "Community 6"
Cohesion: 0.42
Nodes (5): claimGuestTripsForUser(), claimGuestTripsToUser(), normalizeGuestClaims(), readGuestTripClaims(), writeGuestTripClaims()

### Community 7 - "Community 7"
Cohesion: 0.33
Nodes (2): formatDateRange(), ItineraryExperience()

### Community 8 - "Community 8"
Cohesion: 0.38
Nodes (3): estimateActivityCost(), estimateTripTotal(), getNormalizedBudgetTier()

### Community 9 - "Community 9"
Cohesion: 0.33
Nodes (2): PlanTripPage(), useTripPlanner()

### Community 10 - "Community 10"
Cohesion: 0.4
Nodes (2): getDiscoverTripBySlug(), DiscoverTripPage()

### Community 11 - "Community 11"
Cohesion: 0.7
Nodes (4): addGuestTripClaim(), handleCreateTrip(), readTravelDefaults(), resolvePlannerIdentity()

### Community 12 - "Community 12"
Cohesion: 0.4
Nodes (0): 

### Community 13 - "Community 13"
Cohesion: 0.67
Nodes (0): 

### Community 14 - "Community 14"
Cohesion: 1.0
Nodes (0): 

### Community 15 - "Community 15"
Cohesion: 1.0
Nodes (0): 

### Community 16 - "Community 16"
Cohesion: 1.0
Nodes (0): 

### Community 17 - "Community 17"
Cohesion: 1.0
Nodes (0): 

### Community 18 - "Community 18"
Cohesion: 1.0
Nodes (0): 

### Community 19 - "Community 19"
Cohesion: 1.0
Nodes (0): 

### Community 20 - "Community 20"
Cohesion: 1.0
Nodes (0): 

### Community 21 - "Community 21"
Cohesion: 1.0
Nodes (0): 

### Community 22 - "Community 22"
Cohesion: 1.0
Nodes (0): 

### Community 23 - "Community 23"
Cohesion: 1.0
Nodes (0): 

### Community 24 - "Community 24"
Cohesion: 1.0
Nodes (0): 

### Community 25 - "Community 25"
Cohesion: 1.0
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

## Knowledge Gaps
- **Thin community `Community 14`** (2 nodes): `layout.js`, `RootLayout()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 15`** (2 nodes): `page.tsx`, `DiscoverPage()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 16`** (2 nodes): `page.jsx`, `LegacyItineraryPage()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 17`** (2 nodes): `page.tsx`, `TripItineraryPage()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 18`** (2 nodes): `ActivityCard()`, `ActivityCard.jsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 19`** (2 nodes): `Navbar.tsx`, `syncAuthState()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 20`** (2 nodes): `TripCard.jsx`, `TripCard()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 21`** (2 nodes): `UtilityDrawer.jsx`, `UtilityDrawer()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 22`** (2 nodes): `cobe-globe.tsx`, `Globe()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 23`** (2 nodes): `demo.tsx`, `DemoAiAssistatBasic()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 24`** (2 nodes): `floating-action-menu.tsx`, `toggleMenu()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 25`** (2 nodes): `globe-demo.tsx`, `GlobeDemo()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 26`** (2 nodes): `motion-footer.tsx`, `scrollToTop()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 27`** (2 nodes): `OptionChip.jsx`, `OptionChip()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 28`** (2 nodes): `ProgressBar.jsx`, `ProgressBar()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 29`** (2 nodes): `sparkles.tsx`, `SparklesCore()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 30`** (2 nodes): `trail-card-demo.tsx`, `TrailCardDemo()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 31`** (2 nodes): `trail-card.tsx`, `StatItem()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 32`** (2 nodes): `utils.ts`, `cn()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 33`** (1 nodes): `drizzle.config.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 34`** (1 nodes): `next-env.d.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 35`** (1 nodes): `next.config.mjs`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 36`** (1 nodes): `postcss.config.mjs`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 37`** (1 nodes): `tailwind.config.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 38`** (1 nodes): `icon.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 39`** (1 nodes): `page.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 40`** (1 nodes): `button.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 41`** (1 nodes): `itineraryData.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 42`** (1 nodes): `index.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 43`** (1 nodes): `schema.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `POST()` connect `Community 0` to `Community 1`, `Community 10`, `Community 5`?**
  _High betweenness centrality (0.100) - this node is a cross-community bridge._
- **Why does `getLocationImageUrl()` connect `Community 5` to `Community 0`?**
  _High betweenness centrality (0.031) - this node is a cross-community bridge._
- **Why does `getDiscoverTripBySlug()` connect `Community 10` to `Community 0`?**
  _High betweenness centrality (0.014) - this node is a cross-community bridge._
- **Are the 6 inferred relationships involving `POST()` (e.g. with `getDiscoverTripBySlug()` and `normalizeEstimatedCostForDb()`) actually correct?**
  _`POST()` has 6 INFERRED edges - model-reasoned connections that need verification._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.11 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.14 - nodes in this community are weakly interconnected._