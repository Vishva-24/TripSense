import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { trips, users } from "@/db/schema";

export const runtime = "nodejs";

type ClaimPayload = {
  targetEmail?: string;
  claims?: Array<{
    tripId?: number | string;
    guestEmail?: string;
  }>;
};

function normalizeEmail(value: string) {
  return String(value || "").trim().toLowerCase();
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isGuestLikeEmail(value: string) {
  return /@(guest\.)?tripsense\.local$/i.test(value);
}

function parseTripId(value: unknown) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) return null;
  return parsed;
}

async function findOrCreateUserIdByEmail(email: string) {
  const [existingUser] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existingUser) return existingUser.id;

  const [createdUser] = await db
    .insert(users)
    .values({ email })
    .returning({ id: users.id });

  return createdUser.id;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ClaimPayload;
    const targetEmail = normalizeEmail(body?.targetEmail || "");

    if (!targetEmail || !isValidEmail(targetEmail)) {
      return NextResponse.json(
        { error: "Valid targetEmail is required." },
        { status: 400 }
      );
    }

    const rawClaims = Array.isArray(body?.claims) ? body.claims : [];
    const normalizedClaims = rawClaims
      .slice(0, 100)
      .map((claim) => {
        const tripId = parseTripId(claim?.tripId);
        if (!tripId) return null;

        const guestEmailRaw = normalizeEmail(claim?.guestEmail || "");
        const guestEmail = isGuestLikeEmail(guestEmailRaw) ? guestEmailRaw : null;
        return { tripId, guestEmail };
      })
      .filter(
        (claim): claim is { tripId: number; guestEmail: string | null } =>
          Boolean(claim)
      );

    if (normalizedClaims.length === 0) {
      return NextResponse.json(
        { claimedTripIds: [], alreadyOwnedTripIds: [] },
        { status: 200 }
      );
    }

    const targetUserId = await findOrCreateUserIdByEmail(targetEmail);
    const claimedTripIds: number[] = [];
    const alreadyOwnedTripIds: number[] = [];

    for (const claim of normalizedClaims) {
      const [tripRow] = await db
        .select({ id: trips.id, userId: trips.userId })
        .from(trips)
        .where(eq(trips.id, claim.tripId))
        .limit(1);

      if (!tripRow) continue;

      if (tripRow.userId === targetUserId) {
        alreadyOwnedTripIds.push(tripRow.id);
        continue;
      }

      let guestUserId: number | null = null;

      if (claim.guestEmail) {
        const [guestUser] = await db
          .select({ id: users.id })
          .from(users)
          .where(eq(users.email, claim.guestEmail))
          .limit(1);

        if (!guestUser) continue;
        if (guestUser.id !== tripRow.userId) continue;
        guestUserId = guestUser.id;
      } else {
        const [ownerUser] = await db
          .select({ id: users.id, email: users.email })
          .from(users)
          .where(eq(users.id, tripRow.userId))
          .limit(1);

        if (!ownerUser || !isGuestLikeEmail(ownerUser.email)) {
          continue;
        }

        guestUserId = ownerUser.id;
      }

      const [movedTrip] = await db
        .update(trips)
        .set({ userId: targetUserId })
        .where(and(eq(trips.id, claim.tripId), eq(trips.userId, guestUserId)))
        .returning({ id: trips.id });

      if (movedTrip) {
        claimedTripIds.push(movedTrip.id);
        continue;
      }

      const [alreadyOwnedTrip] = await db
        .select({ id: trips.id })
        .from(trips)
        .where(and(eq(trips.id, claim.tripId), eq(trips.userId, targetUserId)))
        .limit(1);

      if (alreadyOwnedTrip) {
        alreadyOwnedTripIds.push(alreadyOwnedTrip.id);
      }
    }

    return NextResponse.json(
      { claimedTripIds, alreadyOwnedTripIds },
      { status: 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown database error";
    return NextResponse.json(
      {
        error: "Failed to claim guest trips.",
        details: message
      },
      { status: 500 }
    );
  }
}
