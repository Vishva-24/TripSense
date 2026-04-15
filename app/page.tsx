"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, MapPinned, Sparkles, X } from "lucide-react";
import { motion, useAnimationControls, useMotionValue, useTransform } from "framer-motion";

type TravelTag =
  | "Urban"
  | "Foodie"
  | "Relaxation"
  | "Nature"
  | "History"
  | "Culture"
  | "Adventure"
  | "Party"
  | "Luxury";

type SwipeDirection = "left" | "right";

type TagScores = Record<TravelTag, number>;

type SwipeCardItem = {
  id: number;
  title: string;
  imageUrl: string;
  tags: TravelTag[];
};

type PersonaKey = "concrete" | "zen" | "time" | "thrill" | "high";

type PersonaResult = {
  key: PersonaKey;
  persona: string;
  highestTag: TravelTag;
};

type PersonaDestination = {
  city: string;
  country: string;
  description: string;
};

const INITIAL_SCORES: TagScores = {
  Urban: 0,
  Foodie: 0,
  Relaxation: 0,
  Nature: 0,
  History: 0,
  Culture: 0,
  Adventure: 0,
  Party: 0,
  Luxury: 0
};

const SWIPE_THRESHOLD = 120;
const FALLBACK_CARD_IMAGE =
  "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1400&q=80";

const CARD_DATA: SwipeCardItem[] = [
  {
    id: 1,
    title: "The Neon Culinary Scene",
    tags: ["Urban", "Foodie"],
    imageUrl:
      "https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=1400&q=80"
  },
  {
    id: 2,
    title: "The Ultimate Unplug",
    tags: ["Relaxation", "Luxury"],
    imageUrl:
      "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=1400&q=80"
  },
  {
    id: 3,
    title: "The Epic Heritage",
    tags: ["History", "Culture"],
    imageUrl:
      "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1400&q=80"
  },
  {
    id: 4,
    title: "The Adrenaline Rush",
    tags: ["Adventure", "Nature"],
    imageUrl:
      "https://images.unsplash.com/photo-1501555088652-021faa106b9b?auto=format&fit=crop&w=1400&q=80"
  },
  {
    id: 5,
    title: "The VIP Social Scene",
    tags: ["Party", "Luxury"],
    imageUrl:
      "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=1400&q=80"
  }
];

const PERSONA_DESTINATIONS: Record<
  PersonaKey,
  { summary: string; locations: PersonaDestination[] }
