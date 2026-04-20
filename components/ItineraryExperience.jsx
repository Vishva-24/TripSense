"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  Clock3,
  Lock,
  LockOpen,
  MapPin,
  Pencil,
  Users,
  X
} from "lucide-react";
import ActivityCard from "@/components/ActivityCard";
import UtilityDrawer from "@/components/UtilityDrawer";
import { formatStoredPrice } from "@/lib/trip-pricing";

function formatSingleDate(dateValue) {
  if (!dateValue) return "";

  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) return String(dateValue);

  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

function formatDateRange(startDate, endDate) {
  if (!startDate || !endDate) return "Dates not set";

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return "Dates not set";
  }

  return `${start.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  })} - ${end.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  })}`;
}

function buildPackingList(destination) {
  const place = destination || "your trip";
  return [
    { id: "pack-1", label: `Comfortable shoes for ${place}`, checked: true },
    { id: "pack-2", label: "Universal power adapter", checked: false },
    { id: "pack-3", label: "Reusable water bottle", checked: false }
  ];
}

function getFallbackImage(title, destination) {
  return `https://placehold.co/480x320/png?text=${encodeURIComponent(
    `${title} - ${destination}`
  )}`;
}

const travelerOptions = ["Solo", "Couple", "Family", "Friends"];
const budgetOptions = ["Shoestring", "Standard", "Luxury"];
const vibeOptions = [
  "Chill",
  "Adventure",
  "Culture",
  "Party",
  "Food-focused",
  "Urban",
  "Foodie",
  "Relaxation",
  "Nature",
  "History",
  "Luxury"
];
const dietaryOptions = ["None", "Vegan", "Vegetarian", "Halal", "Gluten-Free"];

function safeArray(value) {
  if (!Array.isArray(value)) return [];
  return value.map((item) => String(item).trim()).filter(Boolean);
}

