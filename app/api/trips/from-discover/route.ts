import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { activities, itineraryDays, trips, users } from "@/db/schema";
import { getDiscoverTripBySlug } from "@/lib/discoverTrips";
import { generateStructuredJson } from "@/lib/gemini";
import { getLocationImageUrl } from "@/lib/location-image";
import {
  normalizeEstimatedCostForDb,
  normalizeEstimatedCurrency,
  normalizeEstimateNote
} from "@/lib/trip-pricing";

export const runtime = "nodejs";

type CreateFromDiscoverRequest = {
  slug?: string;
  userEmail?: string;
  travelerCountry?: string;
  travelGroup?: string;
  budgetTier?: string;
  vibe?: string[];
  startDate?: string;
};

const DEFAULT_TRAVEL_GROUP = "Solo";
const DEFAULT_DIETARY_PREFS = ["None"];
const validActivityTypes = new Set(["food", "landmark", "transit"]);
const genericTitleWords = new Set([
  "Arrive",
  "Arrival",
  "Walk",
  "Visit",
  "Explore",
  "Head",
  "Spend",
  "Take",
  "Go",
  "Grab",
  "Cross",
  "Board",
  "Rent",
  "Enjoy",
  "Drink",
  "Start",
  "Finish",
  "Wake",
  "Join",
  "Book",
  "Hold",
  "Stand",
  "Marvel",
  "Settle",
  "Check",
  "Charter",
  "Shop",
  "Climb"
]);

const personaBudgetMap: Record<string, string> = {
  "Concrete Jungle Explorer": "Standard",
  "Zen Seeker": "Standard",
  "Time Traveler": "Standard",
  "Thrill Chaser": "Standard",
  "High-Roller": "Luxury"
};

const personaVibeMap: Record<string, string[]> = {
  "Concrete Jungle Explorer": ["Urban", "Food-focused", "Foodie"],
  "Zen Seeker": ["Chill", "Nature", "Relaxation"],
  "Time Traveler": ["Culture", "History"],
  "Thrill Chaser": ["Adventure", "Nature"],
  "High-Roller": ["Party", "Luxury"]
};

type GeneratedActivity = {
  time: string;
  type: "food" | "landmark" | "transit";
  title: string;
  description: string;
  cost_estimate: string | null;
};

type GeneratedDay = {
  day_number: number;
  date: string;
  activities: GeneratedActivity[];
};

type GeneratedDiscoverItinerary = {
  days: GeneratedDay[];
};

function todayDateString() {
  return new Date().toISOString().split("T")[0];
}

