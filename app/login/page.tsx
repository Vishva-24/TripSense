"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

const GUEST_TRIP_CLAIMS_KEY = "tripsense_guest_trip_claims";

type GuestTripClaim = {
  tripId: number;
  guestEmail: string;
  createdAt?: number;
};

function normalizeGuestClaims(rawValue: unknown): GuestTripClaim[] {
  if (!Array.isArray(rawValue)) return [];

  return rawValue
    .map((item) => ({
      tripId: Number((item as GuestTripClaim)?.tripId),
      guestEmail: String((item as GuestTripClaim)?.guestEmail || "")
        .trim()
        .toLowerCase(),
      createdAt: Number((item as GuestTripClaim)?.createdAt) || Date.now()
    }))
    .filter(
      (item) =>
        Number.isInteger(item.tripId) &&
        item.tripId > 0 &&
        /@(guest\.)?tripsense\.local$/i.test(item.guestEmail)
    );
}

function readGuestTripClaims(): GuestTripClaim[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(GUEST_TRIP_CLAIMS_KEY);
    if (!raw) return [];
    return normalizeGuestClaims(JSON.parse(raw));
  } catch {
    return [];
  }
}

function writeGuestTripClaims(claims: GuestTripClaim[]) {
  if (typeof window === "undefined") return;
  if (!claims.length) {
    window.localStorage.removeItem(GUEST_TRIP_CLAIMS_KEY);
    return;
  }

  window.localStorage.setItem(
    GUEST_TRIP_CLAIMS_KEY,
    JSON.stringify(normalizeGuestClaims(claims).slice(0, 100))
  );
}

