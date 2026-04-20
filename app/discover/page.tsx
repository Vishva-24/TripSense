import Link from "next/link";
import { Compass, Sparkles } from "lucide-react";
import { discoverTrips } from "@/lib/discoverTrips";

export default function DiscoverPage() {
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
          <Link
            key={trip.slug}
            href={`/discover/${trip.slug}`}
            className="group overflow-hidden rounded-[28px] border border-white/60 bg-white/75 shadow-sm backdrop-blur-xl transition duration-200 hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="relative h-52 overflow-hidden bg-app-sky">
              <img
                src={trip.image}
                alt={trip.title}
                className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/65 via-slate-900/10 to-transparent" />
              <span
                className={`absolute left-4 top-4 rounded-full px-3 py-1 text-xs font-semibold ${trip.badgeClass}`}
              >
                {trip.persona}
              </span>
            </div>

            <div className="space-y-2 p-5">
              <h2 className="text-xl font-bold text-app-slate">
                {trip.title} ({trip.duration})
              </h2>
              <p className="text-sm font-semibold text-slate-600">
                Vibe: {trip.vibe}
              </p>
              <p className="text-sm text-app-muted">
                Open the full preplanned itinerary and explore each day before you commit.
              </p>
            </div>
          </Link>
        ))}
      </section>
    </main>
  );
}
