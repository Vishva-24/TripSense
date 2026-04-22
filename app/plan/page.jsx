"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { LoaderCircle, PlaneTakeoff } from "lucide-react";
import ProgressBar from "@/components/ui/ProgressBar";
import Button from "@/components/ui/button";
import OptionChip from "@/components/ui/OptionChip";
import { FormInput, FormTextArea } from "@/components/ui/FormInput";
import { useTripPlanner } from "@/context/TripPlannerContext";
import {
  budgetOptions,
  dietaryOptions,
  getTodayIsoDate,
  isPastPlannerDate,
  normalizePlannerVibes,
  travelerOptions,
  vibeOptions
} from "@/lib/trip-planner-options";

const TOTAL_STEPS = 6;
const GUEST_TRIP_CLAIMS_KEY = "tripsense_guest_trip_claims";

function addGuestTripClaim(tripId, guestEmail) {
  if (typeof window === "undefined") return;

  const parsedTripId = Number(tripId);
  const normalizedEmail = String(guestEmail || "").trim().toLowerCase();
  if (!Number.isInteger(parsedTripId) || parsedTripId <= 0 || !normalizedEmail) return;

  let existingClaims = [];
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

  const withoutDuplicate = existingClaims.filter(
    (item) => !(item.tripId === parsedTripId && item.guestEmail === normalizedEmail)
  );

  const nextClaims = [
    {
      tripId: parsedTripId,
      guestEmail: normalizedEmail,
      createdAt: Date.now()
    },
    ...withoutDuplicate
  ].slice(0, 100);

  window.localStorage.setItem(GUEST_TRIP_CLAIMS_KEY, JSON.stringify(nextClaims));
}

