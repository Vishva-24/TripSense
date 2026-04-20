"use client";

import Link from "next/link";
import { Compass, UserCircle2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type NavbarProps = {
  isLoggedIn?: boolean;
  userInitial?: string;
};

export default function Navbar({
  isLoggedIn: isLoggedInProp,
  userInitial: userInitialProp
}: NavbarProps) {
  const [isClientLoggedIn, setIsClientLoggedIn] = useState(false);
  const [clientInitial, setClientInitial] = useState("U");

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const syncAuthState = () => {
      const storedEmail = window.localStorage.getItem("tripsense_user_email") || "";
      let isAuthenticated =
        window.localStorage.getItem("tripsense_is_authenticated") === "1";

      if (
        !isAuthenticated &&
        storedEmail.trim() &&
        !/@tripsense\.local$/i.test(storedEmail.trim())
      ) {
        window.localStorage.setItem("tripsense_is_authenticated", "1");
        isAuthenticated = true;
      }

      if (!isAuthenticated && /@tripsense\.local$/i.test(storedEmail.trim())) {
        window.localStorage.removeItem("tripsense_user_email");
        window.localStorage.removeItem("tripsense_user_name");
        window.localStorage.removeItem("tripsense_user_country");
      }

      const nextLoggedIn = isAuthenticated && storedEmail.trim().length > 0;
      setIsClientLoggedIn(nextLoggedIn);

      if (nextLoggedIn) {
        const storedName = window.localStorage.getItem("tripsense_user_name") || "";
        const seed = storedName.trim() || storedEmail.trim();
        const initial = seed.charAt(0).toUpperCase() || "U";
        setClientInitial(initial);
      } else {
        setClientInitial("U");
      }
    };

    syncAuthState();
    window.addEventListener("storage", syncAuthState);
    window.addEventListener("tripsense-auth-changed", syncAuthState);

    return () => {
      window.removeEventListener("storage", syncAuthState);
      window.removeEventListener("tripsense-auth-changed", syncAuthState);
    };
  }, []);

  const isLoggedIn = isLoggedInProp ?? isClientLoggedIn;
  const userInitial = useMemo(() => {
    if (userInitialProp && userInitialProp.trim()) {
      return userInitialProp.trim().charAt(0).toUpperCase();
    }

    return clientInitial;
  }, [clientInitial, userInitialProp]);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/40 bg-white/30 backdrop-blur-md">
      <nav className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-5">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-lg font-extrabold text-slate-800"
          >
            <Compass size={18} className="text-slate-700" />
            <span>TripSense</span>
          </Link>

          <Link
            href="/discover"
            className="text-sm font-medium text-slate-600 transition hover:text-slate-900"
          >
            Discover
          </Link>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          <Link
            href="/trips"
            className="inline-flex items-center rounded-full border border-slate-300/70 bg-white/70 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-white"
          >
            My Trips
          </Link>

          {isLoggedIn ? (
            <Link
              href="/account"
              aria-label="User profile"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/70 bg-white/75 text-sm font-bold text-slate-800 shadow-sm"
            >
              <span className="sr-only">Open profile</span>
              {userInitial || <UserCircle2 size={18} />}
            </Link>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center rounded-full bg-slate-800 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              Log In / Sign Up
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
