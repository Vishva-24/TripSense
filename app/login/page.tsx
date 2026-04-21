"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import TravelConnectSignin from "@/components/ui/travel-connect-signin";

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
    <TravelConnectSignin
      mode={mode}
      onModeChange={(nextMode) => {
        setMode(nextMode);
        setError("");
        setPassword("");
        setConfirmPassword("");
      }}
      email={email}
      password={password}
      name={name}
      country={country}
      confirmPassword={confirmPassword}
      showPassword={showPassword}
      showConfirmPassword={showConfirmPassword}
      isSubmitting={isSubmitting}
      isLoggedIn={isLoggedIn}
      activeEmail={activeEmail}
      error={error}
      onEmailChange={setEmail}
      onPasswordChange={setPassword}
      onNameChange={setName}
      onCountryChange={setCountry}
      onConfirmPasswordChange={setConfirmPassword}
      onTogglePassword={() => setShowPassword((prev) => !prev)}
      onToggleConfirmPassword={() => setShowConfirmPassword((prev) => !prev)}
      onGoogleSignIn={() => {
        void handleGoogleContinue();
      }}
      onSubmit={handleSubmit}
      onSignOut={handleSignOut}
    />
  );
}
