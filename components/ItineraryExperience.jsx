"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  Clock3,
  Headset,
  Lock,
  LockOpen,
  MapPin,
  Pencil,
  Users,
  X
} from "lucide-react";
import ActivityCard from "@/components/ActivityCard";
import UtilityDrawer from "@/components/UtilityDrawer";
import {
  budgetOptions,
  dietaryOptions,
  getTodayIsoDate,
  isPastPlannerDate,
  normalizePlannerVibes,
  travelerOptions,
  vibeOptions
} from "@/lib/trip-planner-options";
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

function formatDayChipDate(dateValue) {
  if (!dateValue) return "";

  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) return String(dateValue);

  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric"
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

function getFallbackImage(title, destination) {
  return `https://placehold.co/480x320/png?text=${encodeURIComponent(
    `${title} - ${destination}`
  )}`;
}

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
  const [selectedDayNumber, setSelectedDayNumber] = useState(null);
  const [customRequestTarget, setCustomRequestTarget] = useState(null);
  const [customRequestText, setCustomRequestText] = useState("");
  const [customRequestError, setCustomRequestError] = useState("");
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
  const todayIsoDate = useMemo(() => getTodayIsoDate(), []);

  const [isContactingAgent, setIsContactingAgent] = useState(false);
  const [agentContacted, setAgentContacted] = useState(false);
  const [contactAgentError, setContactAgentError] = useState("");

  const handleContactAgent = async () => {
    if (!apiTripData?.trip?.id || !apiTripData?.trip?.userId) return;
    try {
      setContactAgentError("");
      setIsContactingAgent(true);
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";
      const response = await fetch(`${baseUrl}/api/agent-requests`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          trip_id: apiTripData.trip.id,
          user_id: apiTripData.trip.userId
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to contact agent: ${response.statusText}`);
      }

      setAgentContacted(true);
    } catch (error) {
      console.error(error);
      setContactAgentError(error.message || "Could not connect to FastAPI backend.");
    } finally {
      setIsContactingAgent(false);
    }
  };

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

        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";
        const response = await fetch(
          `${baseUrl}/api/trips/${encodeURIComponent(selectedTripId)}`,
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
    const nextVibes = normalizePlannerVibes(trip.vibe);

    setEditForm({
      destination: trip.destination || "",
      startDate: trip.startDate || "",
      endDate: trip.endDate || "",
      travelGroup: trip.travelGroup || "Solo",
      budgetTier: trip.budgetTier || "Standard",
      vibe: nextVibes,
      dietaryPrefs: nextDietary.length > 0 ? nextDietary : ["None"],
      mustDos: trip.mustDos || ""
    });
    setCustomRequestTarget(null);
    setCustomRequestText("");
    setCustomRequestError("");
    setAgentContacted(trip.agentNotified === true);
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

  useEffect(() => {
    if (!normalizedDays.length) {
      setSelectedDayNumber(null);
      return;
    }

    setSelectedDayNumber((currentDayNumber) => {
      if (
        currentDayNumber &&
        normalizedDays.some((day) => day.dayNumber === currentDayNumber)
      ) {
        return currentDayNumber;
      }

      return normalizedDays[0].dayNumber;
    });
  }, [normalizedDays]);

  const selectedDay = useMemo(() => {
    if (!normalizedDays.length) return null;

    return (
      normalizedDays.find((day) => day.dayNumber === selectedDayNumber) ||
      normalizedDays[0]
    );
  }, [normalizedDays, selectedDayNumber]);

  const travelers = apiTripData?.trip?.travelGroup || "-";
  const budget = apiTripData?.trip?.budgetTier || "-";
  const mapSrc = destination
    ? `https://www.google.com/maps?q=${encodeURIComponent(destination)}&output=embed`
    : "";
  const weatherAlert = apiTripData?.trip?.destination
    ? `Weather can change quickly in ${apiTripData.trip.destination}. Check live forecast before each day starts.`
    : "Weather can change quickly. Check forecast before each day starts.";
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
  const hasPastEditStartDate = useMemo(
    () => isPastPlannerDate(editForm.startDate),
    [editForm.startDate]
  );

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
        vibe: normalizePlannerVibes(trip.vibe),
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

    if (hasPastEditStartDate) {
      setUpdatePlanError("Start date cannot be in the past.");
      return;
    }

    if (!isEditDateOrderValid) {
      setUpdatePlanError("End date should be after start date.");
      return;
    }

    try {
      setUpdatePlanError("");
      setIsUpdatingPlan(true);

      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";
      const response = await fetch(
        `${baseUrl}/api/trips/${encodeURIComponent(activeTripId)}/regenerate`,
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
            vibe: normalizePlannerVibes(editForm.vibe),
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

  const requestActivityReroll = async ({ activity, day, customRequest = "" }) => {
    if (!isCustomizing) return;

    if (!apiTripData?.trip?.id || !activity?.id) {
      throw new Error("Save a generated trip first, then use re-roll.");
    }

    setRerollingActivityId(String(activity.id));

    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";
    const response = await fetch(`${baseUrl}/api/trips/re-roll`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        activityId: activity.id,
        customRequest: customRequest.trim() || undefined,
        context: {
          destination: apiTripData.trip.destination,
          budgetTier: apiTripData.trip.budgetTier,
          travelGroup: apiTripData.trip.travelGroup,
          vibe: normalizePlannerVibes(apiTripData.trip.vibe || []),
          dietaryPrefs: apiTripData.trip.dietaryPrefs || [],
          mustDos: apiTripData.trip.mustDos || "",
          dayNumber: day.dayNumber,
          dayDate: day.date
        }
      })
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result?.details || result?.error || "Could not re-roll activity.");
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
  };

  const handleReroll = async ({ activity, day }) => {
    try {
      setRerollError("");
      await requestActivityReroll({ activity, day });
    } catch (error) {
      setRerollError(
        error instanceof Error ? error.message : "Could not re-roll activity."
      );
    } finally {
      setRerollingActivityId("");
    }
  };

  const handleOpenCustomRequest = ({ activity, day }) => {
    setCustomRequestTarget({ activity, day });
    setCustomRequestText("");
    setCustomRequestError("");
  };

  const handleSubmitCustomRequest = async () => {
    if (!customRequestTarget?.activity || !customRequestTarget?.day) return;

    if (!customRequestText.trim()) {
      setCustomRequestError("Tell TripSense what you'd like to do instead.");
      return;
    }

    try {
      setCustomRequestError("");
      setRerollError("");
      await requestActivityReroll({
        activity: customRequestTarget.activity,
        day: customRequestTarget.day,
        customRequest: customRequestText
      });
      setCustomRequestTarget(null);
      setCustomRequestText("");
    } catch (error) {
      setCustomRequestError(
        error instanceof Error ? error.message : "Could not request a specific change."
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

        <section className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          <div className="space-y-4">
            <aside className="card-surface h-fit space-y-5 p-5">
              <div>
                <h2 className="max-w-full break-words text-lg font-bold leading-tight text-app-slate [overflow-wrap:anywhere]">
                  {tripTitle}
                </h2>
                <p className="mt-1 break-words text-sm text-app-muted [overflow-wrap:anywhere]">
                  {tripDates}
                </p>
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

            <aside className="card-surface h-fit space-y-3 p-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-app-muted">
                  {isCustomizing ? "Customization unlocked" : "Read-only itinerary"}
                </p>
                <h3 className="mt-2 text-lg font-bold text-app-slate">
                  Trip Timeline
                </h3>
                <p className="mt-1 text-sm leading-6 text-app-muted">
                  {isCustomizing
                    ? "Swapping is enabled. Re-roll any activity you want to refine."
                    : "Turn on customization when you want to swap activities or make adjustments."}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsCustomizing((prev) => !prev)}
                className={`inline-flex w-full items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
                  isCustomizing
                    ? "border border-app-border bg-white text-app-slate hover:bg-blue-50"
                    : "bg-app-slate text-white hover:opacity-90"
                }`}
              >
                {isCustomizing ? <Lock size={16} /> : <LockOpen size={16} />}
                {isCustomizing ? "Customization Enabled" : "Customize this Trip"}
              </button>

            </aside>

            <aside className="card-surface h-fit space-y-3 p-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-app-muted">
                  Support
                </p>
                <h3 className="mt-2 text-lg font-bold text-app-slate">
                  Expert Assistance
                </h3>
                <p className="mt-1 text-sm leading-6 text-app-muted">
                  Need help perfecting your itinerary? Our travel agents are ready to assist.
                </p>
              </div>

              {agentContacted ? (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
                  <div className="flex items-center gap-2">
                    <Check size={16} />
                    Agent Notified!
                  </div>
                  <p className="mt-1 text-xs font-normal text-emerald-600">
                    We have received your trip details and will reach out to you shortly.
                  </p>
                </div>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={handleContactAgent}
                    disabled={isContactingAgent || !apiTripData?.trip?.id}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-app-border bg-white px-4 py-2 text-sm font-semibold text-app-slate transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isContactingAgent ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-app-slate border-r-transparent" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Headset size={16} />
                        Contact Our Agent
                      </>
                    )}
                  </button>
                  {contactAgentError && (
                    <p className="text-xs font-semibold text-rose-600 text-center">
                      {contactAgentError}
                    </p>
                  )}
                </>
              )}
            </aside>
          </div>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
            <section className="card-surface flex max-h-[75vh] flex-col overflow-hidden">
              <div className="shrink-0 border-b border-app-border/70 bg-white px-5 py-4">
                {normalizedDays.length > 0 ? (
                  <div className="no-scrollbar flex gap-3 overflow-x-auto overflow-y-hidden pb-1 pr-2">
                    {normalizedDays.map((day) => {
                      const isActive = day.dayNumber === selectedDay?.dayNumber;
                      return (
                        <button
                          key={day.dayNumber}
                          type="button"
                          onClick={() => setSelectedDayNumber(day.dayNumber)}
                          className={`shrink-0 rounded-[2rem] border px-5 py-4 text-left transition ${
                            isActive
                              ? "border-app-slate bg-app-slate text-white shadow-lg shadow-slate-900/15"
                              : "border-app-border bg-white text-app-slate hover:border-blue-200 hover:bg-app-sky/55"
                          }`}
                        >
                          <span className="block text-[0.7rem] font-bold uppercase tracking-[0.2em] opacity-75">
                            Day {day.dayNumber}
                          </span>
                          <span className="mt-2 block text-xl font-extrabold leading-none">
                            {formatDayChipDate(day.date)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                ) : null}
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
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

                {selectedDay ? (
                  <div key={selectedDay.dayNumber} className="space-y-3">
                    {selectedDay.activities.map((activity) => (
                      <ActivityCard
                        key={activity.id}
                        activity={activity}
                        rerolling={rerollingActivityId === String(activity.id)}
                        rerollDisabled={!apiTripData?.trip?.id || !isCustomizing}
                        showReroll={isCustomizing}
                        onReroll={() => handleReroll({ activity, day: selectedDay })}
                        onSpecificRequest={() =>
                          handleOpenCustomRequest({ activity, day: selectedDay })
                        }
                      />
                    ))}
                  </div>
                ) : null}

                {!isLoading && !loadError && normalizedDays.length === 0 ? (
                  <p className="rounded-xl bg-app-sky px-4 py-3 text-sm font-semibold text-app-slate">
                    {activeTripId
                      ? "No activities found yet for this trip."
                      : "Open a saved trip from My Trips to view itinerary details."}
                  </p>
                ) : null}
              </div>
            </section>

            <aside className="space-y-4">
              <div className="card-surface space-y-4 overflow-hidden p-5">
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
                <div className="w-full min-w-0 rounded-xl border border-app-border/70 bg-app-sky/40 px-3 py-2">
                  <p className="flex w-full min-w-0 items-start gap-2 text-xs font-semibold text-app-muted">
                    <MapPin size={14} className="mt-0.5 shrink-0" />
                    <span className="block min-w-0 flex-1 break-all whitespace-normal leading-5">
                      {destination || "No location selected"}
                    </span>
                  </p>
                </div>
              </div>

              <UtilityDrawer
                weatherAlert={weatherAlert}
                estimatedCost={estimatedCostLabel}
                estimateNote={estimateNote}
              />
            </aside>
          </div>
        </section>

        {!isTripSelectionResolved ? (
          <p className="mt-4 rounded-xl bg-app-sky px-4 py-3 text-sm font-semibold text-app-slate">
            Preparing trip selection...
          </p>
        ) : null}

        {customRequestTarget ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 py-6">
            <div className="w-full max-w-lg rounded-2xl border border-app-border bg-white p-5 shadow-xl md:p-6">
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-app-muted">
                    Specific change
                  </p>
                  <h2 className="mt-2 text-2xl font-bold text-app-slate">
                    What would you rather do here?
                  </h2>
                  <p className="mt-1 text-sm text-app-muted">
                    TripSense will keep the time slot and reshape this stop around
                    your request.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setCustomRequestTarget(null);
                    setCustomRequestText("");
                    setCustomRequestError("");
                  }}
                  className="rounded-lg border border-app-border p-2 text-app-muted transition hover:bg-app-sky"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="rounded-2xl border border-app-border bg-app-sky/35 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-app-muted">
                  Current activity
                </p>
                <p className="mt-2 text-sm font-bold text-app-slate">
                  {customRequestTarget.activity?.time} · {customRequestTarget.activity?.title}
                </p>
                <p className="mt-1 text-sm text-app-muted">
                  {customRequestTarget.activity?.description}
                </p>
              </div>

              <div className="mt-4">
                <label className="mb-2 block text-sm font-semibold text-app-slate">
                  Tell TripSense what you want instead
                </label>
                <textarea
                  rows={4}
                  value={customRequestText}
                  onChange={(event) => setCustomRequestText(event.target.value)}
                  placeholder="Example: Replace this with a scenic hot spring stop and a tea house visit."
                  className="w-full rounded-2xl border border-app-border bg-white px-4 py-3 text-sm text-app-slate outline-none transition focus:border-app-slate/30 focus:ring-2 focus:ring-app-sky"
                />
              </div>

              {customRequestError ? (
                <p className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
                  {customRequestError}
                </p>
              ) : null}

              <div className="mt-5 flex flex-wrap justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setCustomRequestTarget(null);
                    setCustomRequestText("");
                    setCustomRequestError("");
                  }}
                  className="rounded-xl border border-app-border px-4 py-2 text-sm font-semibold text-app-slate transition hover:bg-app-sky"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    void handleSubmitCustomRequest();
                  }}
                  disabled={rerollingActivityId === String(customRequestTarget.activity?.id)}
                  className="rounded-xl bg-app-slate px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {rerollingActivityId === String(customRequestTarget.activity?.id)
                    ? "Updating..."
                    : "Request Change"}
                </button>
              </div>
            </div>
          </div>
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
                      min={todayIsoDate}
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
                      min={editForm.startDate || todayIsoDate}
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

                {hasPastEditStartDate ? (
                  <p className="text-sm font-semibold text-rose-600">
                    Start date cannot be in the past.
                  </p>
                ) : null}

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