async function claimGuestTripsToUser(targetEmail: string) {
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
    const response = await fetch("/api/trips/claim-guest", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        targetEmail,
        claims: claimsForRequest
      })
    });

    if (!response.ok) {
      return;
    }

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
    // Silent fallback: login should still continue even if trip transfer fails.
  }
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-5 w-5" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M24 9.5c3.3 0 6.2 1.1 8.5 3.2l6.3-6.3C34.9 2.8 29.8.5 24 .5 14.8.5 6.8 5.8 2.9 13.6l7.6 5.9C12.4 13.4 17.7 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.5 24.5c0-1.6-.2-3.1-.5-4.5H24v9h12.6c-.5 2.8-2.1 5.1-4.4 6.7l7.1 5.5c4.2-3.8 7.2-9.5 7.2-16.7z"
      />
      <path
        fill="#FBBC05"
        d="M10.5 28.5c-.5-1.4-.8-2.9-.8-4.5s.3-3.1.8-4.5L2.9 13.6C1 17.1 0 20.9 0 24s1 6.9 2.9 10.4l7.6-5.9z"
      />
      <path
        fill="#34A853"
        d="M24 47.5c6.5 0 12-2.1 16-6.2l-7.1-5.5c-2 1.3-4.6 2.2-8.9 2.2-6.3 0-11.6-4-13.5-9.9l-7.6 5.9C6.8 42.2 14.8 47.5 24 47.5z"
      />
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [country, setCountry] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeEmail, setActiveEmail] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const modeParam = params.get("mode");
    if (modeParam === "signup") {
      setMode("signup");
    }

    const savedEmail = window.localStorage.getItem("tripsense_user_email") || "";
    const savedName = window.localStorage.getItem("tripsense_user_name") || "";
    const savedCountry = window.localStorage.getItem("tripsense_user_country") || "";
    let isAuthenticated =
      window.localStorage.getItem("tripsense_is_authenticated") === "1";

    if (!isAuthenticated && savedEmail.trim() && !/@tripsense\.local$/i.test(savedEmail.trim())) {
      window.localStorage.setItem("tripsense_is_authenticated", "1");
      isAuthenticated = true;
    }

    if (!isAuthenticated && /@tripsense\.local$/i.test(savedEmail.trim())) {
      window.localStorage.removeItem("tripsense_user_email");
      window.localStorage.removeItem("tripsense_user_name");
      window.localStorage.removeItem("tripsense_user_country");
    }

    if (isAuthenticated && savedEmail.trim()) {
      setIsLoggedIn(true);
      setActiveEmail(savedEmail.trim());
      setEmail(savedEmail.trim());
      setName(savedName.trim());
      setCountry(savedCountry.trim());
    }
  }, []);

  const submitLabel = useMemo(
    () => (mode === "signup" ? "Create Account" : "Sign In"),
    [mode]
  );

  const validateInputs = ():
    | { ok: false; message: string }
    | { ok: true; normalizedEmail: string } => {
    const normalizedEmail = email.trim().toLowerCase();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(normalizedEmail)) {
      return { ok: false, message: "Enter a valid email address." };
    }

    if (mode === "signin" && password.trim().length === 0) {
      return { ok: false, message: "Password is required." };
    }

    if (mode === "signup" && password.trim().length < 6) {
      return { ok: false, message: "Password must be at least 6 characters." };
    }

    if (mode === "signup" && !name.trim()) {
      return { ok: false, message: "Your name is required." };
    }

    if (mode === "signup" && !country.trim()) {
      return { ok: false, message: "Country is required." };
    }

    if (mode === "signup" && password !== confirmPassword) {
      return { ok: false, message: "Password and confirm password do not match." };
    }

    return { ok: true, normalizedEmail };
  };

  const handleSuccessLogin = async (user: {
    email: string;
    name?: string;
    country?: string;
  }) => {
    const normalizedEmail = user.email.trim().toLowerCase();
    const normalizedName = (user.name || "").trim();
    const normalizedCountry = (user.country || "").trim();

    if (typeof window !== "undefined") {
      window.localStorage.setItem("tripsense_user_email", normalizedEmail);
      window.localStorage.setItem("tripsense_user_name", normalizedName);
      window.localStorage.setItem("tripsense_user_country", normalizedCountry);
      window.localStorage.setItem("tripsense_is_authenticated", "1");
      window.dispatchEvent(new Event("tripsense-auth-changed"));
    }

    setIsLoggedIn(true);
    setActiveEmail(normalizedEmail);
    setName(normalizedName);
    setCountry(normalizedCountry);
    await claimGuestTripsToUser(normalizedEmail);
    router.push("/trips");
  };

  const handleGoogleContinue = async () => {
    try {
      setError("");
      setIsSubmitting(true);

      const fallbackEmail = `google-${Date.now()}@tripsense.local`;
      const normalizedEmail =
        (email.trim() ? email.trim().toLowerCase() : fallbackEmail).toLowerCase();

      const response = await fetch("/api/auth/email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          mode: "google",
          email: normalizedEmail
        })
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result?.details || result?.error || "Google sign-in failed.");
      }

      await handleSuccessLogin({
        email: result?.user?.email || normalizedEmail,
        name: result?.user?.name || "",
        country: result?.user?.country || ""
      });
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : "Google sign-in failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validation = validateInputs();
    if (!validation.ok) {
      setError(validation.message || "Invalid form fields.");
      return;
    }

    try {
      setError("");
      setIsSubmitting(true);

      const response = await fetch("/api/auth/email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          mode,
          email: validation.normalizedEmail,
          password,
          name: name.trim(),
          country: country.trim()
        })
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(
          result?.details ||
            result?.error ||
            (mode === "signup" ? "Sign up failed." : "Sign in failed.")
        );
      }

      await handleSuccessLogin({
        email: result?.user?.email || validation.normalizedEmail,
        name: result?.user?.name || name.trim(),
        country: result?.user?.country || country.trim()
      });
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : "Authentication failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignOut = () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("tripsense_user_email");
      window.localStorage.removeItem("tripsense_user_name");
      window.localStorage.removeItem("tripsense_user_country");
      window.localStorage.removeItem("tripsense_is_authenticated");
      window.dispatchEvent(new Event("tripsense-auth-changed"));
    }

    setIsLoggedIn(false);
    setActiveEmail("");
    setName("");
    setCountry("");
    setPassword("");
    setConfirmPassword("");
    setMode("signin");
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 px-4 py-24">
      <div className="mx-auto flex min-h-[calc(100vh-12rem)] w-full max-w-6xl items-center justify-center">
        <section className="w-full max-w-md rounded-2xl border border-white/60 bg-white/90 p-6 shadow-sm backdrop-blur-sm md:p-8">
          <header className="mb-6 text-center">
            <h1 className="text-2xl font-extrabold text-slate-800">
              {mode === "signup" ? "Create your TripSense account" : "Welcome back to TripSense"}
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              {mode === "signup"
                ? "Sign up to start saving and managing your itineraries."
                : "Log in to access your saved itineraries."}
            </p>
          </header>

          {isLoggedIn ? (
            <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">
              Signed in as {activeEmail}
            </div>
          ) : null}

          <div className="space-y-4">
            <button
              type="button"
              onClick={() => {
                void handleGoogleContinue();
              }}
              disabled={isSubmitting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <GoogleIcon />
              Continue with Google
            </button>

            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span className="h-px flex-1 bg-slate-200" />
              <span>or continue with email</span>
              <span className="h-px flex-1 bg-slate-200" />
            </div>

            <form className="space-y-3" onSubmit={handleSubmit}>
              {mode === "signup" ? (
                <div className="space-y-1.5">
                  <label htmlFor="name" className="text-sm font-semibold text-slate-700">
                    Your Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                  />
                </div>
              ) : null}

              <div className="space-y-1.5">
                <label htmlFor="email" className="text-sm font-semibold text-slate-700">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                />
              </div>

              {mode === "signup" ? (
                <div className="space-y-1.5">
                  <label htmlFor="country" className="text-sm font-semibold text-slate-700">
                    Country
                  </label>
                  <input
                    id="country"
                    type="text"
                    placeholder="Enter your country"
                    value={country}
                    onChange={(event) => setCountry(event.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                  />
                </div>
              ) : null}

              <div className="space-y-1.5">
                <label
                  htmlFor="password"
                  className="text-sm font-semibold text-slate-700"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 pr-16 text-sm text-slate-800 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-0 px-3 text-xs font-semibold text-slate-600 hover:text-slate-800"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {mode === "signup" ? (
                <div className="space-y-1.5">
                  <label
                    htmlFor="confirm-password"
                    className="text-sm font-semibold text-slate-700"
                  >
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      id="confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Re-enter your password"
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 pr-16 text-sm text-slate-800 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      className="absolute inset-y-0 right-0 px-3 text-xs font-semibold text-slate-600 hover:text-slate-800"
                    >
                      {showConfirmPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>
              ) : null}

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-2 inline-flex w-full items-center justify-center rounded-xl bg-slate-800 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
              >
                {isSubmitting ? "Please wait..." : submitLabel}
              </button>
            </form>
          </div>

          {error ? (
            <p className="mt-4 rounded-xl bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">
              {error}
            </p>
          ) : null}

          <p className="mt-6 text-center text-sm text-slate-500">
            {mode === "signup"
              ? "Already have an account?"
              : "Don't have an account?"}{" "}
            <button
              type="button"
              onClick={() => {
                setMode((prev) => (prev === "signin" ? "signup" : "signin"));
                setError("");
                setPassword("");
                setConfirmPassword("");
              }}
              className="font-semibold text-slate-800 hover:underline"
            >
              {mode === "signup" ? "Sign in" : "Sign up"}
            </button>
          </p>

          {isLoggedIn ? (
            <div className="mt-4 flex justify-center gap-3">
              <Link
                href="/trips"
                className="rounded-full border border-slate-300 px-4 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Go to My Trips
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                className="rounded-full border border-rose-200 px-4 py-1.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-50"
              >
                Log out
              </button>
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}