function addDays(dateString: string, amount: number) {
  const date = new Date(`${dateString}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + amount);
  return date.toISOString().split("T")[0];
}

function isValidDateString(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function safeStringArray(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.map((item) => String(item).trim()).filter(Boolean);
}

function parseStatusFromMessage(message: string) {
  const match = message.match(/\[(\d{3})\s*[A-Za-z ]*\]/) || message.match(/\b(\d{3})\b/);
  return match ? Number(match[1]) : null;
}

function isTransientAiLoadError(message: string) {
  const lower = message.toLowerCase();
  const status = parseStatusFromMessage(lower);

  if (status && [429, 500, 502, 503, 504].includes(status)) {
    return true;
  }

  return (
    lower.includes("service unavailable") ||
    lower.includes("high demand") ||
    lower.includes("try again later") ||
    lower.includes("temporarily unavailable")
  );
}

function parseDurationDays(duration: string) {
  const matched = String(duration || "").match(/\d+/);
  const parsed = matched ? Number(matched[0]) : 0;
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 3;
}

function inferBudgetTier(persona: string, providedBudget: string) {
  if (
    providedBudget === "Shoestring" ||
    providedBudget === "Standard" ||
    providedBudget === "Luxury"
  ) {
    return providedBudget;
  }

  const fallbackBudget = personaBudgetMap[persona] || "Standard";
  return fallbackBudget === "Shoestring" || fallbackBudget === "Luxury"
    ? fallbackBudget
    : "Standard";
}

function inferVibes(persona: string, vibeLabel: string, providedVibe: unknown) {
  const explicitVibes = safeStringArray(providedVibe);
  if (explicitVibes.length > 0) {
    return Array.from(new Set(explicitVibes));
  }

  const vibeFromLabel = String(vibeLabel || "")
    .split(/&|\||,|\//)
    .map((item) => item.trim())
    .filter(Boolean);

  return Array.from(new Set([...(personaVibeMap[persona] || []), ...vibeFromLabel]));
}

function normalizeSentence(text: string) {
  return String(text || "")
    .replace(/\s+/g, " ")
    .trim();
}

function splitDescriptionIntoSegments(description: string) {
  const sentenceSegments = normalizeSentence(description)
    .split(/(?<=[.!?])\s+/)
    .map((segment) => normalizeSentence(segment))
    .filter(Boolean);

  if (sentenceSegments.length > 1) {
    return sentenceSegments.slice(0, 3);
  }

  const clauseSegments = normalizeSentence(description)
    .split(/\s+(?:and then|then|before|after|and)\s+/i)
    .map((segment) => normalizeSentence(segment))
    .filter(Boolean);

  if (clauseSegments.length > 1) {
    return clauseSegments.slice(0, 3);
  }

  return sentenceSegments.length > 0 ? sentenceSegments : ["Explore the local area at your own pace."];
}

function inferActivityType(text: string): "food" | "landmark" | "transit" {
  const normalized = text.toLowerCase();

  if (
    /(arrive|arrival|airport|departure|depart|train|metro|subway|bus|ferry|cruise|flight|board|ride|drive|transfer|take the|take a|head to the airport)/i.test(
      normalized
    )
  ) {
    return "transit";
  }

  if (
    /(breakfast|lunch|dinner|brunch|snack|coffee|cafe|tea|ramen|pizza|taco|tacos|sushi|bagel|market|eat|eatery|restaurant|food|gelato|wine|cocktail|biryani|chicken rice|barbecue|bbq|mezcal|limoncello)/i.test(
      normalized
    )
  ) {
    return "food";
  }

  return "landmark";
}

function extractProperPhrases(text: string) {
  const matches =
    text.match(/\b[A-Z][A-Za-z0-9'().-]*(?:\s+[A-Z][A-Za-z0-9'().-]*){0,3}/g) || [];

  const cleaned = matches
    .map((match) => match.replace(/[.,]+$/g, "").trim())
    .filter((match) => {
      const firstWord = match.split(/\s+/)[0];
      return firstWord && !genericTitleWords.has(firstWord);
    });

  return Array.from(new Set(cleaned));
}

function sentenceToActivityTitle(sentence: string, fallbackTitle: string, index: number) {
  if (index === 0) {
    return fallbackTitle;
  }

  const properPhrases = extractProperPhrases(sentence);
  if (properPhrases.length >= 2) {
    return `${properPhrases[0]} & ${properPhrases[1]}`;
  }

  if (properPhrases.length === 1) {
    return properPhrases[0];
  }

  const cleaned = sentence
    .replace(
      /^(arrive|arrival|walk|visit|explore|head|spend|take|go|grab|cross|board|rent|enjoy|drink|start|finish|wake|join|book|hold|stand|marvel|settle|check|charter|shop|climb)\b[\s:-]*/i,
      ""
    )
    .replace(/[.?!]+$/g, "")
    .trim();

  if (!cleaned) {
    return `${fallbackTitle} Highlight`;
  }

  const words = cleaned.split(/\s+/).slice(0, 6).join(" ");
  return words.charAt(0).toUpperCase() + words.slice(1);
}

function buildSeededFallbackImage(destination: string, title: string, type: string) {
  return `https://picsum.photos/seed/${encodeURIComponent(
    `${destination}|${title}|${type}`
  )}/960/640`;
}

function inferBridgeActivityTitle(dayTitle: string, description: string, index: number) {
  const properPhrases = extractProperPhrases(description).filter(
    (phrase) => phrase.toLowerCase() !== dayTitle.toLowerCase()
  );

  if (properPhrases[index]) {
    return properPhrases[index];
  }

  const defaults = [
    `${dayTitle} Walk`,
    "Local Lunch Stop",
    "Neighborhood Discovery",
    "Evening Wind-Down"
  ];

  return defaults[index] || `${dayTitle} Extra`;
}

function buildFallbackActivitiesForDay(
  day: { day: number; title: string; description: string },
  destination: string,
  dayIndex: number,
  totalDays: number
): GeneratedActivity[] {
  const shortDestination = destination.split(",")[0]?.trim() || destination;
  const normalizedDescription = normalizeSentence(day.description);
  const anchorDescription = normalizedDescription.endsWith(".")
    ? normalizedDescription
    : `${normalizedDescription}.`;

  if (dayIndex === 0) {
    return [
      {
        time: "14:00",
        type: "transit",
        title: `Arrival in ${shortDestination}`,
        description: `Arrive in ${shortDestination}, transfer to your accommodation, and get oriented before the main plans begin.`,
        cost_estimate: null
      },
      {
        time: "16:00",
        type: "landmark",
        title: day.title,
        description: anchorDescription,
        cost_estimate: null
      },
      {
        time: "18:30",
        type: "food",
        title: inferBridgeActivityTitle(day.title, day.description, 1),
        description: `Pause for a relaxed meal near today's main area so the schedule feels full without becoming rushed.`,
        cost_estimate: null
      },
      {
        time: "20:30",
        type: "landmark",
        title: inferBridgeActivityTitle(day.title, day.description, 2),
        description: `Wrap up the day with a short nearby walk, viewpoint, or neighborhood stroll before turning in.`,
        cost_estimate: null
      }
    ];
  }

  if (dayIndex === totalDays - 1) {
    return [
      {
        time: "09:00",
        type: "food",
        title: "Breakfast and Easy Start",
        description: `Begin your final day in ${shortDestination} with an easy breakfast and a slow start before the headline plans.`,
        cost_estimate: null
      },
      {
        time: "11:00",
        type: "landmark",
        title: day.title,
        description: anchorDescription,
        cost_estimate: null
      },
      {
        time: "14:00",
        type: "landmark",
        title: "Last-Minute Exploration",
        description: `Use the afternoon for a final nearby stop, souvenir shopping, or one more quick experience in ${shortDestination}.`,
        cost_estimate: null
      },
      {
        time: "17:30",
        type: "transit",
        title: `Departure from ${shortDestination}`,
        description: `Head toward the airport or station with enough buffer time for a smooth departure.`,
        cost_estimate: null
      }
    ];
  }

  return [
    {
      time: "09:00",
      type: "food",
      title: "Breakfast Near Your Base",
      description: `Start the morning with a local breakfast before heading into the day's main plans in ${shortDestination}.`,
      cost_estimate: null
    },
    {
      time: "10:30",
      type: "landmark",
      title: day.title,
      description: anchorDescription,
      cost_estimate: null
    },
    {
      time: "13:30",
      type: "food",
      title: inferBridgeActivityTitle(day.title, day.description, 1),
      description: `Take a midday food break close to today's key area so the route feels natural and easy to follow.`,
      cost_estimate: null
    },
    {
      time: "15:30",
      type: "landmark",
      title: inferBridgeActivityTitle(day.title, day.description, 2),
      description: `Add a nearby cultural stop, market, scenic walk, or neighborhood experience that complements the day's highlight.`,
      cost_estimate: null
    },
    {
      time: "19:00",
      type: "food",
      title: "Dinner and Evening Stroll",
      description: `Close the day with a dinner stop and a short evening wander nearby.`,
      cost_estimate: null
    }
  ];
}