export default function PlanTripPage() {
  const router = useRouter();
  const { formData, updateFormField } = useTripPlanner();
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState("");
  const [prefillMessage, setPrefillMessage] = useState("");
  const todayIsoDate = useMemo(() => getTodayIsoDate(), []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const savedPrefillRaw = window.localStorage.getItem("tripsense_persona_prefill");
    if (!savedPrefillRaw) return;

    try {
      const parsed = JSON.parse(savedPrefillRaw);
      const hasDestinationKey = Object.prototype.hasOwnProperty.call(parsed, "destination");
      const destinationFromPrefill = hasDestinationKey
        ? String(parsed.destination || "").trim()
        : null;

      if (destinationFromPrefill !== null) {
        updateFormField("destination", destinationFromPrefill);
      }

      const prefills = normalizePlannerVibes(parsed?.vibe);

      if (prefills.length > 0) {
        updateFormField("vibe", Array.from(new Set(prefills)));
      }

      if (typeof parsed?.budget === "string" && budgetOptions.includes(parsed.budget)) {
        updateFormField("budget", parsed.budget);
      }

      if (typeof parsed?.persona === "string" && parsed.persona.trim()) {
        setPrefillMessage(
          destinationFromPrefill
            ? `Applied your swipe result: ${parsed.persona}. Destination preselected: ${destinationFromPrefill}.`
            : `Applied your swipe result: ${parsed.persona}. You can choose any destination and continue.`
        );
      } else {
        setPrefillMessage(
          destinationFromPrefill
            ? `Applied your swipe preferences. Destination preselected: ${destinationFromPrefill}.`
            : "Applied your swipe preferences. You can choose any destination and continue."
        );
      }
    } catch {
      setPrefillMessage("");
    } finally {
      window.localStorage.removeItem("tripsense_persona_prefill");
    }
  }, [updateFormField]);

  const stepTitle = useMemo(() => {
    const titles = {
      1: "Where to, and for how long?",
      2: "Who is traveling?",
      3: "What's the budget tier?",
      4: "What is the main vibe?",
      5: "Any strict dietary preferences?",
      6: "Any 'Must-Dos' or Dealbreakers?"
    };
    return titles[step];
  }, [step]);

  const isDateOrderValid = useMemo(() => {
    if (!formData.startDate || !formData.endDate) return true;
    return new Date(formData.startDate) <= new Date(formData.endDate);
  }, [formData.endDate, formData.startDate]);

  const hasPastStartDate = useMemo(
    () => isPastPlannerDate(formData.startDate),
    [formData.startDate]
  );

  const canContinue = useMemo(() => {
    if (step === 1) {
      return Boolean(
        formData.destination.trim() &&
        formData.startDate.trim() &&
        formData.endDate.trim() &&
        isDateOrderValid &&
        !hasPastStartDate
      );
    }

    if (step === 4) {
      return formData.vibe.length > 0;
    }

    if (step === 5) {
      return formData.dietary.length > 0;
    }

    return true;
  }, [formData, hasPastStartDate, isDateOrderValid, step]);

  const toggleMultiOption = (fieldName, value) => {
    const currentValues = formData[fieldName];

    if (fieldName === "dietary" && value === "None") {
      updateFormField("dietary", ["None"]);
      return;
    }

    const withoutNone =
      fieldName === "dietary" ? currentValues.filter((item) => item !== "None") : currentValues;

    if (withoutNone.includes(value)) {
      const updated = withoutNone.filter((item) => item !== value);
      updateFormField(fieldName, updated.length > 0 ? updated : fieldName === "dietary" ? ["None"] : []);
      return;
    }

    updateFormField(fieldName, [...withoutNone, value]);
  };

  const goNext = () => {
    if (!canContinue || isGenerating) return;

    if (step === TOTAL_STEPS) {
      void generateTrip();
      return;
    }

    setStep((prev) => prev + 1);
  };

  const goBack = () => {
    if (step > 1) {
      setStep((prev) => prev - 1);
    }
  };

  const resolvePlannerIdentity = () => {
    if (typeof window === "undefined") {
      return {
        email: `guest-${Date.now()}@guest.tripsense.local`,
        isGuest: true
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

    // Guest planning should not create an authenticated session in localStorage.
    return {
      email: `guest-${Date.now()}@guest.tripsense.local`,
      isGuest: true,
      country: ""
    };
  };

  const generateTrip = async () => {
    if (isPastPlannerDate(formData.startDate)) {
      setGenerateError("Start date cannot be in the past.");
      return;
    }

    try {
      setGenerateError("");
      setIsGenerating(true);
      const plannerIdentity = resolvePlannerIdentity();

      const payload = {
        userEmail: plannerIdentity.email,
        destination: formData.destination,
        startDate: formData.startDate,
        endDate: formData.endDate,
        budgetTier: formData.budget,
        travelGroup: formData.travelers,
        vibe: formData.vibe,
        dietaryPrefs: formData.dietary,
        mustDos: formData.notes,
        travelerCountry: plannerIdentity.country
      };

      const response = await fetch("/api/trips/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (!response.ok) {
        const detailedMessage =
          typeof result?.details === "string" && result.details.trim().length > 0
            ? result.details
            : null;
        const primaryError =
          typeof result?.error === "string" && result.error.trim().length > 0
            ? result.error
            : null;
        const bestMessage =
          detailedMessage ||
          (primaryError && primaryError !== "Trip generation failed."
            ? primaryError
            : null) ||
          "Trip generation failed.";

        throw new Error(
          bestMessage
        );
      }

      if (!result?.tripId) {
        throw new Error("Trip created but trip ID is missing in response.");
      }

      if (typeof window !== "undefined") {
        window.localStorage.setItem("tripsense_last_trip_id", result.tripId);
        if (plannerIdentity.isGuest) {
          addGuestTripClaim(result.tripId, plannerIdentity.email);
        }
      }

      router.push(`/trips/${encodeURIComponent(result.tripId)}`);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Trip generation failed.";
      setGenerateError(message);
      setIsGenerating(false);
    }
  };

  if (isGenerating) {
    return (
      <main className="mx-auto flex min-h-screen max-w-2xl items-center justify-center px-4">
        <div className="card-surface w-full space-y-4 p-8 text-center">
          <LoaderCircle className="mx-auto animate-spin text-app-slate" size={34} />
          <h1 className="text-2xl font-extrabold text-app-slate">
            Generating your trip...
          </h1>
          <p className="text-sm text-app-muted">
            TripSense is building your day-by-day plan.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 md:px-6 md:py-12">
      <section className="card-surface space-y-8 p-6 md:p-8">
        <header className="space-y-4">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-app-muted">
            <PlaneTakeoff size={15} />
            Trip Planner
          </p>
          {prefillMessage ? (
            <p className="rounded-xl bg-blue-50 px-4 py-2 text-sm font-semibold text-slate-700">
              {prefillMessage}
            </p>
          ) : null}
          <ProgressBar currentStep={step} totalSteps={TOTAL_STEPS} />
        </header>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22 }}
            className="space-y-5"
          >
            <h1 className="text-2xl font-extrabold text-app-slate">{stepTitle}</h1>

            {step === 1 && (
              <div className="grid gap-4 md:grid-cols-3">
                <div className="md:col-span-3">
                  <FormInput
                    label="Destination"
                    placeholder="Example: Kyoto, Japan"
                    value={formData.destination}
                    onChange={(event) =>
                      updateFormField("destination", event.target.value)
                    }
                  />
                </div>
                <FormInput
                  label="Start Date"
                  type="date"
                  value={formData.startDate}
                  min={todayIsoDate}
                  onChange={(event) =>
                    updateFormField("startDate", event.target.value)
                  }
                />
                <FormInput
                  label="End Date"
                  type="date"
                  value={formData.endDate}
                  min={formData.startDate || todayIsoDate}
                  onChange={(event) => updateFormField("endDate", event.target.value)}
                />
                {hasPastStartDate && (
                  <p className="md:col-span-3 text-sm font-semibold text-rose-600">
                    Start date cannot be in the past.
                  </p>
                )}
                {!isDateOrderValid && (
                  <p className="md:col-span-3 text-sm font-semibold text-rose-600">
                    End date should be after start date.
                  </p>
                )}
              </div>
            )}

            {step === 2 && (
              <div className="flex flex-wrap gap-3">
                {travelerOptions.map((option) => (
                  <OptionChip
                    key={option}
                    label={option}
                    selected={formData.travelers === option}
                    onClick={() => updateFormField("travelers", option)}
                  />
                ))}
              </div>
            )}

            {step === 3 && (
              <div className="flex flex-wrap gap-3">
                {budgetOptions.map((option) => (
                  <OptionChip
                    key={option}
                    label={option}
                    selected={formData.budget === option}
                    onClick={() => updateFormField("budget", option)}
                  />
                ))}
              </div>
            )}

            {step === 4 && (
              <div className="space-y-2">
                <p className="text-sm text-app-muted">You can select multiple vibes.</p>
                <div className="flex flex-wrap gap-3">
                  {vibeOptions.map((option) => (
                    <OptionChip
                      key={option}
                      label={option}
                      multi
                      selected={formData.vibe.includes(option)}
                      onClick={() => toggleMultiOption("vibe", option)}
                    />
                  ))}
                </div>
              </div>
            )}

            {step === 5 && (
              <div className="space-y-2">
                <p className="text-sm text-app-muted">
                  You can select one or many dietary filters.
                </p>
                <div className="flex flex-wrap gap-3">
                  {dietaryOptions.map((option) => (
                    <OptionChip
                      key={option}
                      label={option}
                      multi
                      selected={formData.dietary.includes(option)}
                      onClick={() => toggleMultiOption("dietary", option)}
                    />
                  ))}
                </div>
              </div>
            )}

            {step === 6 && (
              <FormTextArea
                label="Notes"
                placeholder="Example: Must visit local markets, avoid very crowded places."
                value={formData.notes}
                onChange={(event) => updateFormField("notes", event.target.value)}
              />
            )}
          </motion.div>
        </AnimatePresence>

        <footer className="flex flex-wrap justify-between gap-3">
          <Button variant="outline" onClick={goBack} disabled={step === 1}>
            Back
          </Button>
          <Button onClick={goNext} disabled={!canContinue}>
            {step === TOTAL_STEPS ? "Generate Trip" : "Next"}
          </Button>
        </footer>

        {generateError ? (
          <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
            {generateError}
          </p>
        ) : null}
      </section>
    </main>
  );
}
