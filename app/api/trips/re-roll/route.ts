import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { activities, itineraryDays, trips } from "@/db/schema";
import { generateStructuredJson } from "@/lib/gemini";
import { getLocationImageUrl } from "@/lib/location-image";

export const runtime = "nodejs";

type ReRollRequest = {
  activityId?: string | number;
  context?: {
    destination?: string;
    budgetTier?: string;
    travelGroup?: string;
    vibe?: string[];
    dietaryPrefs?: string[];
    mustDos?: string;
    dayNumber?: number;
    dayDate?: string;
  };
};

function parsePositiveInt(value: unknown) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) return null;
  return parsed;
}

type ReRollResponse = {
  title: string;
  description: string;
  cost_estimate: string | null;
};

function safeStringArray(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.map((item) => String(item)).filter(Boolean);
}

function normalizeCostEstimateForDb(value: string | null) {
  if (!value) return null;

  const raw = String(value).trim();
  if (!raw || raw.toLowerCase() === "null" || raw.toLowerCase() === "n/a") {
    return null;
  }

  const numericPart = raw.replace(/[^0-9.]/g, "");
  if (!numericPart) return null;

  const parsed = Number(numericPart);
  return Number.isFinite(parsed) ? String(parsed) : null;
}

function buildRerollPrompt(input: {
  destination: string;
  budgetTier: string;
  travelGroup: string;
  vibe: string[];
  dietaryPrefs: string[];
  mustDos: string;
  dayNumber: number;
  dayDate: string;
  time: string;
  type: "food" | "landmark" | "transit";
  currentTitle: string;
  currentDescription: string;
}) {
  return `
SYSTEM INSTRUCTIONS:
You are TripSense's itinerary optimizer. Return ONLY valid JSON (no markdown).

REQUIRED JSON SHAPE:
{
  "title": "new activity title",
  "description": "1-2 sentence replacement description",
  "cost_estimate": "string or null"
}

RULES:
- Keep the same activity type: ${input.type}
- Keep similar timing: ${input.time}
- Respect destination, budget, travel group, vibe, dietary preferences, and must-dos.
- Do not repeat the current activity title or description.
- Keep suggestion realistic for Day ${input.dayNumber} (${input.dayDate}).

CURRENT TRIP CONTEXT:
${JSON.stringify(
    {
      destination: input.destination,
      budgetTier: input.budgetTier,
      travelGroup: input.travelGroup,
      vibe: input.vibe,
      dietaryPrefs: input.dietaryPrefs,
      mustDos: input.mustDos
    },
    null,
    2
  )}

CURRENT ACTIVITY:
${JSON.stringify(
    {
      time: input.time,
      type: input.type,
      title: input.currentTitle,
      description: input.currentDescription
    },
    null,
    2
  )}
`;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ReRollRequest;
    const activityId = parsePositiveInt(body.activityId);

    if (!activityId) {
      return NextResponse.json(
        { error: "Missing or invalid field: activityId" },
        { status: 400 }
      );
    }

    const [activityRow] = await db
      .select({
        activityId: activities.id,
        time: activities.time,
        type: activities.type,
        title: activities.title,
        description: activities.description,
        costEstimate: activities.costEstimate,
        dayNumber: itineraryDays.dayNumber,
        dayDate: itineraryDays.date,
        destination: trips.destination,
        budgetTier: trips.budgetTier,
        travelGroup: trips.travelGroup,
        vibe: trips.vibe,
        dietaryPrefs: trips.dietaryPrefs,
        mustDos: trips.mustDos
      })
      .from(activities)
      .innerJoin(itineraryDays, eq(itineraryDays.id, activities.dayId))
      .innerJoin(trips, eq(trips.id, itineraryDays.tripId))
      .where(eq(activities.id, activityId))
      .limit(1);

    if (!activityRow) {
      return NextResponse.json({ error: "Activity not found." }, { status: 404 });
    }

    const context = body.context || {};
    const prompt = buildRerollPrompt({
      destination: context.destination || activityRow.destination,
      budgetTier: context.budgetTier || activityRow.budgetTier,
      travelGroup: context.travelGroup || activityRow.travelGroup,
      vibe: context.vibe || safeStringArray(activityRow.vibe),
      dietaryPrefs: context.dietaryPrefs || safeStringArray(activityRow.dietaryPrefs),
      mustDos: context.mustDos || activityRow.mustDos || "",
      dayNumber: context.dayNumber || activityRow.dayNumber,
      dayDate: context.dayDate || activityRow.dayDate,
      time: activityRow.time,
      type: activityRow.type,
      currentTitle: activityRow.title,
      currentDescription: activityRow.description
    });

    const reroll = await generateStructuredJson<ReRollResponse>({
      prompt,
      temperature: 0.4
    });

    const title = String(reroll?.title || "").trim();
    const description = String(reroll?.description || "").trim();
    const costEstimate = normalizeCostEstimateForDb(
      reroll?.cost_estimate ? String(reroll.cost_estimate) : null
    );
    const imageUrl = await getLocationImageUrl({
      destination: activityRow.destination,
      title,
      type: activityRow.type
    });

    if (!title || !description) {
      return NextResponse.json(
        { error: "Gemini returned incomplete reroll output." },
        { status: 502 }
      );
    }

    const [updatedActivity] = await db
      .update(activities)
      .set({
        title,
        description,
        costEstimate,
        imageUrl
      })
      .where(eq(activities.id, activityId))
      .returning({
        id: activities.id,
        time: activities.time,
        type: activities.type,
        title: activities.title,
        description: activities.description,
        costEstimate: activities.costEstimate,
        imageUrl: activities.imageUrl
      });

    return NextResponse.json({ activity: updatedActivity }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown reroll error";
    return NextResponse.json(
      {
        error: "Failed to reroll activity.",
        details: message
      },
      { status: 500 }
    );
  }
}