> = {
  concrete: {
    summary:
      "Urban energy, fast transit, and legendary street food scenes.",
    locations: [
      {
        city: "Singapore",
        country: "Singapore",
        description:
          "The ultimate blend of the future and flavor, from Supertree Grove to Michelin-level hawker food at Maxwell."
      },
      {
        city: "Tokyo",
        country: "Japan",
        description:
          "The ultimate neon metropolis with ramen alleys, futuristic tech, and giant crossings."
      },
      {
        city: "New York City",
        country: "USA",
        description:
          "The city that never sleeps with dollar pizza, Broadway, hidden speakeasies, and nonstop motion."
      },
      {
        city: "Mexico City",
        country: "Mexico",
        description:
          "A vibrant mega-city known for tacos al pastor, bustling markets, and modern art."
      },
      {
        city: "Seoul",
        country: "South Korea",
        description:
          "Hyper-modern infrastructure, night markets, Korean BBQ, K-pop culture, and late shopping."
      },
      {
        city: "Taipei",
        country: "Taiwan",
        description:
          "Night-market paradise where street food is part of everyday city life."
      }
    ]
  },
  zen: {
    summary:
      "Slow living, spa culture, and peaceful landscapes for full reset mode.",
    locations: [
      {
        city: "Kerala",
        country: "India",
        description:
          "God's Own Country, perfect for silent palm-lined backwaters and world-renowned Ayurvedic wellness retreats."
      },
      {
        city: "Ubud, Bali",
        country: "Indonesia",
        description:
          "Jungle calm, yoga retreats, quiet rice terraces, and health-focused cafes."
      },
      {
        city: "The Maldives",
        country: "Maldives",
        description:
          "Overwater bungalows, crystal water, and total private-island style relaxation."
      },
      {
        city: "Amalfi Coast",
        country: "Italy",
        description:
          "Slow Mediterranean rhythm with limoncello terraces and scenic boat rides."
      },
      {
        city: "Sedona",
        country: "USA",
        description:
          "Red rock views, spa retreats, and a calming spiritual atmosphere."
      },
      {
        city: "Hakone",
        country: "Japan",
        description:
          "Traditional ryokan stays and natural hot-spring onsen with mountain views."
      }
    ]
  },
  time: {
    summary:
      "Deep heritage, iconic architecture, and immersive historical storytelling.",
    locations: [
      {
        city: "Petra",
        country: "Jordan",
        description:
          "Walk through the dramatic Siq canyon and witness a 2,000-year-old city carved into rose-red cliffs."
      },
      {
        city: "Rome",
        country: "Italy",
        description:
          "The eternal city with the Colosseum, ancient streets, and layered imperial history."
      },
      {
        city: "Kyoto",
        country: "Japan",
        description:
          "Cultural heart of Japan with temples, shrines, and traditional tea houses."
      },
      {
        city: "Cusco",
        country: "Peru",
        description:
          "Historic Inca capital with colonial architecture and gateway access to Machu Picchu."
      },
      {
        city: "Istanbul",
        country: "Turkey",
        description:
          "A true crossroads city with grand mosques, cisterns, and the historic Grand Bazaar."
      },
      {
        city: "Cairo",
        country: "Egypt",
        description:
          "Pyramids of Giza, ancient bazaars, and timeless Nile-connected heritage."
      }
    ]
  },
  thrill: {
    summary:
      "Adrenaline-focused destinations built for active, high-intensity adventures.",
    locations: [
      {
        city: "Moab, Utah",
        country: "USA",
        description:
          "A red-rock playground for Slickrock mountain biking, hard-core off-roading, and epic desert adventure."
      },
      {
        city: "Queenstown",
        country: "New Zealand",
        description:
          "Adventure capital with bungee jumping, canyon swings, and jet boating."
      },
      {
        city: "Patagonia",
        country: "Chile/Argentina",
        description:
          "Serious trekking territory with glaciers, jagged peaks, and wild landscapes."
      },
      {
        city: "Reykjavik",
        country: "Iceland",
        description:
          "Fire-and-ice playground for cave exploration, volcano hikes, and rugged road trips."
      },
      {
        city: "Banff, Alberta",
        country: "Canada",
        description:
          "Rocky Mountain intensity with biking, alpine climbing, and backcountry skiing."
      },
      {
        city: "Interlaken",
        country: "Switzerland",
        description:
          "Premier Alps base for skydiving, paragliding, canyoning, and mountain action."
      }
    ]
  },
  high: {
    summary:
      "VIP nights, luxury stays, rooftop scenes, and high-energy social travel.",
    locations: [
      {
        city: "Monaco (Monte Carlo)",
        country: "Monaco",
        description:
          "The billionaire playground with black-tie casino nights, super-yachts, and peak Riviera exclusivity."
      },
      {
        city: "Dubai",
        country: "UAE",
        description:
          "Ultra-modern luxury with yachts, beach clubs, seven-star hotels, and mega malls."
      },
      {
        city: "Ibiza",
        country: "Spain",
        description:
          "Global nightlife capital with super-clubs, world-famous DJs, and yacht sunsets."
      },
      {
        city: "Miami",
        country: "USA",
        description:
          "South Beach luxury, exclusive pool parties, and vibrant late-night club culture."
      },
      {
        city: "Mykonos",
        country: "Greece",
        description:
          "Champagne beach clubs by day and cliffside dancing venues by night."
      },
      {
        city: "Las Vegas",
        country: "USA",
        description:
          "The ultimate adult playground with VIP tables, casino resorts, and private cabanas."
      }
    ]
  }
};

function applyLoveSwipe(scoreBoard: TagScores, tags: TravelTag[]): TagScores {
  const updated = { ...scoreBoard };
  tags.forEach((tag) => {
    updated[tag] += 2;
  });
  return updated;
}