function mergeActivitiesWithFallback(
  generatedActivities: GeneratedActivity[],
  fallbackActivities: GeneratedActivity[]
) {
  const merged = [...generatedActivities];
  const seenKeys = new Set(
    generatedActivities.map((activity) =>
      `${activity.time}|${activity.title}`.toLowerCase()
    )
  );

  for (const fallbackActivity of fallbackActivities) {
    if (merged.length >= 5) break;

    const key = `${fallbackActivity.time}|${fallbackActivity.title}`.toLowerCase();
    if (seenKeys.has(key)) continue;

    merged.push(fallbackActivity);
    seenKeys.add(key);
  }

  return merged
    .sort((left, right) => left.time.localeCompare(right.time))
    .slice(0, 6);
}

function sanitizeGeneratedDiscoverItinerary(
  rawOutput: unknown,
  discoverDays: Array<{ day: number; title: string; description: string }>,
  startDate: string,
  destination: string
) {
  const totalDays = discoverDays.length;

  if (!rawOutput || typeof rawOutput !== "object") {
    return discoverDays.map((day, index) => ({
      day_number: day.day,
      date: addDays(startDate, index),
      activities: buildFallbackActivitiesForDay(day, destination, index, totalDays)
    }));
  }

  const rawDays = (rawOutput as GeneratedDiscoverItinerary).days;
  if (!Array.isArray(rawDays)) {
    return discoverDays.map((day, index) => ({
      day_number: day.day,
      date: addDays(startDate, index),
      activities: buildFallbackActivitiesForDay(day, destination, index, totalDays)
    }));
  }

  return discoverDays.map((day, index) => {
    const matchingDay =
      rawDays.find((item) => Number(item?.day_number) === day.day) || rawDays[index];

    const safeDate =
      matchingDay?.date && isValidDateString(String(matchingDay.date))
        ? String(matchingDay.date)
        : addDays(startDate, index);

    const rawActivities = Array.isArray(matchingDay?.activities)
      ? matchingDay.activities
      : [];

    const sanitizedActivities = rawActivities
      .slice(0, 6)
      .map((activity) => {
        const parsedType = String(activity?.type || "").toLowerCase();
        const type = validActivityTypes.has(parsedType)
          ? (parsedType as GeneratedActivity["type"])
          : "landmark";
        const time = /^\d{2}:\d{2}$/.test(String(activity?.time || ""))
          ? String(activity.time)
          : "09:00";
        const title = String(activity?.title || "").trim() || day.title;
        const description =
          String(activity?.description || "").trim() ||
          "A local activity generated from your Discover trip.";

        return {
          time,
          type,
          title,
          description: description.endsWith(".") ? description : `${description}.`,
          cost_estimate: activity?.cost_estimate ? String(activity.cost_estimate) : null
        };
      })
      .filter((activity) => activity.title && activity.description);

    const fallbackActivities = buildFallbackActivitiesForDay(
      day,
      destination,
      index,
      totalDays
    );

    const activities =
      sanitizedActivities.length >= 4
        ? sanitizedActivities
        : mergeActivitiesWithFallback(sanitizedActivities, fallbackActivities);

    return {
      day_number: day.day,
      date: safeDate,
      activities: activities.length > 0 ? activities : fallbackActivities
    };
  });
}

