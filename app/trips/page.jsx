"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Compass, PlusCircle, Search, UserCircle2 } from "lucide-react";
import Link from "next/link";
import FloatingActionMenu from "@/components/ui/floating-action-menu";
import { TrailCard } from "@/components/ui/trail-card";
import { Button } from "@/components/ui/button";

const GUEST_TRIP_CLAIMS_KEY = "tripsense_guest_trip_claims";

function readGuestTripClaims() {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(GUEST_TRIP_CLAIMS_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .map((item) => ({
        tripId: Number(item?.tripId),
        guestEmail: String(item?.guestEmail || "").trim().toLowerCase(),
        createdAt: Number(item?.createdAt) || Date.now()
      }))
      .filter(
        (item) =>
          Number.isInteger(item.tripId) &&
          item.tripId > 0 &&
          /@(guest\.)?tripsense\.local$/i.test(item.guestEmail)
      );
  } catch {
    return [];
  }
}

function writeGuestTripClaims(claims) {
  if (typeof window === "undefined") return;

  if (!claims.length) {
    window.localStorage.removeItem(GUEST_TRIP_CLAIMS_KEY);
    return;
  }

  window.localStorage.setItem(
    GUEST_TRIP_CLAIMS_KEY,
    JSON.stringify(claims.slice(0, 100))
  );
}

async function claimGuestTripsForUser(userEmail) {
  if (typeof window === "undefined") return;

  const claims = readGuestTripClaims();
  const fallbackLastTripId = Number(
    window.localStorage.getItem("tripsense_last_trip_id")
  );
  const claimsForRequest =
    claims.length > 0
      ? claims.map((claim) => ({
          tripId: claim.tripId,
          guestEmail: claim.guestEmail
        }))
      : Number.isInteger(fallbackLastTripId) && fallbackLastTripId > 0
        ? [{ tripId: fallbackLastTripId }]
        : [];

  if (claimsForRequest.length === 0) return;

  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";
    const response = await fetch(`${baseUrl}/api/trips/claim-guest`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        targetEmail: String(userEmail || "").trim().toLowerCase(),
        claims: claimsForRequest
      })
    });

    if (!response.ok) return;

    const result = await response.json();
    const processedTripIds = new Set(
      [
        ...(Array.isArray(result?.claimedTripIds) ? result.claimedTripIds : []),
        ...(Array.isArray(result?.alreadyOwnedTripIds)
          ? result.alreadyOwnedTripIds
          : [])
      ]
        .map((value) => Number(value))
        .filter((value) => Number.isInteger(value) && value > 0)
    );

    if (processedTripIds.size === 0) return;

    const remainingClaims = claims.filter(
      (claim) => !processedTripIds.has(claim.tripId)
    );
    writeGuestTripClaims(remainingClaims);
  } catch {
    // Silent fallback for offline/network issues.
  }
}

function getTripCardSummary(trip) {
  const title = String(trip?.title || "").trim();
  const [destinationPart, durationPart] = title.split(" - ");

  return {
    destination: destinationPart || title || "Saved Trip",
    duration: durationPart || "Saved",
    status: String(trip?.status || "Saved"),
    dates: String(trip?.dates || "Dates pending")
  };
}