function resolvePersona(scoreBoard: TagScores): PersonaResult {
  const entries = Object.entries(scoreBoard) as [TravelTag, number][];
  const [highestTag] = entries.reduce(
    (best, current) => (current[1] > best[1] ? current : best),
    entries[0]
  );

  if (highestTag === "Urban" || highestTag === "Foodie") {
    return {
      key: "concrete",
      persona: "The Concrete Jungle Explorer",
      highestTag
    };
  }

  if (highestTag === "Relaxation") {
    return {
      key: "zen",
      persona: "The Zen Seeker",
      highestTag
    };
  }

  if (highestTag === "History" || highestTag === "Culture") {
    return {
      key: "time",
      persona: "The Time Traveler",
      highestTag
    };
  }

  if (highestTag === "Adventure" || highestTag === "Nature") {
    return {
      key: "thrill",
      persona: "The Thrill Chaser",
      highestTag
    };
  }

  return {
    key: "high",
    persona: "The High-Roller",
    highestTag
  };
}

function derivePlannerVibes(scoreBoard: TagScores) {
  const sortedPositiveTags = (Object.entries(scoreBoard) as [TravelTag, number][])
    .filter(([, score]) => score > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([tag]) => tag);

  const resolvedTags =
    sortedPositiveTags.length > 0
      ? sortedPositiveTags
      : [resolvePersona(scoreBoard).highestTag];

  return Array.from(new Set(resolvedTags));
}

function deriveBudgetHint(highestTag: TravelTag) {
  if (highestTag === "Luxury" || highestTag === "Party") return "Luxury";
  if (highestTag === "Adventure") return "Standard";
  return "Standard";
}

