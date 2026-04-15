import { NextRequest, NextResponse } from "next/server";
import { asc, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { activities, itineraryDays, trips, users } from "@/db/schema";
import { getLocationImageUrl } from "@/lib/location-image";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const userIdRaw = request.nextUrl.searchParams.get("userId")?.trim() || "";
    const userEmailRaw =
      request.nextUrl.searchParams.get("userEmail")?.trim().toLowerCase() || "";

    let userId: number | null = null;

    if (userIdRaw) {
      const parsed = Number(userIdRaw);
      if (!Number.isInteger(parsed) || parsed <= 0) {
        return NextResponse.json(
          { error: "Invalid query param: userId" },
          { status: 400 }
        );
      }
      userId = parsed;
    } else if (userEmailRaw) {
      const [userRow] = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, userEmailRaw))
        .limit(1);

      if (!userRow) {
        return NextResponse.json({ trips: [] }, { status: 200 });
      }

      userId = userRow.id;
    } else {
      return NextResponse.json(
        { error: "Missing query param: userId or userEmail" },
        { status: 400 }
      );
    }

    const tripRows = await db
      .select({
        id: trips.id,
        destination: trips.destination,
        startDate: trips.startDate,
        endDate: trips.endDate,
        budgetTier: trips.budgetTier,
        travelGroup: trips.travelGroup,
        createdAt: trips.createdAt
      })
      .from(trips)
      .where(eq(trips.userId, userId))
      .orderBy(desc(trips.createdAt));

    const tripsWithCover = await Promise.all(
      tripRows.map(async (trip) => {
        const [firstActivity] = await db
          .select({
            id: activities.id,
            type: activities.type,
            title: activities.title,
            imageUrl: activities.imageUrl
          })
          .from(itineraryDays)
          .leftJoin(activities, eq(activities.dayId, itineraryDays.id))
          .where(eq(itineraryDays.tripId, trip.id))
          .orderBy(asc(itineraryDays.dayNumber), asc(activities.time))
          .limit(1);

        const hasLegacyUrl =
          firstActivity?.imageUrl &&
          firstActivity.imageUrl.includes("source.unsplash.com");
        const needsBackfill = !firstActivity?.imageUrl || hasLegacyUrl;
        let resolvedImage = firstActivity?.imageUrl || null;

        if (needsBackfill) {
          resolvedImage = await getLocationImageUrl({
            destination: trip.destination,
            title: firstActivity?.title || trip.destination,
            type: (firstActivity?.type || "landmark") as
              | "food"
              | "landmark"
              | "transit"
          });

          if (firstActivity?.id) {
            await db
              .update(activities)
              .set({ imageUrl: resolvedImage })
              .where(eq(activities.id, firstActivity.id));
          }
        }

        return {
          ...trip,
          coverImage:
            resolvedImage ||
            `https://placehold.co/640x400/png?text=${encodeURIComponent(
              `${trip.destination} Trip`
            )}`
        };
      })
    );

    return NextResponse.json({ trips: tripsWithCover }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown database error";
    return NextResponse.json(
      {
        error: "Failed to fetch trips.",
        details: message
      },
      { status: 500 }
    );
  }
}