export default function TripsHubPage() {
  const router = useRouter();
  const [dbTrips, setDbTrips] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [deletingTripId, setDeletingTripId] = useState("");
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  useEffect(() => {
    const loadTrips = async () => {
      const storedEmail =
        typeof window !== "undefined"
          ? window.localStorage.getItem("tripsense_user_email")
          : null;
      let isAuthenticated =
        typeof window !== "undefined"
          ? window.localStorage.getItem("tripsense_is_authenticated") === "1"
          : false;

      if (
        typeof window !== "undefined" &&
        !isAuthenticated &&
        storedEmail &&
        !/@tripsense\.local$/i.test(storedEmail.trim())
      ) {
        window.localStorage.setItem("tripsense_is_authenticated", "1");
        isAuthenticated = true;
      }
      const userEmail = storedEmail;

      if (!isAuthenticated || !userEmail) {
        setDbTrips([]);
        setHasLoadedOnce(true);
        return;
      }

      try {
        setLoadError("");
        setIsLoading(true);
        setDbTrips([]);
        await claimGuestTripsForUser(userEmail);

        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";
        const response = await fetch(
          `${baseUrl}/api/trips?userEmail=${encodeURIComponent(userEmail)}`,
          { cache: "no-store" }
        );
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result?.details || result?.error || "Could not load trips.");
        }

        const mappedTrips = (result.trips || []).map((trip) => {
          const start = new Date(trip.startDate);
          const end = new Date(trip.endDate);
          const dates = `${start.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric"
          })} - ${end.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric"
          })}`;

          const days =
            Math.floor(
              (new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime()) /
                86400000
            ) + 1;

          return {
            id: String(trip.id),
            tripId: trip.id,
            title: `${trip.destination} - ${days} Days`,
            dates,
            status: "Completed",
            agentNotified: trip.agentNotified,
            image: trip.coverImage,
            openHref: `/trips/${trip.id}`
          };
        });

        setDbTrips(mappedTrips);
      } catch (error) {
        setLoadError(
          error instanceof Error ? error.message : "Could not load trips."
        );
      } finally {
        setIsLoading(false);
        setHasLoadedOnce(true);
      }
    };

    void loadTrips();
  }, []);

  const handleDeleteTrip = async (trip) => {
    const tripId = Number(trip.tripId ?? trip.id);
    if (!Number.isInteger(tripId) || tripId <= 0) {
      setLoadError("Only saved database trips can be deleted.");
      return;
    }

    if (typeof window === "undefined") return;

    const shouldDelete = window.confirm(
      `Delete "${trip.title}"? This action cannot be undone.`
    );
    if (!shouldDelete) return;

    const isAuthenticated =
      window.localStorage.getItem("tripsense_is_authenticated") === "1";
    const userEmail = window.localStorage.getItem("tripsense_user_email");
    if (!isAuthenticated || !userEmail) {
      setLoadError("User session is missing. Please create a new trip first.");
      return;
    }

    try {
      setLoadError("");
      setDeletingTripId(String(tripId));

      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";
      const response = await fetch(
        `${baseUrl}/api/trips/${tripId}?userEmail=${encodeURIComponent(userEmail)}`,
        { method: "DELETE" }
      );
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.details || result?.error || "Could not delete trip.");
      }

      setDbTrips((prev) =>
        prev.filter((item) => Number(item.tripId ?? item.id) !== tripId)
      );

      const lastOpenedTripId = window.localStorage.getItem("tripsense_last_trip_id");
      if (lastOpenedTripId === String(tripId)) {
        window.localStorage.removeItem("tripsense_last_trip_id");
      }
    } catch (error) {
      setLoadError(
        error instanceof Error ? error.message : "Could not delete trip."
      );
    } finally {
      setDeletingTripId("");
    }
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-12">
      <header className="mb-8 flex flex-col gap-4 rounded-3xl border border-app-border bg-white/75 p-6 backdrop-blur sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-app-muted">
            <Compass size={16} />
            TripSense
          </p>
          <h1 className="text-3xl font-extrabold text-app-slate">My Trips</h1>
          <p className="mt-1 text-sm text-app-muted">
            Your saved itineraries, drafts, and upcoming ideas.
          </p>
        </div>

        <Link
          href="/plan"
          className="inline-flex w-full items-center justify-center rounded-xl bg-app-slate px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 sm:w-auto"
        >
          <PlusCircle size={16} className="mr-2" />
          Plan a New Trip
        </Link>
      </header>

      {isLoading ? (
        <p className="mb-4 rounded-xl bg-app-sky px-4 py-3 text-sm font-semibold text-app-slate">
          Loading your saved trips...
        </p>
      ) : null}

      {loadError ? (
        <p className="mb-4 rounded-xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
          {loadError}
        </p>
      ) : null}

      <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {dbTrips.map((trip) => {
          const dbTripId = Number(trip.tripId ?? trip.id);
          const canOpen = Number.isInteger(dbTripId) && dbTripId > 0;
          const summary = getTripCardSummary(trip);

          return (
            <TrailCard
              key={trip.id}
              className="max-w-none rounded-[28px] border border-white/60 bg-white/75 shadow-sm backdrop-blur-xl"
              imageUrl={trip.image || `https://picsum.photos/seed/${encodeURIComponent(summary.destination)}/900/600`}
              title={summary.destination}
              location={summary.dates}
              difficulty={trip.agentNotified ? "Agent Notified" : summary.status}
              creators="Saved itinerary ready to reopen or manage"
              stats={[
                { label: "Length", value: summary.duration },
                { label: "Status", value: trip.agentNotified ? "Agent Notified" : summary.status },
                { label: "Access", value: canOpen ? "Open" : "Unavailable" }
              ]}
              actionLabel="Open trip"
              onDirectionsClick={
                canOpen
                  ? () => {
                      if (typeof window !== "undefined") {
                        window.localStorage.setItem(
                          "tripsense_last_trip_id",
                          String(dbTripId)
                        );
                      }
                      router.push(trip.openHref || `/trips/${dbTripId}`);
                    }
                  : undefined
              }
              onClick={
                canOpen
                  ? () => {
                      if (typeof window !== "undefined") {
                        window.localStorage.setItem(
                          "tripsense_last_trip_id",
                          String(dbTripId)
                        );
                      }
                      router.push(trip.openHref || `/trips/${dbTripId}`);
                    }
                  : undefined
              }
              role={canOpen ? "button" : undefined}
              tabIndex={canOpen ? 0 : undefined}
              onKeyDown={
                canOpen
                  ? (event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        if (typeof window !== "undefined") {
                          window.localStorage.setItem(
                            "tripsense_last_trip_id",
                            String(dbTripId)
                          );
                        }
                        router.push(trip.openHref || `/trips/${dbTripId}`);
                      }
                    }
                  : undefined
              }
              footerActions={
                canOpen ? (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={(event) => {
                        event.stopPropagation();
                        if (typeof window !== "undefined") {
                          window.localStorage.setItem(
                            "tripsense_last_trip_id",
                            String(dbTripId)
                          );
                        }
                        router.push(trip.openHref || `/trips/${dbTripId}`);
                      }}
                      className="rounded-full border-app-border px-4 text-app-slate hover:bg-app-sky"
                    >
                      Open Trip
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={(event) => {
                        event.stopPropagation();
                        void handleDeleteTrip(trip);
                      }}
                      disabled={deletingTripId === String(dbTripId)}
                      className="rounded-full border-rose-200 px-4 text-rose-700 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {deletingTripId === String(dbTripId) ? "Deleting..." : "Delete"}
                    </Button>
                  </>
                ) : null
              }
            />
          );
        })}
      </section>

      {!isLoading && hasLoadedOnce && !loadError && dbTrips.length === 0 ? (
        <p className="mt-4 rounded-xl bg-white/70 px-4 py-3 text-sm font-semibold text-app-muted">
          No saved trips yet. Click "Plan a New Trip" to create your first itinerary.
        </p>
      ) : null}

      <FloatingActionMenu
        options={[
          {
            label: "Plan New Trip",
            Icon: <PlusCircle className="h-4 w-4" />,
            onClick: () => router.push("/plan")
          },
          {
            label: "Discover",
            Icon: <Search className="h-4 w-4" />,
            onClick: () => router.push("/discover")
          },
          {
            label: "Account",
            Icon: <UserCircle2 className="h-4 w-4" />,
            onClick: () => router.push("/account")
          }
        ]}
      />
    </main>
  );
}