export default function HomePage() {
  const router = useRouter();
  const [scores, setScores] = useState<TagScores>(INITIAL_SCORES);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isResultVisible, setIsResultVisible] = useState(false);
  const [personaResult, setPersonaResult] = useState<PersonaResult | null>(null);
  const [prefillVibes, setPrefillVibes] = useState<TravelTag[]>([]);
  const [prefillBudget, setPrefillBudget] = useState("Standard");
  const [isSwiping, setIsSwiping] = useState(false);
  const [isRoutingToPlanner, setIsRoutingToPlanner] = useState(false);
  const [imageStageById, setImageStageById] = useState<
    Record<number, "primary" | "fallback" | "none">
  >({});

  const controls = useAnimationControls();
  const dragX = useMotionValue(0);
  const cardRotate = useTransform(dragX, [-200, 0, 200], [-12, 0, 12]);
  const passBadgeOpacity = useTransform(dragX, [-160, -30, 0], [1, 0.6, 0]);
  const loveBadgeOpacity = useTransform(dragX, [0, 30, 160], [0, 0.6, 1]);

  const activeCard = CARD_DATA[currentIndex];
  const visibleCards = CARD_DATA.slice(currentIndex, currentIndex + 3);

  const resolveImageStage = (cardId: number) => imageStageById[cardId] || "primary";

  const resolveImageSource = (card: SwipeCardItem) => {
    const stage = resolveImageStage(card.id);
    if (stage === "fallback") return FALLBACK_CARD_IMAGE;
    if (stage === "none") return "";
    return card.imageUrl;
  };

  const markImageError = (cardId: number) => {
    setImageStageById((prev) => {
      const currentStage = prev[cardId] || "primary";
      if (currentStage === "primary") {
        return { ...prev, [cardId]: "fallback" };
      }
      if (currentStage === "fallback") {
        return { ...prev, [cardId]: "none" };
      }
      return prev;
    });
  };

  useEffect(() => {
    dragX.set(0);
    controls.set({ x: 0, opacity: 1, rotate: 0 });
  }, [controls, currentIndex, dragX]);

  const progressLabel = useMemo(
    () => `${Math.min(currentIndex + 1, CARD_DATA.length)} / ${CARD_DATA.length}`,
    [currentIndex]
  );

  const applySwipeResult = (direction: SwipeDirection, card: SwipeCardItem) => {
    const updatedScores =
      direction === "right" ? applyLoveSwipe(scores, card.tags) : { ...scores };

    if (direction === "right") {
      setScores(updatedScores);
    }

    const nextIndex = currentIndex + 1;
    if (nextIndex >= CARD_DATA.length) {
      const resolvedPersona = resolvePersona(updatedScores);
      setPersonaResult(resolvedPersona);
      setPrefillVibes(derivePlannerVibes(updatedScores));
      setPrefillBudget(deriveBudgetHint(resolvedPersona.highestTag));
      setIsResultVisible(true);
      return;
    }

    setCurrentIndex(nextIndex);
  };

  const triggerSwipe = async (direction: SwipeDirection) => {
    if (!activeCard || isSwiping || isResultVisible) return;

    setIsSwiping(true);
    const targetX = direction === "right" ? 420 : -420;
    const targetRotate = direction === "right" ? 14 : -14;

    await controls.start({
      x: targetX,
      opacity: 0,
      rotate: targetRotate,
      transition: { duration: 0.22, ease: "easeOut" }
    });

    applySwipeResult(direction, activeCard);
    setIsSwiping(false);
  };

  const goToPlannerWithPrefill = (destination: string) => {
    if (isRoutingToPlanner || !personaResult) return;
    setIsRoutingToPlanner(true);

    if (typeof window !== "undefined") {
      window.localStorage.setItem(
        "tripsense_persona_prefill",
        JSON.stringify({
          source: "persona-swipe",
          persona: personaResult.persona,
          budget: prefillBudget,
          vibe: prefillVibes,
          destination
        })
      );
    }

    router.push("/plan?source=persona-swipe");
  };

  if (isResultVisible && personaResult) {
    const recommendations = PERSONA_DESTINATIONS[personaResult.key];

    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 px-4 py-10">
        <div className="mx-auto max-w-6xl">
          <section className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-sm backdrop-blur-sm md:p-10">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">
              Travel Persona
            </p>
            <h1 className="mt-4 text-3xl font-extrabold text-slate-800 md:text-4xl">
              You are {personaResult.persona}
            </h1>
            <p className="mt-3 text-sm text-slate-600 md:text-base">
              {recommendations.summary}
            </p>
            <p className="mt-2 inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              <Sparkles size={14} />
              Pick a destination and continue with pre-filled trip options
            </p>

            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {recommendations.locations.map((location) => {
                const destinationValue = `${location.city}, ${location.country}`;

                return (
                  <article
                    key={destinationValue}
                    className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm"
                  >
                    <p className="text-lg font-bold text-slate-800">
                      {location.city}
                    </p>
                    <p className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-slate-500">
                      <MapPinned size={14} />
                      {location.country}
                    </p>
                    <p className="mt-3 text-sm text-slate-600">{location.description}</p>
                    <button
                      type="button"
                      onClick={() => goToPlannerWithPrefill(destinationValue)}
                      disabled={isRoutingToPlanner}
                      className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-slate-800 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {isRoutingToPlanner ? "Opening planner..." : "Plan This Destination"}
                    </button>
                  </article>
                );
              })}
            </div>

            <div className="mt-6 rounded-2xl border border-slate-200 bg-white/90 p-4 text-center">
              <p className="text-sm text-slate-600">
                Want to choose your own place instead?
              </p>
              <button
                type="button"
                onClick={() => goToPlannerWithPrefill("")}
                disabled={isRoutingToPlanner}
                className="mt-3 inline-flex items-center justify-center rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
              >
                Make My Own Trip
              </button>
            </div>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 px-4 py-10">
      <div className="mx-auto flex max-w-5xl flex-col items-center">
        <header className="mb-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Travel Persona Game
          </p>
          <h1 className="mt-2 text-3xl font-extrabold text-slate-800 md:text-4xl">
            Swipe To Find Your Perfect Travel Vibe
          </h1>
          <p className="mt-2 text-sm text-slate-600 md:text-base">
            Love it to boost matching tags, or pass and keep exploring.
          </p>
          <p className="mt-3 text-sm font-semibold text-slate-700">Card {progressLabel}</p>
        </header>

        <section className="relative w-full max-w-sm">
          <div className="relative h-[480px]">
            {visibleCards
              .slice()
              .reverse()
              .map((card, reverseIndex) => {
                const stackIndex = visibleCards.length - 1 - reverseIndex;
                const isTop = stackIndex === 0;
                const verticalOffset = stackIndex * 12;
                const scale = 1 - stackIndex * 0.03;
                const imageStage = resolveImageStage(card.id);
                const imageSrc = resolveImageSource(card);

                if (!isTop) {
                  return (
                    <div
                      key={card.id}
                      className="absolute inset-0"
                      style={{
                        transform: `translateY(${verticalOffset}px) scale(${scale})`,
                        zIndex: CARD_DATA.length - stackIndex
                      }}
                    >
                      <div className="h-full w-full overflow-hidden rounded-3xl border border-white/80 bg-gradient-to-br from-slate-200 to-slate-100 shadow-sm">
                        {imageStage !== "none" ? (
                          <img
                            src={imageSrc}
                            alt={card.title}
                            onError={() => markImageError(card.id)}
                            className="h-full w-full object-cover"
                          />
                        ) : null}
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-900/70 to-transparent p-5">
                          <h2 className="text-2xl font-bold text-white">{card.title}</h2>
                        </div>
                      </div>
                    </div>
                  );
                }

                return (
                  <motion.div
                    key={card.id}
                    className="absolute inset-0 cursor-grab active:cursor-grabbing"
                    style={{ x: dragX, rotate: cardRotate, zIndex: 30 }}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.15}
                    animate={controls}
                    onDragEnd={async (_event, info) => {
                      if (info.offset.x > SWIPE_THRESHOLD) {
                        await triggerSwipe("right");
                        return;
                      }

                      if (info.offset.x < -SWIPE_THRESHOLD) {
                        await triggerSwipe("left");
                        return;
                      }

                      await controls.start({
                        x: 0,
                        rotate: 0,
                        transition: { duration: 0.2, ease: "easeOut" }
                      });
                    }}
                  >
                    <div className="relative h-full w-full overflow-hidden rounded-3xl border border-white/80 bg-gradient-to-br from-slate-200 to-slate-100 shadow-sm">
                      {imageStage !== "none" ? (
                        <img
                          src={imageSrc}
                          alt={card.title}
                          onError={() => markImageError(card.id)}
                          className="h-full w-full object-cover"
                        />
                      ) : null}

                      <motion.div
                        style={{ opacity: passBadgeOpacity }}
                        className="absolute left-5 top-5 rounded-full border-2 border-rose-500 bg-white/85 px-4 py-1.5 text-sm font-bold uppercase tracking-wide text-rose-600"
                      >
                        Pass
                      </motion.div>

                      <motion.div
                        style={{ opacity: loveBadgeOpacity }}
                        className="absolute right-5 top-5 rounded-full border-2 border-emerald-500 bg-white/85 px-4 py-1.5 text-sm font-bold uppercase tracking-wide text-emerald-600"
                      >
                        Love It
                      </motion.div>

                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-900/80 to-transparent p-5">
                        <h2 className="text-2xl font-bold text-white">{card.title}</h2>
                        <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-white/80">
                          Tags: {card.tags.join(" / ")}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
          </div>

          <div className="mt-8 flex items-center justify-center gap-6">
            <button
              type="button"
              onClick={() => {
                void triggerSwipe("left");
              }}
              disabled={isSwiping}
              className="inline-flex h-20 w-20 items-center justify-center rounded-full border border-rose-200 bg-white/90 text-rose-600 shadow-sm transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <X size={38} />
            </button>
            <button
              type="button"
              onClick={() => {
                void triggerSwipe("right");
              }}
              disabled={isSwiping}
              className="inline-flex h-20 w-20 items-center justify-center rounded-full border border-emerald-200 bg-white/90 text-emerald-600 shadow-sm transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Heart size={34} />
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
