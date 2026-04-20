import Link from "next/link";
import { ArrowLeft, Compass, Sparkles } from "lucide-react";
import { notFound } from "next/navigation";
import { discoverTrips, getDiscoverTripBySlug } from "@/lib/discoverTrips";
import DiscoverTripCreateButton from "@/components/DiscoverTripCreateButton";

type DiscoverTripPageProps = {
  params: {
    slug: string;
  };
};

export function generateStaticParams() {
  return discoverTrips.map((trip) => ({
    slug: trip.slug
  }));
}

export default function DiscoverTripPage({ params }: DiscoverTripPageProps) {
  const trip = getDiscoverTripBySlug(params.slug);

  if (!trip) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-12">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/discover"
          className="inline-flex items-center gap-2 rounded-full border border-app-border bg-white/80 px-4 py-2 text-sm font-semibold text-app-slate transition hover:bg-white"
        >
          <ArrowLeft size={16} />
          Back to Discover
        </Link>

        <div className="inline-flex items-center gap-2 rounded-full border border-app-border bg-white/80 px-4 py-2 text-sm font-semibold text-app-slate">
          <Sparkles size={16} />
          Preplanned AI-curated itinerary
        </div>
      </div>

      <section className="overflow-hidden rounded-[32px] border border-white/60 bg-white/75 shadow-sm backdrop-blur-xl">
        <div className="relative h-72 overflow-hidden md:h-96">
          <img
            src={trip.image}
            alt={trip.title}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-900/25 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
            <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-white/80">
              <Compass size={14} />
              Discover
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${trip.badgeClass}`}
              >
                {trip.persona}
              </span>
              <span className="rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
                {trip.duration}
              </span>
            </div>
            <h1 className="mt-4 text-3xl font-extrabold text-white md:text-5xl">
              {trip.title}
            </h1>
            <p className="mt-2 text-sm font-semibold text-sky-100 md:text-base">
              Vibe: {trip.vibe}
            </p>
          </div>
        </div>

        <div className="grid gap-6 p-6 md:grid-cols-[280px_minmax(0,1fr)] md:p-8">
          <aside className="space-y-4 rounded-[28px] border border-app-border bg-app-sky/45 p-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-app-muted">
                Trip Summary
              </p>
              <h2 className="mt-2 text-2xl font-bold text-app-slate">
                {trip.title}
              </h2>
              <p className="mt-1 text-sm text-app-muted">{trip.location}</p>
            </div>

            <div className="space-y-3 text-sm text-app-muted">
              <p>
                <span className="font-semibold text-app-slate">Persona:</span>{" "}
                {trip.persona}
              </p>
              <p>
                <span className="font-semibold text-app-slate">Vibe:</span>{" "}
                {trip.vibe}
              </p>
              <p>
                <span className="font-semibold text-app-slate">Length:</span>{" "}
                {trip.duration}
              </p>
              <p>
                <span className="font-semibold text-app-slate">Plan Type:</span>{" "}
                Fixed preplanned itinerary
              </p>
            </div>

            <div className="rounded-2xl border border-white/60 bg-white/80 p-4">
              <p className="text-sm font-semibold text-app-slate">
                This keeps the curated route and turns it into your own saved trip.
              </p>
              <p className="mt-2 text-sm text-app-muted">
                TripSense will create an editable copy of this itinerary so you can open it in your timeline, tweak activities, and keep the original inspiration.
              </p>
            </div>

            <DiscoverTripCreateButton slug={trip.slug} />
          </aside>

          <section className="space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-app-muted">
                Full Itinerary
              </p>
              <h2 className="mt-2 text-2xl font-bold text-app-slate">
                Day-by-day plan
              </h2>
              <p className="mt-1 text-sm text-app-muted">
                A fully preplanned route you can browse before deciding on your own custom build.
              </p>
            </div>

            <div className="space-y-4">
              {trip.days.map((day) => (
                <article
                  key={day.day}
                  className="rounded-[28px] border border-app-border bg-white p-5 shadow-sm"
                >
                  <div className="mb-3 inline-flex rounded-full bg-app-sandSoft px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-app-slate">
                    Day {day.day}
                  </div>
                  <h3 className="text-xl font-bold text-app-slate">{day.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-app-muted">
                    {day.description}
                  </p>
                </article>
              ))}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
