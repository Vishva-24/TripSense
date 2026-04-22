"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Clock3,
  Compass,
  MapPinned,
  PlaneTakeoff,
  Route,
  Sparkles,
  Users,
  Wand2
} from "lucide-react";
import { SparklesCore } from "@/components/ui/sparkles";
import { CinematicFooter } from "@/components/ui/motion-footer";
import { Globe } from "@/components/ui/cobe-globe";

const starterPaths = [
  {
    title: "Blank planner",
    href: "/plan",
    description: "You already know the destination. TripSense handles the structure.",
    icon: PlaneTakeoff,
    tone: "from-slate-900 to-slate-700 text-white"
  },
  {
    title: "Discover routes",
    href: "/discover",
    description: "Browse polished city templates and spin them into your own version.",
    icon: MapPinned,
    tone: "from-sky-100 to-white text-slate-800"
  },
  {
    title: "Persona lab",
    href: "/persona",
    description: "Swipe through moods and let your next destination emerge first.",
    icon: Sparkles,
    tone: "from-amber-100 to-white text-slate-800"
  }
];

const showcaseTrips = [
  {
    title: "Tokyo After Dark",
    subtitle: "Neon & noodles itinerary",
    imageUrl:
      "https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=1200&q=80",
    note: "Built from persona + Discover overlap"
  },
  {
    title: "Kerala Slow Escape",
    subtitle: "Houseboat + wellness rhythm",
    imageUrl:
      "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1200&q=80",
    note: "AI filled the in-between moments"
  },
  {
    title: "Monaco Late Summer",
    subtitle: "Luxury nights, Riviera days",
    imageUrl:
      "https://images.unsplash.com/photo-1505764706515-aa95265c5abc?auto=format&fit=crop&w=1200&q=80",
    note: "Preplanned route turned custom"
  }
];

const itinerarySignals = [
  {
    time: "08:40",
    title: "Arrival + city transfer",
    detail: "We don’t leave the first hours blank. Check-in, transit, and pacing are part of the plan.",
    accent: "bg-sky-50 text-sky-700 border-sky-200"
  },
  {
    time: "11:30",
    title: "Anchor experience",
    detail: "Every day is built around one magnetic stop that defines the story of the route.",
    accent: "bg-amber-50 text-amber-700 border-amber-200"
  },
  {
    time: "15:10",
    title: "Gap-filling discovery",
    detail: "TripSense adds local meals, nearby detours, and low-friction transitions between headline moments.",
    accent: "bg-emerald-50 text-emerald-700 border-emerald-200"
  },
  {
    time: "19:45",
    title: "Evening energy",
    detail: "Night plans shift to match your mood: calm, culture-heavy, foodie, social, or luxe.",
    accent: "bg-rose-50 text-rose-700 border-rose-200"
  }
];

const experiencePillars = [
  {
    title: "Trips with rhythm",
    description: "Not just a list of places. A route with momentum, spacing, and breathing room.",
    icon: Clock3
  },
  {
    title: "Curated but editable",
    description: "Start from a strong draft, then keep swapping and refining until it feels like yours.",
    icon: Wand2
  },
  {
    title: "Built for real travelers",
    description: "Maps, timing, saved trips, utilities, and account continuity all live in one system.",
    icon: Users
  }
];

const routeMarkers = [
  { id: "tokyo", location: [35.6762, 139.6503] as [number, number], label: "Tokyo" },
  { id: "singapore", location: [1.3521, 103.8198] as [number, number], label: "Singapore" },
  { id: "new-york", location: [40.7128, -74.006] as [number, number], label: "New York" },
  { id: "kochi", location: [9.9312, 76.2673] as [number, number], label: "Kochi" },
  { id: "rome", location: [41.9028, 12.4964] as [number, number], label: "Rome" },
  { id: "monaco", location: [43.7384, 7.4246] as [number, number], label: "Monaco" }
];

const routeArcs = [
  {
    id: "nyc-tokyo",
    from: [40.7128, -74.006] as [number, number],
    to: [35.6762, 139.6503] as [number, number],
    label: "Urban route"
  },
  {
    id: "singapore-kochi",
    from: [1.3521, 103.8198] as [number, number],
    to: [9.9312, 76.2673] as [number, number],
    label: "Zen flow"
  },
  {
    id: "rome-monaco",
    from: [41.9028, 12.4964] as [number, number],
    to: [43.7384, 7.4246] as [number, number],
    label: "Luxe crossover"
  }
];

