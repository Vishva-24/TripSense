import { NextRequest, NextResponse } from "next/server";
import { and, asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { activities, itineraryDays, trips, users } from "@/db/schema";
import { getLocationImageUrl } from "@/lib/location-image";

export const runtime = "nodejs";

type RouteContext = {
  params: {
    id: string;
  };
};

async function resolveRequestUser(request: NextRequest) {
  const userIdRaw = request.nextUrl.searchParams.get("userId")?.trim() || "";
  const userEmailRaw =
    request.nextUrl.searchParams.get("userEmail")?.trim().toLowerCase() || "";

  if (userIdRaw) {
    const parsed = Number(userIdRaw);
    if (!Number.isInteger(parsed) || parsed <= 0) {
      throw new Error("Invalid query param: userId");
    }

    return { userId: parsed, providedIdentity: true };
  }

  if (userEmailRaw) {
    const [userRow] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, userEmailRaw))
      .limit(1);

    return {
      userId: userRow?.id ?? null,
      providedIdentity: true
    };
  }

  return { userId: null, providedIdentity: false };
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const tripIdRaw = context.params.id;
    const tripId = Number(tripIdRaw);
    const resolvedUser = await resolveRequestUser(request);
    const userId = resolvedUser.userId;

    if (!tripIdRaw || !Number.isInteger(tripId) || tripId <= 0) {
      return NextResponse.json({ error: "Trip id is required." }, { status: 400 });
    }

    if (resolvedUser.providedIdentity && !userId) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    const tripWhereClause = userId
      ? and(eq(trips.id, tripId), eq(trips.userId, userId))
      : eq(trips.id, tripId);

    const [tripRow] = await db
      .select({
        id: trips.id,
        userId: trips.userId,
        destination: trips.destination,
        startDate: trips.startDate,
        endDate: trips.endDate,
        budgetTier: trips.budgetTier,
        travelGroup: trips.travelGroup,
        vibe: trips.vibe,
        dietaryPrefs: trips.dietaryPrefs,
        mustDos: trips.mustDos,
        createdAt: trips.createdAt
      })
      .from(trips)
      .where(tripWhereClause)
      .limit(1);

    if (!tripRow) {
      return NextResponse.json({ error: "Trip not found." }, { status: 404 });
    }

    const dayActivityRows = await db
      .select({
        dayId: itineraryDays.id,
        dayNumber: itineraryDays.dayNumber,
        dayDate: itineraryDays.date,
        activityId: activities.id,
        time: activities.time,
        type: activities.type,
        title: activities.title,
        description: activities.description,
        costEstimate: activities.costEstimate,
        imageUrl: activities.imageUrl
      })
      .from(itineraryDays)
      .leftJoin(activities, eq(activities.dayId, itineraryDays.id))
      .where(eq(itineraryDays.tripId, tripId))
      .orderBy(asc(itineraryDays.dayNumber), asc(activities.time));

    const imageCache = new Map<string, string>();
    const rowsWithImages = await Promise.all(
      dayActivityRows.map(async (row) => {
        if (!row.activityId) return row;

        const existingImageUrl = row.imageUrl || "";
        const hasLegacyUrl =
          existingImageUrl.includes("source.unsplash.com") ||
          existingImageUrl.includes("placehold.co");
        const needsImage = !row.imageUrl || hasLegacyUrl;

        if (!needsImage) return row;

        const cacheKey = `${tripRow.destination}|${row.title || ""}|${row.type || "landmark"}`;
        let imageUrl = imageCache.get(cacheKey);

        if (!imageUrl) {
          imageUrl = await getLocationImageUrl({
            destination: tripRow.destination,
            title: row.title || "travel location",
            type: (row.type || "landmark") as "food" | "landmark" | "transit"
          });
          imageCache.set(cacheKey, imageUrl);
        }

        await db
          .update(activities)
          .set({ imageUrl })
          .where(eq(activities.id, row.activityId));

        return {
          ...row,
          imageUrl
        };
      })
    );

    const dayMap = new Map<
      number,
      {
        id: number;
        dayNumber: number;
        date: string;
        activities: Array<{
          id: number;
          time: string;
          type: "food" | "landmark" | "transit";
          title: string;
          description: string;
          costEstimate: string | null;
          imageUrl: string | null;
        }>;
      }
    >();

    for (const row of rowsWithImages) {
      if (!dayMap.has(row.dayId)) {
        dayMap.set(row.dayId, {
          id: row.dayId,
          dayNumber: row.dayNumber,
          date: row.dayDate,
          activities: []
        });
      }

      if (row.activityId) {
        dayMap.get(row.dayId)!.activities.push({
          id: row.activityId,
          time: row.time || "09:00",
          type: (row.type || "landmark") as "food" | "landmark" | "transit",
          title: row.title || "Untitled Activity",
          description: row.description || "",
          costEstimate: row.costEstimate,
          imageUrl: row.imageUrl
        });
      }
    }

    const days = Array.from(dayMap.values()).sort(
      (a, b) => a.dayNumber - b.dayNumber
    );

    return NextResponse.json(
      {
        trip: tripRow,
        days
      },
      { status: 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown database error";

    if (message === "Invalid query param: userId") {
      return NextResponse.json({ error: message }, { status: 400 });
    }

    return NextResponse.json(
      {
        error: "Failed to fetch trip details.",
        details: message
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const tripIdRaw = context.params.id;
    const tripId = Number(tripIdRaw);

    if (!tripIdRaw || !Number.isInteger(tripId) || tripId <= 0) {
      return NextResponse.json({ error: "Trip id is required." }, { status: 400 });
    }

    const resolvedUser = await resolveRequestUser(request);

    if (!resolvedUser.providedIdentity) {
      return NextResponse.json(
        { error: "Missing query param: userId or userEmail" },
        { status: 400 }
      );
    }

    if (!resolvedUser.userId) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    const whereClause = and(
      eq(trips.id, tripId),
      eq(trips.userId, resolvedUser.userId)
    );

    const [tripRow] = await db
      .select({ id: trips.id })
      .from(trips)
      .where(whereClause)
      .limit(1);

    if (!tripRow) {
      return NextResponse.json({ error: "Trip not found." }, { status: 404 });
    }

    await db.delete(trips).where(whereClause);

    return NextResponse.json({ deleted: true, tripId }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown database error";

    if (message === "Invalid query param: userId") {
      return NextResponse.json({ error: message }, { status: 400 });
    }

    return NextResponse.json(
      {
        error: "Failed to delete trip.",
        details: message
      },
      { status: 500 }
    );
  }
}
