import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { activities, itineraryDays, trips, users } from "@/db/schema";
import { getDiscoverTripBySlug } from "@/lib/discoverTrips";
import { generateStructuredJson } from "@/lib/gemini";
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
const timeSlots = ["09:00", "13:00", "18:00"];
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
    const estimatedCost = normalizeEstimatedCostForDb(estimateOutput?.estimated_total);
    const estimatedCurrency = normalizeEstimatedCurrency(estimateOutput?.currency_code);
    const estimatedCostNote = normalizeEstimateNote(estimateOutput?.pricing_note);

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

    for (const [dayIndex, day] of discoverTrip.days.entries()) {
      const [createdDay] = await db
        .insert(itineraryDays)
        .values({
          tripId: createdTrip.id,
          dayNumber: day.day,
          date: addDays(startDate, dayIndex)
        })
        .returning({ id: itineraryDays.id });

      const segments = splitDescriptionIntoSegments(day.description);

      for (const [segmentIndex, segment] of segments.entries()) {
        const type = inferActivityType(segment);
        const title = sentenceToActivityTitle(segment, day.title, segmentIndex);
        const description = segment.endsWith(".") ? segment : `${segment}.`;

        await db.insert(activities).values({
          dayId: createdDay.id,
          time: timeSlots[Math.min(segmentIndex, timeSlots.length - 1)],
          type,
          title,
          description,
          costEstimate: null
        });
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
