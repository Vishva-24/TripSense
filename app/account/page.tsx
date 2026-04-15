"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  LogOut,
  ShieldAlert,
  SlidersHorizontal,
  Trash2,
  User
} from "lucide-react";

type AccountTab = "profile" | "defaults" | "security";

const tabs: Array<{ key: AccountTab; label: string }> = [
  { key: "profile", label: "Profile" },
  { key: "defaults", label: "Travel Defaults" },
  { key: "security", label: "Security" }
];

const budgetOptions = ["Shoestring", "Standard", "Luxury"];
const travelerOptions = ["Solo", "Couple", "Family", "Friends"];
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

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export default function AccountPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<AccountTab>("profile");
  const [isHydrated, setIsHydrated] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [country, setCountry] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingDefaults, setIsSavingDefaults] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [defaults, setDefaults] = useState({
    budgetTier: "Standard",
    travelGroup: "Solo",
    vibe: ["Chill"]
  });

  const userInitial = useMemo(() => {
    const source = (name || email || "U").trim();
    return source.charAt(0).toUpperCase() || "U";
  }, [email, name]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    let isAuthenticated =
      window.localStorage.getItem("tripsense_is_authenticated") === "1";
    const savedEmail = window.localStorage.getItem("tripsense_user_email") || "";
    const savedName = window.localStorage.getItem("tripsense_user_name") || "";
    const savedCountry = window.localStorage.getItem("tripsense_user_country") || "";
    const savedDefaultsRaw =
      window.localStorage.getItem("tripsense_travel_defaults") || "";

    if (!isAuthenticated && savedEmail.trim() && !/@tripsense\.local$/i.test(savedEmail.trim())) {
      window.localStorage.setItem("tripsense_is_authenticated", "1");
      isAuthenticated = true;
    }

    if (!isAuthenticated || !savedEmail.trim()) {
      router.replace("/login");
      return;
    }

    setEmail(savedEmail.trim().toLowerCase());
    setName(savedName || savedEmail.split("@")[0] || "");
    setCountry(savedCountry || "");

    if (savedDefaultsRaw) {
      try {
        const parsed = JSON.parse(savedDefaultsRaw) as {
          budgetTier?: string;
          travelGroup?: string;
          vibe?: string[];
        };

        setDefaults({
          budgetTier:
            parsed.budgetTier && budgetOptions.includes(parsed.budgetTier)
              ? parsed.budgetTier
              : "Standard",
          travelGroup:
            parsed.travelGroup && travelerOptions.includes(parsed.travelGroup)
              ? parsed.travelGroup
              : "Solo",
          vibe:
            Array.isArray(parsed.vibe) && parsed.vibe.length > 0
              ? parsed.vibe
              : ["Chill"]
        });
      } catch {
        setDefaults({
          budgetTier: "Standard",
          travelGroup: "Solo",
          vibe: ["Chill"]
        });
      }
    }

    setIsHydrated(true);
  }, [router]);

  const handleSaveProfile = async () => {
    const normalizedEmail = email.trim().toLowerCase();

    if (!name.trim()) {
      setErrorMessage("Name is required.");
      setSuccessMessage("");
      return;
    }

    if (!country.trim()) {
      setErrorMessage("Country is required.");
      setSuccessMessage("");
      return;
    }

    if (!isValidEmail(normalizedEmail)) {
      setErrorMessage("Please enter a valid email.");
      setSuccessMessage("");
      return;
    }

    if (typeof window === "undefined") return;

    const currentEmail =
      window.localStorage.getItem("tripsense_is_authenticated") === "1"
        ? window.localStorage.getItem("tripsense_user_email")?.trim().toLowerCase() || ""
        : "";

    try {
      setErrorMessage("");
      setSuccessMessage("");
      setIsSavingProfile(true);

      if (!currentEmail) {
        throw new Error("Session expired. Please sign in again.");
      }

      const response = await fetch("/api/auth/account", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          currentEmail,
          newEmail: normalizedEmail,
          name: name.trim(),
          country: country.trim()
        })
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result?.details || result?.error || "Could not save profile.");
      }

      window.localStorage.setItem("tripsense_user_email", normalizedEmail);
      window.localStorage.setItem("tripsense_user_name", name.trim());
      window.localStorage.setItem("tripsense_user_country", country.trim());
      window.dispatchEvent(new Event("tripsense-auth-changed"));

      setSuccessMessage("Profile updated successfully.");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Could not save profile."
      );
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSaveDefaults = () => {
    if (typeof window === "undefined") return;

    try {
      setErrorMessage("");
      setSuccessMessage("");
      setIsSavingDefaults(true);
      window.localStorage.setItem("tripsense_travel_defaults", JSON.stringify(defaults));
      setSuccessMessage("Travel defaults saved.");
    } finally {
      setIsSavingDefaults(false);
    }
  };

  const handleChangePassword = async () => {
    if (!email.trim()) {
      setErrorMessage("No account found. Please sign in again.");
      setSuccessMessage("");
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setErrorMessage("New password must be at least 6 characters.");
      setSuccessMessage("");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setErrorMessage("New password and confirm password do not match.");
      setSuccessMessage("");
      return;
    }

    try {
      setIsChangingPassword(true);
      setErrorMessage("");
      setSuccessMessage("");

      const response = await fetch("/api/auth/account", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          currentPassword,
          newPassword
        })
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result?.details || result?.error || "Could not change password.");
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      setSuccessMessage("Password changed successfully.");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Could not change password."
      );
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("tripsense_user_email");
      window.localStorage.removeItem("tripsense_user_name");
      window.localStorage.removeItem("tripsense_user_country");
      window.localStorage.removeItem("tripsense_is_authenticated");
      window.dispatchEvent(new Event("tripsense-auth-changed"));
    }
    router.push("/login");
  };

  const handleDeleteAccount = async () => {
    if (typeof window === "undefined") return;

    const shouldDelete = window.confirm(
      "Delete your account permanently? This will remove your saved trips."
    );
    if (!shouldDelete) return;

    try {
      setErrorMessage("");
      setSuccessMessage("");
      setIsDeleting(true);

      const response = await fetch("/api/auth/account", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email })
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result?.details || result?.error || "Could not delete account.");
      }

      window.localStorage.removeItem("tripsense_user_email");
      window.localStorage.removeItem("tripsense_user_name");
      window.localStorage.removeItem("tripsense_user_country");
      window.localStorage.removeItem("tripsense_is_authenticated");
      window.localStorage.removeItem("tripsense_last_trip_id");
      window.dispatchEvent(new Event("tripsense-auth-changed"));

      router.push("/login");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Could not delete account."
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleVibe = (vibe: string) => {
    setDefaults((prev) => {
      const exists = prev.vibe.includes(vibe);
      const nextVibe = exists
        ? prev.vibe.filter((item) => item !== vibe)
        : [...prev.vibe, vibe];

      return {
        ...prev,
        vibe: nextVibe.length > 0 ? nextVibe : [vibe]
      };
    });
  };

  if (!isHydrated) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 px-4 py-24">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-2xl border border-white/70 bg-white/90 p-6 shadow-sm">
            <p className="text-sm font-semibold text-slate-600">
              Loading account settings...
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 px-4 py-24">
      <div className="mx-auto max-w-3xl">
        <header className="mb-6">
          <h1 className="text-3xl font-extrabold text-slate-800">Account Settings</h1>
        </header>

        <div className="mb-6 flex gap-6 border-b border-slate-200">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;

            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => {
                  setActiveTab(tab.key);
                  setErrorMessage("");
                  setSuccessMessage("");
                }}
                className={`-mb-px border-b-2 pb-2 text-sm font-semibold transition ${
                  isActive
                    ? "border-slate-800 text-slate-800"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {successMessage ? (
          <p className="mb-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
            {successMessage}
          </p>
        ) : null}

        {errorMessage ? (
          <p className="mb-4 rounded-xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
            {errorMessage}
          </p>
        ) : null}

        {activeTab === "profile" ? (
          <section className="rounded-2xl border border-white/70 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-700">
                <User size={28} />
              </div>
              <div>
                <p className="text-lg font-bold text-slate-800">{name || "Traveler"}</p>
                <p className="text-sm text-slate-500">Avatar: {userInitial}</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Name</label>
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Email</label>
                <input
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-sm font-semibold text-slate-700">Country</label>
                <input
                  value={country}
                  onChange={(event) => setCountry(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                void handleSaveProfile();
              }}
              disabled={isSavingProfile}
              className="mt-6 inline-flex items-center rounded-xl bg-slate-800 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSavingProfile ? "Saving..." : "Save Changes"}
            </button>
          </section>
        ) : null}

        {activeTab === "defaults" ? (
          <section className="rounded-2xl border border-white/70 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2 text-slate-700">
              <SlidersHorizontal size={16} />
              <p className="text-sm font-semibold">Set your preferred trip defaults</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Budget Tier</label>
                <select
                  value={defaults.budgetTier}
                  onChange={(event) =>
                    setDefaults((prev) => ({ ...prev, budgetTier: event.target.value }))
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                >
                  {budgetOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Travel Group</label>
                <select
                  value={defaults.travelGroup}
                  onChange={(event) =>
                    setDefaults((prev) => ({ ...prev, travelGroup: event.target.value }))
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                >
                  {travelerOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-5">
              <p className="mb-2 text-sm font-semibold text-slate-700">Preferred Vibes</p>
              <div className="flex flex-wrap gap-2">
                {vibeOptions.map((vibe) => {
                  const isSelected = defaults.vibe.includes(vibe);

                  return (
                    <button
                      key={vibe}
                      type="button"
                      onClick={() => toggleVibe(vibe)}
                      className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                        isSelected
                          ? "border-slate-800 bg-slate-800 text-white"
                          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      {vibe}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="button"
              onClick={handleSaveDefaults}
              disabled={isSavingDefaults}
              className="mt-6 inline-flex items-center rounded-xl bg-slate-800 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSavingDefaults ? "Saving..." : "Save Changes"}
            </button>
          </section>
        ) : null}

        {activeTab === "security" ? (
          <section className="space-y-4">
            <div className="rounded-2xl border border-white/70 bg-white p-6 shadow-sm">
              <h2 className="text-base font-bold text-slate-800">Change Password</h2>
              <p className="mt-1 text-sm text-slate-500">
                Use a strong password with at least 6 characters.
              </p>

              <div className="mt-4 grid gap-3">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      value={currentPassword}
                      onChange={(event) => setCurrentPassword(event.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 pr-16 text-sm text-slate-800 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword((prev) => !prev)}
                      className="absolute inset-y-0 right-0 px-3 text-xs font-semibold text-slate-600 hover:text-slate-800"
                    >
                      {showCurrentPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">New Password</label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(event) => setNewPassword(event.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 pr-16 text-sm text-slate-800 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword((prev) => !prev)}
                      className="absolute inset-y-0 right-0 px-3 text-xs font-semibold text-slate-600 hover:text-slate-800"
                    >
                      {showNewPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmNewPassword}
                      onChange={(event) => setConfirmNewPassword(event.target.value)}
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
              </div>

              <button
                type="button"
                onClick={() => {
                  void handleChangePassword();
                }}
                disabled={isChangingPassword}
                className="mt-4 inline-flex items-center rounded-xl bg-slate-800 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isChangingPassword ? "Updating..." : "Update Password"}
              </button>
            </div>

            <div className="rounded-2xl border border-white/70 bg-white p-6 shadow-sm">
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <LogOut size={16} />
                Log Out
              </button>
            </div>

            <div className="rounded-2xl border border-rose-300 bg-rose-50/70 p-6 shadow-sm">
              <div className="mb-3 flex items-center gap-2 text-rose-700">
                <ShieldAlert size={16} />
                <p className="text-sm font-bold">Danger Zone</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  void handleDeleteAccount();
                }}
                disabled={isDeleting}
                className="inline-flex items-center gap-2 rounded-xl border border-rose-300 bg-white px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <Trash2 size={16} />
                {isDeleting ? "Deleting..." : "Delete Account"}
              </button>
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}
