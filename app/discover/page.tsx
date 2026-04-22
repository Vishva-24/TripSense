"use client";

import { useRouter } from "next/navigation";
import { Compass, Sparkles } from "lucide-react";
import { discoverTrips } from "@/lib/discoverTrips";
import { TrailCard } from "@/components/ui/trail-card";

export default function DiscoverPage() {
  const router = useRouter();

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-12">
      <section className="rounded-[32px] border border-white/60 bg-white/70 p-6 shadow-sm backdrop-blur-xl md:p-8">
        <p className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.22em] text-app-muted">
          <Compass size={16} />
          Discover
        </p>
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-app-slate md:text-4xl">
              Discover Your Next Adventure
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-app-muted md:text-base">
              Browse 30+ pre-generated itineraries curated by our AI.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-app-border bg-white/80 px-4 py-2 text-sm font-semibold text-app-slate">
            <Sparkles size={16} />
            {discoverTrips.length} curated ideas ready to explore
          </div>
        </div>
      </section>

      <section className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {discoverTrips.map((trip) => (
          <TrailCard
            key={trip.slug}
            className="max-w-none rounded-[28px] border border-white/60 bg-white/75 shadow-sm backdrop-blur-xl"
            imageUrl={trip.image}
            title={trip.title}
            location={`${trip.location} • ${trip.duration}`}
            difficulty={trip.vibe}
            creators={`Persona: ${trip.persona}`}
            stats={[
              { label: "Length", value: trip.duration },
              { label: "Days", value: String(trip.days.length) },
              { label: "Access", value: "Preview" }
            ]}
            badge={
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold shadow-sm ${trip.badgeClass}`}
              >
                {trip.persona}
              </span>
            }
            actionLabel="Open itinerary"
            onDirectionsClick={() => router.push(`/discover/${trip.slug}`)}
            onClick={() => router.push(`/discover/${trip.slug}`)}
            role="button"
            tabIndex={0}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                router.push(`/discover/${trip.slug}`);
              }
            }}
          />
        ))}
      </section>
    </main>
  );
}
