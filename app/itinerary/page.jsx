"use client";

import { useEffect, useState } from "react";
import ItineraryExperience from "@/components/ItineraryExperience";

export default function LegacyItineraryPage() {
  const [tripId, setTripId] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    setTripId(params.get("tripId") || "");
  }, []);

  return <ItineraryExperience tripId={tripId} allowFallbackToLastTrip />;
}