export default function ItineraryExperience({
  tripId = "",
  allowFallbackToLastTrip = false
}) {
  const LEAVE_WARNING_MESSAGE =
    "You are not logged in. If you continue, you may lose this trip. Do you want to leave this page?";

  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [apiTripData, setApiTripData] = useState(null);
  const [activeTripId, setActiveTripId] = useState("");
  const [rerollingActivityId, setRerollingActivityId] = useState("");
  const [rerollError, setRerollError] = useState("");
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isUpdatingPlan, setIsUpdatingPlan] = useState(false);
  const [updatePlanError, setUpdatePlanError] = useState("");
  const [isTripSelectionResolved, setIsTripSelectionResolved] = useState(false);
  const [isAuthenticatedUser, setIsAuthenticatedUser] = useState(false);
  const hasPushedHistoryGuardRef = useRef(false);
  const [editForm, setEditForm] = useState({
    destination: "",
    startDate: "",
    endDate: "",
    travelGroup: "Solo",
    budgetTier: "Standard",
    vibe: [],
    dietaryPrefs: ["None"],
    mustDos: ""
  });

  useEffect(() => {
    let isDisposed = false;
    const controller = new AbortController();

    const loadTrip = async (selectedTripId) => {
      try {
        setLoadError("");
        setRerollError("");
        setUpdatePlanError("");
        setApiTripData(null);
        setIsLoading(true);

        const response = await fetch(
          `/api/trips/${encodeURIComponent(selectedTripId)}`,
          {
            cache: "no-store",
            signal: controller.signal
          }
        );
        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result?.details || result?.error || "Could not load trip."
          );
        }

        if (isDisposed) return;
        setApiTripData(result);
      } catch (error) {
        if (controller.signal.aborted || isDisposed) return;
        const message =
          error instanceof Error ? error.message : "Could not load trip.";
        setLoadError(message);
      } finally {
        if (isDisposed) return;
        setIsLoading(false);
      }
    };

    const routeTripId = String(tripId || "").trim();
    const localTripId =
      typeof window !== "undefined" && allowFallbackToLastTrip
        ? String(
            window.localStorage.getItem("tripsense_last_trip_id") || ""
          ).trim()
        : "";

    const resolvedTripId = routeTripId || localTripId;

    setActiveTripId(resolvedTripId);
    setIsTripSelectionResolved(true);
    setIsCustomizing(false);

    if (!resolvedTripId) {
      setApiTripData(null);
      setIsLoading(false);
      return () => {
        isDisposed = true;
        controller.abort();
      };
    }

    if (typeof window !== "undefined") {
      window.localStorage.setItem("tripsense_last_trip_id", resolvedTripId);
    }

    void loadTrip(resolvedTripId);

    return () => {
      isDisposed = true;
      controller.abort();
    };
  }, [allowFallbackToLastTrip, tripId]);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const syncAuthState = () => {
      const isAuthenticated =
        window.localStorage.getItem("tripsense_is_authenticated") === "1";
      setIsAuthenticatedUser(isAuthenticated);
    };

    syncAuthState();
    window.addEventListener("storage", syncAuthState);
    window.addEventListener("tripsense-auth-changed", syncAuthState);

    return () => {
      window.removeEventListener("storage", syncAuthState);
      window.removeEventListener("tripsense-auth-changed", syncAuthState);
    };
  }, []);

  const shouldWarnBeforeLeave = useMemo(() => {
    return !isAuthenticatedUser && Boolean(activeTripId?.trim());
  }, [activeTripId, isAuthenticatedUser]);

  useEffect(() => {
    if (typeof window === "undefined" || !shouldWarnBeforeLeave) {
      return undefined;
    }

    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = "";
    };

    const handleDocumentClick = (event) => {
      if (event.defaultPrevented) return;
      if (event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }

      const target = event.target;
      if (!(target instanceof Element)) return;

      const anchor = target.closest("a[href]");
      if (!anchor) return;
      if (anchor.target === "_blank" || anchor.hasAttribute("download")) {
        return;
      }

      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#")) return;

      let nextUrl;
      try {
        nextUrl = new URL(href, window.location.href);
      } catch {
        return;
      }

      const currentUrl = new URL(window.location.href);
      const isSamePage =
        nextUrl.pathname === currentUrl.pathname &&
        nextUrl.search === currentUrl.search;

      if (isSamePage) return;
      if (/^\/login(?:\/|$)/i.test(nextUrl.pathname)) return;

      const shouldLeave = window.confirm(LEAVE_WARNING_MESSAGE);
      if (!shouldLeave) {
        event.preventDefault();
        event.stopPropagation();
      }
    };

    const handlePopState = () => {
      const shouldLeave = window.confirm(LEAVE_WARNING_MESSAGE);
      if (!shouldLeave) {
        window.history.pushState(null, "", window.location.href);
      }
    };

    if (!hasPushedHistoryGuardRef.current) {
      window.history.pushState(null, "", window.location.href);
      hasPushedHistoryGuardRef.current = true;
    }

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("popstate", handlePopState);
    document.addEventListener("click", handleDocumentClick, true);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handlePopState);
      document.removeEventListener("click", handleDocumentClick, true);
    };
  }, [LEAVE_WARNING_MESSAGE, shouldWarnBeforeLeave]);

  useEffect(() => {
    const trip = apiTripData?.trip;
    if (!trip) return;

    const nextDietary = safeArray(trip.dietaryPrefs);

    setEditForm({
      destination: trip.destination || "",
      startDate: trip.startDate || "",
      endDate: trip.endDate || "",
      travelGroup: trip.travelGroup || "Solo",
      budgetTier: trip.budgetTier || "Standard",
      vibe: safeArray(trip.vibe),
      dietaryPrefs: nextDietary.length > 0 ? nextDietary : ["None"],
      mustDos: trip.mustDos || ""
    });
  }, [apiTripData]);

  const destination = apiTripData?.trip?.destination || "";

  const normalizedDays = useMemo(() => {
    if (!apiTripData?.days?.length) return [];

    return apiTripData.days.map((day) => ({
      dayNumber: day.dayNumber,
      title: "Local Highlights",
      date: formatSingleDate(day.date),
      activities: (day.activities || []).map((activity) => ({
        id: activity.id,
        time: activity.time || "09:00",
        type: activity.type || "landmark",
        title: activity.title || "Activity",
        description: activity.description || "Plan generated by TripSense.",
        imageUrl:
          activity.imageUrl ||
          getFallbackImage(activity.title || "travel location", destination)
      }))
    }));
  }, [apiTripData, destination]);

  const tripTitle = destination ? `${destination} Plan` : "Selected Trip";
  const tripDates = apiTripData?.trip
    ? formatDateRange(apiTripData.trip.startDate, apiTripData.trip.endDate)
    : "Dates not set";

  const travelers = apiTripData?.trip?.travelGroup || "-";
  const budget = apiTripData?.trip?.budgetTier || "-";
  const mapSrc = destination
    ? `https://www.google.com/maps?q=${encodeURIComponent(destination)}&output=embed`
    : "";
  const weatherAlert = apiTripData?.trip?.destination
    ? `Weather can change quickly in ${apiTripData.trip.destination}. Check live forecast before each day starts.`
    : "Weather can change quickly. Check forecast before each day starts.";
  const packingList = useMemo(
    () => buildPackingList(apiTripData?.trip?.destination || ""),
    [apiTripData?.trip?.destination]
  );
  const estimatedCostLabel = useMemo(
    () =>
      formatStoredPrice(
        apiTripData?.trip?.estimatedCost,
        apiTripData?.trip?.estimatedCurrency
      ),
    [apiTripData]
  );
  const estimateNote = useMemo(() => {
    return (
      apiTripData?.trip?.estimatedCostNote ||
      "Estimated by TripSense AI during trip generation."
    );
  }, [apiTripData]);

  const isEditDateOrderValid = useMemo(() => {
    if (!editForm.startDate || !editForm.endDate) return true;
    return new Date(editForm.startDate) <= new Date(editForm.endDate);
  }, [editForm.endDate, editForm.startDate]);

  const toggleEditMultiOption = (fieldName, value) => {
    const currentValues = editForm[fieldName];

    if (fieldName === "dietaryPrefs" && value === "None") {
      setEditForm((prev) => ({ ...prev, dietaryPrefs: ["None"] }));
      return;
    }

    const withoutNone =
      fieldName === "dietaryPrefs"
        ? currentValues.filter((item) => item !== "None")
        : currentValues;

    if (withoutNone.includes(value)) {
      const updated = withoutNone.filter((item) => item !== value);
      setEditForm((prev) => ({
        ...prev,
        [fieldName]:
          updated.length > 0
            ? updated
            : fieldName === "dietaryPrefs"
              ? ["None"]
              : []
      }));
      return;
    }

    setEditForm((prev) => ({
      ...prev,
      [fieldName]: [...withoutNone, value]
    }));
  };

  const handleOpenEdit = () => {
    const trip = apiTripData?.trip;
    if (trip) {
      const nextDietary = safeArray(trip.dietaryPrefs);
      setEditForm({
        destination: trip.destination || "",
        startDate: trip.startDate || "",
        endDate: trip.endDate || "",
        travelGroup: trip.travelGroup || "Solo",
        budgetTier: trip.budgetTier || "Standard",
        vibe: safeArray(trip.vibe),
        dietaryPrefs: nextDietary.length > 0 ? nextDietary : ["None"],
        mustDos: trip.mustDos || ""
      });
    }

    setUpdatePlanError("");
    setIsEditOpen(true);
  };

  const handleSavePlanOptions = async () => {
    if (!activeTripId) {
      setUpdatePlanError("Trip id is missing.");
      return;
    }

    if (!editForm.destination.trim()) {
      setUpdatePlanError("Destination is required.");
      return;
    }

    if (!editForm.startDate || !editForm.endDate) {
      setUpdatePlanError("Start date and end date are required.");
      return;
    }

    if (!isEditDateOrderValid) {
      setUpdatePlanError("End date should be after start date.");
      return;
    }

    try {
      setUpdatePlanError("");
      setIsUpdatingPlan(true);

      const response = await fetch(
        `/api/trips/${encodeURIComponent(activeTripId)}/regenerate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            destination: editForm.destination.trim(),
            startDate: editForm.startDate,
            endDate: editForm.endDate,
            travelGroup: editForm.travelGroup,
            budgetTier: editForm.budgetTier,
            vibe: editForm.vibe,
            dietaryPrefs: editForm.dietaryPrefs,
            mustDos: editForm.mustDos,
            travelerCountry:
              typeof window !== "undefined" && isAuthenticatedUser
                ? String(
                    window.localStorage.getItem("tripsense_user_country") || ""
                  ).trim()
                : ""
          })
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result?.details || result?.error || "Could not update plan options."
        );
      }

      setApiTripData(result);
      setIsEditOpen(false);
      setIsCustomizing(false);
    } catch (error) {
      setUpdatePlanError(
        error instanceof Error ? error.message : "Could not update plan options."
      );
    } finally {
      setIsUpdatingPlan(false);
    }
  };

  const handleReroll = async ({ activity, day }) => {
    if (!isCustomizing) return;

    if (!apiTripData?.trip?.id || !activity?.id) {
      setRerollError("Save a generated trip first, then use re-roll.");
      return;
    }

    try {
      setRerollError("");
      setRerollingActivityId(String(activity.id));

      const response = await fetch("/api/trips/re-roll", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          activityId: activity.id,
          context: {
            destination: apiTripData.trip.destination,
            budgetTier: apiTripData.trip.budgetTier,
            travelGroup: apiTripData.trip.travelGroup,
            vibe: apiTripData.trip.vibe || [],
            dietaryPrefs: apiTripData.trip.dietaryPrefs || [],
            mustDos: apiTripData.trip.mustDos || "",
            dayNumber: day.dayNumber,
            dayDate: day.date
          }
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result?.details || result?.error || "Could not re-roll activity."
        );
      }

      if (!result?.activity?.id) {
        throw new Error("Re-roll succeeded but response is missing activity data.");
      }

      setApiTripData((prev) => {
        if (!prev) return prev;

        return {
          ...prev,
          days: (prev.days || []).map((dayItem) => ({
            ...dayItem,
            activities: (dayItem.activities || []).map((activityItem) =>
                    activityItem.id === result.activity.id
                ? {
                    ...activityItem,
                    title: result.activity.title || activityItem.title,
                    description:
                      result.activity.description || activityItem.description,
                    costEstimate:
                      result.activity.costEstimate ?? activityItem.costEstimate,
                    type: result.activity.type || activityItem.type,
                    time: result.activity.time || activityItem.time,
                    imageUrl:
                      result.activity.imageUrl ||
                      activityItem.imageUrl ||
                      getFallbackImage(
                        result.activity.title || activityItem.title || "Activity",
                        destination
                      )
                  }
                : activityItem
            )
          }))
        };
      });
    } catch (error) {
      setRerollError(
        error instanceof Error ? error.message : "Could not re-roll activity."
      );
    } finally {
      setRerollingActivityId("");
    }
  };

  return (
    <>
      <main className="mx-auto max-w-[1280px] px-4 py-8 md:px-6 md:py-10">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-extrabold text-app-slate">
              Active Itinerary
            </h1>
            <p className="mt-1 text-sm text-app-muted">
              Day-by-day timeline generated by TripSense.
            </p>
            {shouldWarnBeforeLeave ? (
              <p className="mt-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700">
                Guest mode: leaving this page may lose your generated trip.
              </p>
            ) : null}
          </div>
          <Link
            href="/trips"
            className="inline-flex items-center gap-2 rounded-xl border border-app-border bg-white px-4 py-2 text-sm font-semibold text-app-slate transition hover:bg-app-sky"
          >
            <ArrowLeft size={16} />
            Back to My Trips
          </Link>
        </header>

        <section className="grid gap-6 lg:grid-cols-[230px_minmax(0,1fr)]">
          <aside className="card-surface h-fit space-y-5 p-5">
            <div>
              <h2 className="text-lg font-bold text-app-slate">{tripTitle}</h2>
              <p className="mt-1 text-sm text-app-muted">{tripDates}</p>
            </div>

            <div className="space-y-3">
              <p className="flex items-center gap-2 text-sm text-app-muted">
                <Users size={16} />
                Travelers: {travelers}
              </p>
              <p className="flex items-center gap-2 text-sm text-app-muted">
                <Clock3 size={16} />
                Budget: {budget}
              </p>
              <p className="flex items-center gap-2 text-sm text-app-muted">
                <Check size={16} />
                {normalizedDays.length} days planned
              </p>
            </div>

            <button
              type="button"
              onClick={handleOpenEdit}
              disabled={!apiTripData?.trip?.id}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-app-border px-3 py-2 text-sm font-semibold text-app-slate transition hover:bg-app-sky disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Pencil size={15} />
              Edit Plan Options
            </button>
          </aside>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
            <section className="card-surface max-h-[75vh] space-y-6 overflow-y-auto p-5">
              <div className="sticky top-0 z-20 -mx-5 -mt-5 border-b border-app-border/70 bg-white/90 px-5 py-4 backdrop-blur">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-app-muted">
                      {isCustomizing ? "Customization unlocked" : "Read-only itinerary"}
                    </p>
                    <h2 className="mt-1 text-lg font-bold text-app-slate">
                      Trip Timeline
                    </h2>
                    <p className="text-sm text-app-muted">
                      {isCustomizing
                        ? "Swapping is enabled. Re-roll any activity you want to refine."
                        : "Turn on customization when you want to swap activities or make adjustments."}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsCustomizing((prev) => !prev)}
                    className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
                      isCustomizing
                        ? "border border-app-border bg-app-sky text-app-slate hover:bg-blue-100"
                        : "bg-app-slate text-white hover:opacity-90"
                    }`}
                  >
                    {isCustomizing ? <Lock size={16} /> : <LockOpen size={16} />}
                    {isCustomizing ? "Customization Enabled" : "Customize this Trip"}
                  </button>
                </div>
              </div>

              {isLoading ? (
                <p className="rounded-xl bg-app-sky px-4 py-3 text-sm font-semibold text-app-slate">
                  Loading generated itinerary...
                </p>
              ) : null}

              {loadError ? (
                <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
                  {loadError}
                </p>
              ) : null}

              {rerollError ? (
                <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
                  {rerollError}
                </p>
              ) : null}

              {normalizedDays.map((day) => (
                <div key={day.dayNumber} className="space-y-3">
                  <div className="sticky top-24 z-10 rounded-xl bg-app-sandSoft px-3 py-2">
                    <h3 className="font-bold text-app-slate">
                      Day {day.dayNumber}: {day.title}
                    </h3>
                    <p className="text-xs font-semibold uppercase tracking-wide text-app-muted">
                      {day.date}
                    </p>
                  </div>

                  <div className="space-y-3">
                    {day.activities.map((activity) => (
                      <ActivityCard
                        key={activity.id}
                        activity={activity}
                        rerolling={rerollingActivityId === String(activity.id)}
                        rerollDisabled={!apiTripData?.trip?.id || !isCustomizing}
                        showReroll={isCustomizing}
                        onReroll={() => handleReroll({ activity, day })}
                      />
                    ))}
                  </div>
                </div>
              ))}

              {!isLoading && !loadError && normalizedDays.length === 0 ? (
                <p className="rounded-xl bg-app-sky px-4 py-3 text-sm font-semibold text-app-slate">
                  {activeTripId
                    ? "No activities found yet for this trip."
                    : "Open a saved trip from My Trips to view itinerary details."}
                </p>
              ) : null}
            </section>

            <aside className="space-y-4">
              <div className="card-surface h-[250px] p-5">
                <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-app-muted">
                  Map
                </h3>
                <div className="h-[180px] overflow-hidden rounded-2xl border border-app-border bg-app-sky">
                  {mapSrc ? (
                    <iframe
                      title={`Map of ${destination}`}
                      src={mapSrc}
                      className="h-full w-full border-0"
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs font-semibold text-app-muted">
                      Select a trip to load map
                    </div>
                  )}
                </div>
                <p className="mt-2 flex items-center gap-2 text-xs font-semibold text-app-muted">
                  <MapPin size={14} />
                  {destination || "No location selected"}
                </p>
              </div>

              <UtilityDrawer
                weatherAlert={weatherAlert}
                estimatedCost={estimatedCostLabel}
                estimateNote={estimateNote}
                packingList={packingList}
              />
            </aside>
          </div>
        </section>

        {!isTripSelectionResolved ? (
          <p className="mt-4 rounded-xl bg-app-sky px-4 py-3 text-sm font-semibold text-app-slate">
            Preparing trip selection...
          </p>
        ) : null}

        {isEditOpen ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 py-6">
            <div className="w-full max-w-2xl rounded-2xl border border-app-border bg-white p-5 shadow-xl md:p-6">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-app-slate">
                    Edit Plan Options
                  </h2>
                  <p className="text-sm text-app-muted">
                    Update your preferences and regenerate this trip.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="rounded-lg border border-app-border p-2 text-app-muted transition hover:bg-app-sky"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="max-h-[65vh] space-y-4 overflow-y-auto pr-1">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-app-slate">
                    Destination
                  </label>
                  <input
                    type="text"
                    value={editForm.destination}
                    onChange={(event) =>
                      setEditForm((prev) => ({
                        ...prev,
                        destination: event.target.value
                      }))
                    }
                    className="w-full rounded-xl border border-app-border bg-white px-3 py-2 text-sm text-app-slate outline-none transition focus:border-app-slate/30 focus:ring-2 focus:ring-app-sky"
                  />
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-app-slate">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={editForm.startDate}
                      onChange={(event) =>
                        setEditForm((prev) => ({
                          ...prev,
                          startDate: event.target.value
                        }))
                      }
                      className="w-full rounded-xl border border-app-border bg-white px-3 py-2 text-sm text-app-slate outline-none transition focus:border-app-slate/30 focus:ring-2 focus:ring-app-sky"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-app-slate">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={editForm.endDate}
                      onChange={(event) =>
                        setEditForm((prev) => ({
                          ...prev,
                          endDate: event.target.value
                        }))
                      }
                      className="w-full rounded-xl border border-app-border bg-white px-3 py-2 text-sm text-app-slate outline-none transition focus:border-app-slate/30 focus:ring-2 focus:ring-app-sky"
                    />
                  </div>
                </div>

                {!isEditDateOrderValid ? (
                  <p className="text-sm font-semibold text-rose-600">
                    End date should be after start date.
                  </p>
                ) : null}

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-app-slate">
                      Travelers
                    </label>
                    <select
                      value={editForm.travelGroup}
                      onChange={(event) =>
                        setEditForm((prev) => ({
                          ...prev,
                          travelGroup: event.target.value
                        }))
                      }
                      className="w-full rounded-xl border border-app-border bg-white px-3 py-2 text-sm text-app-slate outline-none transition focus:border-app-slate/30 focus:ring-2 focus:ring-app-sky"
                    >
                      {travelerOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-semibold text-app-slate">
                      Budget
                    </label>
                    <select
                      value={editForm.budgetTier}
                      onChange={(event) =>
                        setEditForm((prev) => ({
                          ...prev,
                          budgetTier: event.target.value
                        }))
                      }
                      className="w-full rounded-xl border border-app-border bg-white px-3 py-2 text-sm text-app-slate outline-none transition focus:border-app-slate/30 focus:ring-2 focus:ring-app-sky"
                    >
                      {budgetOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-sm font-semibold text-app-slate">Vibe</p>
                  <div className="flex flex-wrap gap-2">
                    {vibeOptions.map((option) => {
                      const selected = editForm.vibe.includes(option);
                      return (
                        <button
                          key={option}
                          type="button"
                          onClick={() => toggleEditMultiOption("vibe", option)}
                          className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                            selected
                              ? "border-app-slate bg-app-slate text-white"
                              : "border-app-border bg-white text-app-slate hover:bg-app-sky"
                          }`}
                        >
                          {option}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-sm font-semibold text-app-slate">
                    Dietary Preferences
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {dietaryOptions.map((option) => {
                      const selected = editForm.dietaryPrefs.includes(option);
                      return (
                        <button
                          key={option}
                          type="button"
                          onClick={() =>
                            toggleEditMultiOption("dietaryPrefs", option)
                          }
                          className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                            selected
                              ? "border-app-slate bg-app-slate text-white"
                              : "border-app-border bg-white text-app-slate hover:bg-app-sky"
                          }`}
                        >
                          {option}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-semibold text-app-slate">
                    Must-Dos / Dealbreakers
                  </label>
                  <textarea
                    rows={3}
                    value={editForm.mustDos}
                    onChange={(event) =>
                      setEditForm((prev) => ({
                        ...prev,
                        mustDos: event.target.value
                      }))
                    }
                    className="w-full rounded-xl border border-app-border bg-white px-3 py-2 text-sm text-app-slate outline-none transition focus:border-app-slate/30 focus:ring-2 focus:ring-app-sky"
                  />
                </div>
              </div>

              {updatePlanError ? (
                <p className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
                  {updatePlanError}
                </p>
              ) : null}

              <div className="mt-5 flex flex-wrap justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="rounded-xl border border-app-border px-4 py-2 text-sm font-semibold text-app-slate transition hover:bg-app-sky"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    void handleSavePlanOptions();
                  }}
                  disabled={isUpdatingPlan}
                  className="rounded-xl bg-app-slate px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isUpdatingPlan ? "Updating..." : "Save & Regenerate"}
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </main>
    </>
  );
}