function buildDiscoverExpansionPrompt(input: {
  destination: string;
  duration: string;
  persona: string;
  vibe: string;
  budgetTier: string;
  travelGroup: string;
  travelerCountry: string;
  discoverDays: Array<{ day: number; title: string; description: string }>;
}) {
  return `
SYSTEM INSTRUCTIONS:
You are TripSense's itinerary engine. Expand a preplanned Discover trip into a fuller real-world itinerary.
Return ONLY valid JSON without markdown or code fences.

REQUIRED JSON SHAPE:
{
  "days": [
    {
      "day_number": 1,
      "date": "YYYY-MM-DD",
      "activities": [
        {
          "time": "HH:MM",
          "type": "food | landmark | transit",
          "title": "short title",
          "description": "1-2 sentence description",
          "cost_estimate": "string or null"
        }
      ]
    }
  ]
}

RULES:
- Generate exactly ${input.discoverDays.length} day objects.
- For each day, keep the provided Discover title/description as the day's anchor highlight.
- Do not only restate the anchor. Add realistic supporting activities before, between, and after it.
- Each day should have 4 to 6 activities with a natural flow.
- Fill time gaps using breakfast, lunch, dinner, transit, nearby walks, markets, viewpoints, shopping, check-in, or neighborhood stops when appropriate.
- Keep the plan realistic for ${input.destination}, ${input.persona}, and the vibe "${input.vibe}".
- Respect the budget tier ${input.budgetTier} and travel group ${input.travelGroup}.
- Use 24-hour times and keep them in chronological order.
- type must be one of: food, landmark, transit.
- Day 1 may include arrival/check-in if appropriate. Final day may include departure if appropriate.
- Keep descriptions practical, specific, and easy to follow.

DISCOVER TRIP INPUT:
${JSON.stringify(
    {
      destination: input.destination,
      duration: input.duration,
      persona: input.persona,
      vibe: input.vibe,
      budgetTier: input.budgetTier,
      travelGroup: input.travelGroup,
      travelerCountry: input.travelerCountry || "Guest / Unknown",
      discoverDays: input.discoverDays
    },
    null,
    2
  )}
`;
}