const globeHighlights = [
  {
    title: "One engine, many entry points",
    description: "Blank planner, persona swipes, and Discover routes all feed into the same itinerary builder."
  },
  {
    title: "Routes stay alive",
    description: "TripSense keeps layering meals, check-ins, and transitions so the path feels usable after the headline stops."
  },
  {
    title: "Global by default",
    description: "From Tokyo nights to Kerala slow days, the system adapts the rhythm while keeping the travel logic tight."
  }
];

export default function HomePage() {
  return (
    <div className="bg-background text-foreground">
      <main className="relative z-10 overflow-hidden rounded-b-[2.5rem] border-b border-white/50 bg-gradient-to-br from-blue-50 via-sky-50 to-blue-100 shadow-[0_40px_80px_-40px_rgba(15,23,42,0.35)]">
        <section className="relative isolate overflow-hidden px-4 pb-14 pt-10 md:px-6 md:pb-20 md:pt-14">
          <div className="pointer-events-none absolute inset-0 opacity-70">
            <SparklesCore
              id="tripsense-home-sparkles"
              background="transparent"
              minSize={0.4}
              maxSize={1.3}
              speed={0.8}
              particleDensity={110}
              particleColor="#94a3b8"
              className="h-full w-full"
            />
          </div>

          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(125,211,252,0.35),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(251,191,36,0.2),transparent_24%)]" />

          <div className="relative mx-auto max-w-6xl">
            <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55 }}
                className="pt-4"
              >
                <div className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/75 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-slate-600 shadow-sm backdrop-blur-sm">
                  <Compass size={14} className="text-slate-700" />
                  Wanderlust Modern
                </div>

                <h1 className="mt-6 max-w-4xl text-4xl font-extrabold leading-[0.95] text-slate-900 md:text-6xl xl:text-[5.8rem]">
                  Trips with atmosphere,
                  <br />
                  not empty time slots.
                </h1>

                <p className="mt-6 max-w-2xl text-base leading-8 text-slate-600 md:text-lg">
                  TripSense turns destinations, moods, and must-dos into AI-curated itineraries that feel designed.
                  Start from a blank brief, a polished route, or a swipe-led persona and let the platform shape the full journey around it.
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Link
                    href="/plan"
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-800"
                  >
                    Start a trip
                    <ArrowRight size={16} />
                  </Link>
                  <Link
                    href="/discover"
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-300 bg-white/85 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-white"
                  >
                    Explore Discover
                  </Link>
                </div>

                <div className="mt-10 grid gap-3 md:grid-cols-3">
                  {starterPaths.map((path, index) => {
                    const Icon = path.icon;
                    return (
                      <motion.div
                        key={path.title}
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.45, delay: 0.08 * index + 0.16 }}
                      >
                        <Link
                          href={path.href}
                          className={`block rounded-[1.5rem] border border-white/75 bg-gradient-to-br ${path.tone} p-4 shadow-sm backdrop-blur-sm transition hover:-translate-y-1`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-lg font-bold">{path.title}</p>
                              <p className="mt-2 text-sm leading-6 opacity-80">{path.description}</p>
                            </div>
                            <div className="rounded-2xl bg-white/20 p-3 backdrop-blur-sm">
                              <Icon size={18} />
                            </div>
                          </div>
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 32 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65, delay: 0.1 }}
                className="relative"
              >
                <div className="grid gap-4 md:grid-cols-[1.02fr_0.98fr]">
                  <article className="overflow-hidden rounded-[2rem] border border-white/75 bg-white/85 shadow-[0_24px_60px_-32px_rgba(15,23,42,0.45)] backdrop-blur-sm">
                    <div className="relative h-72 md:h-full min-h-[24rem]">
                      <img
                        src={showcaseTrips[0].imageUrl}
                        alt={showcaseTrips[0].title}
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/10 to-transparent" />
                      <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/70">Featured route</p>
                        <h2 className="mt-3 text-3xl font-extrabold leading-tight">{showcaseTrips[0].title}</h2>
                        <p className="mt-2 text-sm text-white/80">{showcaseTrips[0].subtitle}</p>
                        <p className="mt-4 inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
                          {showcaseTrips[0].note}
                        </p>
                      </div>
                    </div>
                  </article>

                  <div className="flex flex-col gap-4">
                    {showcaseTrips.slice(1).map((trip, index) => (
                      <article
                        key={trip.title}
                        className="overflow-hidden rounded-[1.75rem] border border-white/75 bg-white/82 shadow-sm backdrop-blur-sm"
                      >
                        <div className="grid min-h-[12rem] md:grid-cols-[0.9fr_1.1fr]">
                          <img src={trip.imageUrl} alt={trip.title} className="h-full w-full object-cover" />
                          <div className="flex flex-col justify-between p-4">
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                                Route {index + 2}
                              </p>
                              <h3 className="mt-2 text-xl font-bold text-slate-900">{trip.title}</h3>
                              <p className="mt-2 text-sm text-slate-600">{trip.subtitle}</p>
                            </div>
                            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                              {trip.note}
                            </p>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        <section className="px-4 pb-10 md:px-6 md:pb-14">
          <div className="mx-auto grid max-w-6xl gap-4 xl:grid-cols-[0.9fr_1.1fr]">
            <motion.article
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.45 }}
              className="rounded-[2rem] border border-slate-200/70 bg-slate-900 p-6 text-white shadow-[0_24px_60px_-36px_rgba(15,23,42,0.8)]"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Why it feels different</p>
              <h2 className="mt-4 text-3xl font-bold leading-tight">
                The AI handles the middle of the day too.
              </h2>
              <p className="mt-4 text-sm leading-7 text-slate-300">
                Most planners stop after naming the headline stops. TripSense fills in the transit, meals,
                check-ins, and nearby discoveries that make a trip feel usable in real life.
              </p>

              <div className="mt-8 space-y-3">
                {itinerarySignals.map((item) => (
                  <div key={item.time} className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                    <div className="flex items-start gap-3">
                      <div className={`rounded-xl border px-3 py-2 text-xs font-bold ${item.accent}`}>
                        {item.time}
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-white">{item.title}</h3>
                        <p className="mt-2 text-sm leading-6 text-slate-300">{item.detail}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.article>

            <motion.article
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.45, delay: 0.08 }}
              className="rounded-[2rem] border border-white/75 bg-white/82 p-5 shadow-sm backdrop-blur-sm md:p-6"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="max-w-2xl">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">The network behind the route</p>
                  <h2 className="mt-3 text-2xl font-bold leading-tight text-slate-900 md:text-3xl">
                    Replace dead air with connected, globe-aware planning.
                  </h2>
                  <p className="mt-3 text-sm leading-7 text-slate-600 md:text-base">
                    Instead of leaving the right side empty, TripSense can show how city templates, persona picks, and custom edits all move through one travel system.
                  </p>
                </div>

                <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">
                  <Route size={14} className="text-slate-800" />
                  Live route map
                </div>
              </div>

              <div className="mt-6 grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(17rem,0.9fr)] xl:items-center">
                <div className="relative overflow-hidden rounded-[1.75rem] border border-slate-200/80 bg-gradient-to-br from-sky-50 via-white to-amber-50 p-4 shadow-inner">
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(125,211,252,0.28),transparent_26%),radial-gradient(circle_at_bottom_right,rgba(251,191,36,0.18),transparent_24%)]" />

                  <Globe
                    className="relative mx-auto w-full max-w-[30rem]"
                    markers={routeMarkers}
                    arcs={routeArcs}
                    markerColor={[0.22, 0.43, 0.86]}
                    arcColor={[0.96, 0.69, 0.24]}
                    glowColor={[0.96, 0.95, 0.92]}
                    baseColor={[0.99, 0.99, 1]}
                    mapBrightness={7}
                    markerSize={0.055}
                    markerElevation={0.09}
                    arcWidth={0.85}
                    arcHeight={0.2}
                    speed={0.0028}
                  />

                  <div className="relative mt-4 flex flex-wrap gap-2">
                    {routeMarkers.map((marker) => (
                      <span
                        key={marker.id}
                        className="rounded-full border border-slate-200/80 bg-white/85 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600 shadow-sm"
                      >
                        {marker.label}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  {globeHighlights.map((highlight, index) => (
                    <div
                      key={highlight.title}
                      className="rounded-[1.35rem] border border-slate-200/75 bg-slate-50/75 p-4 shadow-sm"
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-sm font-bold text-slate-700 shadow-sm">
                          0{index + 1}
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-slate-900">{highlight.title}</h3>
                          <p className="mt-2 text-sm leading-6 text-slate-600">{highlight.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-3">
                {experiencePillars.map((pillar) => {
                  const Icon = pillar.icon;
                  return (
                    <div
                      key={pillar.title}
                      className="rounded-[1.35rem] border border-slate-200/75 bg-white/88 p-4 shadow-sm"
                    >
                      <div className="inline-flex rounded-2xl bg-slate-100 p-3 text-slate-800">
                        <Icon size={18} />
                      </div>
                      <h3 className="mt-3 text-lg font-bold text-slate-900">{pillar.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-slate-600">{pillar.description}</p>
                    </div>
                  );
                })}
              </div>
            </motion.article>
          </div>
        </section>
      </main>

      <CinematicFooter />
    </div>
  );
}

