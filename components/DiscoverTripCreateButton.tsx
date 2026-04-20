"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const GUEST_TRIP_CLAIMS_KEY = "tripsense_guest_trip_claims";

function addGuestTripClaim(tripId: number, guestEmail: string) {
  if (typeof window === "undefined") return;

  const parsedTripId = Number(tripId);
  const normalizedEmail = String(guestEmail || "").trim().toLowerCase();
  if (!Number.isInteger(parsedTripId) || parsedTripId <= 0 || !normalizedEmail) return;

  let existingClaims: Array<{
    tripId: number;
    guestEmail: string;
    createdAt: number;
  }> = [];

  try {
    const raw = window.localStorage.getItem(GUEST_TRIP_CLAIMS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        existingClaims = parsed
          .map((item) => ({
            tripId: Number(item?.tripId),
            guestEmail: String(item?.guestEmail || "").trim().toLowerCase(),
            createdAt: Number(item?.createdAt) || Date.now()
          }))
          .filter(
            (item) =>
              Number.isInteger(item.tripId) &&
              item.tripId > 0 &&
              item.guestEmail.length > 0
          );
      }
    }
  } catch {
    existingClaims = [];
  }

  const nextClaims = [
    {
      tripId: parsedTripId,
      guestEmail: normalizedEmail,
      createdAt: Date.now()
    },
    ...existingClaims.filter(
      (item) => !(item.tripId === parsedTripId && item.guestEmail === normalizedEmail)
    )
  ].slice(0, 100);

  window.localStorage.setItem(GUEST_TRIP_CLAIMS_KEY, JSON.stringify(nextClaims));
}

function resolvePlannerIdentity() {
  if (typeof window === "undefined") {
    return {
      email: `guest-${Date.now()}@guest.tripsense.local`,
      isGuest: true,
      country: ""
    };
  }

  const isAuthenticated =
    window.localStorage.getItem("tripsense_is_authenticated") === "1";
  const savedEmail = String(
    window.localStorage.getItem("tripsense_user_email") || ""
  ).trim();

  if (isAuthenticated && savedEmail) {
    return {
      email: savedEmail.toLowerCase(),
      isGuest: false,
      country: String(
        window.localStorage.getItem("tripsense_user_country") || ""
      ).trim()
    };
  }

  return {
    email: `guest-${Date.now()}@guest.tripsense.local`,
    isGuest: true,
    country: ""
  };
}

function readTravelDefaults() {
  if (typeof window === "undefined") {
    return {
      travelGroup: "Solo",
      budgetTier: "Standard",
      vibe: [] as string[]
    };
  }

  try {
    const raw = window.localStorage.getItem("tripsense_travel_defaults");
    if (!raw) {
      return {
        travelGroup: "Solo",
        budgetTier: "Standard",
        vibe: [] as string[]
      };
    }

    const parsed = JSON.parse(raw);
    return {
      travelGroup: String(parsed?.travelGroup || "Solo"),
      budgetTier: String(parsed?.budgetTier || "Standard"),
      vibe: Array.isArray(parsed?.vibe)
        ? parsed.vibe.map((item: unknown) => String(item)).filter(Boolean)
        : []
    };
  } catch {
    return {
      travelGroup: "Solo",
      budgetTier: "Standard",
      vibe: [] as string[]
    };
  }
}

type DiscoverTripCreateButtonProps = {
  slug: string;
};

export default function DiscoverTripCreateButton({
  slug
}: DiscoverTripCreateButtonProps) {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState("");

  const handleCreateTrip = async () => {
    try {
      setIsCreating(true);
      setError("");

      const plannerIdentity = resolvePlannerIdentity();
      const defaults = readTravelDefaults();

      const response = await fetch("/api/trips/from-discover", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          slug,
          userEmail: plannerIdentity.email,
          travelerCountry: plannerIdentity.country,
          travelGroup: defaults.travelGroup,
          budgetTier: defaults.budgetTier,
          vibe: defaults.vibe
        })
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(
          result?.details || result?.error || "Could not create trip from Discover."
        );
      }

      if (!result?.tripId) {
        throw new Error("Trip created but trip id is missing.");
      }

      if (typeof window !== "undefined") {
        window.localStorage.setItem("tripsense_last_trip_id", String(result.tripId));
        if (plannerIdentity.isGuest) {
          addGuestTripClaim(result.tripId, plannerIdentity.email);
        }
      }

      router.push(`/trips/${encodeURIComponent(result.tripId)}`);
    } catch (createError) {
      setError(
        createError instanceof Error
          ? createError.message
          : "Could not create trip from Discover."
      );
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => {
          void handleCreateTrip();
        }}
        disabled={isCreating}
        className="inline-flex w-full items-center justify-center rounded-xl bg-app-slate px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isCreating ? "Creating your trip..." : "Make Your Own Trip"}
      </button>

      {error ? (
        <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}