async function resolveUserId(userEmail: string) {
  const normalizedEmail = String(userEmail || "").trim().toLowerCase();
  if (!normalizedEmail) {
    throw new Error("userEmail is required");
  }

  const existingUser = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, normalizedEmail))
    .limit(1);

  if (existingUser.length > 0) {
    return existingUser[0].id;
  }

  const [createdUser] = await db
    .insert(users)
    .values({ email: normalizedEmail })
    .returning({ id: users.id });

  return createdUser.id;
}

function buildEstimatePrompt(input: {
  destination: string;
  duration: string;
  persona: string;
  vibe: string;
  budgetTier: string;
  travelGroup: string;
  travelerCountry: string;
  days: Array<{ day: number; title: string; description: string }>;
}) {
  return `
SYSTEM INSTRUCTIONS:
You are TripSense's trip pricing assistant. Return ONLY valid JSON without markdown or code fences.

REQUIRED JSON SHAPE:
{
  "estimated_total": 0,
  "currency_code": "USD",
  "pricing_note": "short explanation"
}

RULES:
- estimated_total must be one plain number for the full trip.
- Include accommodation, local transport, food, and major activity tickets.
- Exclude international flights, visa fees, and personal shopping.
- Use the traveler's currency when travelerCountry is provided. If no travelerCountry is provided, use USD.
- currency_code must be a 3-letter ISO style code.
- pricing_note should be one short sentence.

TRIP INPUT:
${JSON.stringify(
    {
      destination: input.destination,
      duration: input.duration,
      persona: input.persona,
      vibe: input.vibe,
      budgetTier: input.budgetTier,
      travelGroup: input.travelGroup,
      travelerCountry: input.travelerCountry || "Guest / Unknown",
      days: input.days
    },
    null,
    2
  )}
`;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CreateFromDiscoverRequest;
    const slug = String(body.slug || "").trim();

    if (!slug) {
      return NextResponse.json({ error: "Trip slug is required." }, { status: 400 });
    }

    const discoverTrip = getDiscoverTripBySlug(slug);
    if (!discoverTrip) {
      return NextResponse.json({ error: "Discover trip not found." }, { status: 404 });
    }

    const startDate = isValidDateString(String(body.startDate || "").trim())
      ? String(body.startDate).trim()
      : todayDateString();
    const totalDays = parseDurationDays(discoverTrip.duration);
    const endDate = addDays(startDate, totalDays - 1);
    const budgetTier = inferBudgetTier(discoverTrip.persona, String(body.budgetTier || ""));
    const travelGroup = String(body.travelGroup || DEFAULT_TRAVEL_GROUP).trim() || DEFAULT_TRAVEL_GROUP;
    const vibe = inferVibes(discoverTrip.persona, discoverTrip.vibe, body.vibe);
    const travelerCountry = String(body.travelerCountry || "").trim();
    const userId = await resolveUserId(String(body.userEmail || ""));
    let generatedDiscoverItinerary: GeneratedDiscoverItinerary | null = null;

    try {
      generatedDiscoverItinerary = await generateStructuredJson<GeneratedDiscoverItinerary>({
        prompt: buildDiscoverExpansionPrompt({
          destination: discoverTrip.location,
          duration: discoverTrip.duration,
          persona: discoverTrip.persona,
          vibe: discoverTrip.vibe,
          budgetTier,
          travelGroup,
          travelerCountry,
          discoverDays: discoverTrip.days
        }),
        temperature: 0.35
      });
    } catch (generationError) {
      const message =
        generationError instanceof Error
          ? generationError.message
          : "Discover itinerary expansion failed.";

      if (!isTransientAiLoadError(message)) {
        throw generationError;
      }
    }

    const sanitizedDays = sanitizeGeneratedDiscoverItinerary(
      generatedDiscoverItinerary,
      discoverTrip.days,
      startDate,
      discoverTrip.location
    );

    let estimatedCost: string | null = null;
    let estimatedCurrency = "USD";
    let estimatedCostNote = "Estimated by TripSense AI during trip generation.";

    try {
    const estimateOutput = await generateStructuredJson<{
      estimated_total: string | number | null;
      currency_code: string | null;
      pricing_note: string | null;
    }>({
      prompt: buildEstimatePrompt({
        destination: discoverTrip.location,
        duration: discoverTrip.duration,
        persona: discoverTrip.persona,
        vibe: discoverTrip.vibe,
        budgetTier,
        travelGroup,
        travelerCountry,
        days: discoverTrip.days
      }),
      temperature: 0.2
    });
      estimatedCost = normalizeEstimatedCostForDb(estimateOutput?.estimated_total);
      estimatedCurrency = normalizeEstimatedCurrency(estimateOutput?.currency_code);
      estimatedCostNote = normalizeEstimateNote(estimateOutput?.pricing_note);
    } catch {
      estimatedCost = null;
    }

    const [createdTrip] = await db
      .insert(trips)
      .values({
        userId,
        destination: discoverTrip.location,
        startDate,
        endDate,
        budgetTier,
        travelGroup,
        vibe,
        dietaryPrefs: DEFAULT_DIETARY_PREFS,
        mustDos: `Customized from Discover: ${discoverTrip.title} (${discoverTrip.persona})`,
        estimatedCost,
        estimatedCurrency,
        estimatedCostNote
      })
      .returning({ id: trips.id });

    const imageCache = new Map<string, string>();
    const usedImageUrls = new Set<string>();

    for (const [dayIndex, day] of sanitizedDays.entries()) {
      const [createdDay] = await db
        .insert(itineraryDays)
        .values({
          tripId: createdTrip.id,
          dayNumber: day.day_number,
          date: day.date || addDays(startDate, dayIndex)
        })
        .returning({ id: itineraryDays.id });

      const activityRows = await Promise.all(
        day.activities.map(async (activity) => {
          const cacheKey = `${discoverTrip.location}|${activity.title}|${activity.type}`;
          let imageUrl = imageCache.get(cacheKey);

          if (!imageUrl) {
            imageUrl = await getLocationImageUrl({
              destination: discoverTrip.location,
              title: activity.title,
              type: activity.type
            });
            imageCache.set(cacheKey, imageUrl);
          }

          if (usedImageUrls.has(imageUrl)) {
            const retryImage = await getLocationImageUrl({
              destination: discoverTrip.location,
              title: `${activity.title} ${activity.type}`,
              type: activity.type
            });

            if (!usedImageUrls.has(retryImage)) {
              imageUrl = retryImage;
            }
          }

          if (usedImageUrls.has(imageUrl)) {
            imageUrl = buildSeededFallbackImage(
              discoverTrip.location,
              activity.title,
              activity.type
            );
          }

          usedImageUrls.add(imageUrl);

          return {
            dayId: createdDay.id,
            time: activity.time,
            type: activity.type,
            title: activity.title,
            description: activity.description,
            costEstimate: normalizeEstimatedCostForDb(activity.cost_estimate),
            imageUrl
          };
        })
      );

      if (activityRows.length > 0) {
        await db.insert(activities).values(activityRows);
      }
    }

    return NextResponse.json({ tripId: createdTrip.id }, { status: 200 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown discover trip creation error";

    return NextResponse.json(
      {
        error: "Failed to create discover trip.",
        details: message
      },
      { status: 500 }
    );
  }
}
