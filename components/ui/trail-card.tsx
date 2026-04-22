"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface TrailCardProps
  extends Omit<
    React.HTMLAttributes<HTMLDivElement>,
    "onDrag" | "onDragStart" | "onDragEnd" | "onAnimationStart" | "onAnimationEnd"
  > {
  imageUrl: string;
  mapImageUrl?: string;
  title: string;
  location: string;
  difficulty?: string;
  creators?: string;
  distance?: string;
  elevation?: string;
  duration?: string;
  onDirectionsClick?: () => void;
  actionLabel?: string;
  badge?: React.ReactNode;
  footerActions?: React.ReactNode;
  stats?: { label: string; value: string }[];
}

const StatItem = ({ label, value }: { label: string; value: string }) => (
  <div className="flex flex-col">
    <span className="text-sm font-semibold text-foreground">{value}</span>
    <span className="text-xs text-muted-foreground">{label}</span>
  </div>
);

const TrailCard = React.forwardRef<HTMLDivElement, TrailCardProps>(
  (
    {
      className,
      imageUrl,
      mapImageUrl,
      title,
      location,
      difficulty,
      creators,
      distance,
      elevation,
      duration,
      onDirectionsClick,
      actionLabel = "Directions",
      badge,
      footerActions,
      stats,
      ...props
    },
    ref
  ) => {
    const [isHovered, setIsHovered] = React.useState(false);
    const resolvedStats = (stats && stats.length > 0
      ? stats
      : [
          distance ? { label: "Distance", value: distance } : null,
          elevation ? { label: "Elevation", value: elevation } : null,
          duration ? { label: "Duration", value: duration } : null
        ].filter(Boolean)) as { label: string; value: string }[];
    const resolvedMapImageUrl =
      mapImageUrl ||
      "data:image/svg+xml;utf8," +
        encodeURIComponent(`
          <svg xmlns="http://www.w3.org/2000/svg" width="160" height="80" viewBox="0 0 160 80" fill="none">
            <rect width="160" height="80" rx="18" fill="#EFF6FF"/>
            <path d="M24 55C39 49 50 28 65 28C82 28 87 50 103 50C118 50 125 18 143 24" stroke="#233044" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
            <circle cx="24" cy="55" r="7" fill="#FEF3C7"/>
            <circle cx="65" cy="28" r="7" fill="#BFDBFE"/>
            <circle cx="103" cy="50" r="7" fill="#D1FAE5"/>
            <circle cx="143" cy="24" r="7" fill="#FBCFE8"/>
          </svg>
        `);

    const cardVariants = {
      rest: {
        y: 0,
        scale: 1,
        boxShadow: "0 10px 25px rgba(15, 23, 42, 0.08)"
      },
      hover: {
        y: -10,
        scale: 1.025,
        boxShadow: "0 24px 50px rgba(15, 23, 42, 0.18)"
      }
    };

    const directionsVariants = {
      rest: { opacity: 0, x: 18, scale: 0.96 },
      hover: { opacity: 1, x: 0, scale: 1 }
    };

    const imageVariants = {
      rest: { scale: 1 },
      hover: { scale: 1.08 }
    };

    return (
      <motion.div
        ref={ref}
        className={cn(
          "group w-full max-w-sm cursor-pointer overflow-hidden rounded-2xl bg-card text-card-foreground",
          className
        )}
        initial={false}
        animate={isHovered ? "hover" : "rest"}
        variants={cardVariants}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        {...props}
      >
        <div className="relative h-60 w-full overflow-hidden rounded-t-2xl">
          <motion.img
            src={imageUrl}
            alt={title}
            className="block h-full w-full object-cover"
            variants={imageVariants}
            transition={{ duration: 0.45, ease: "easeOut" }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          {badge ? <div className="absolute left-4 top-4">{badge}</div> : null}
          <div className="absolute bottom-0 left-0 flex w-full items-end justify-between p-4">
            <div className="text-white">
              <h3 className="text-xl font-bold">{title}</h3>
              <p className="text-sm text-white/90">{location}</p>
            </div>
            {onDirectionsClick ? (
              <motion.div
                variants={directionsVariants}
                animate={isHovered ? "hover" : "rest"}
                className="shrink-0"
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                <Button
                  variant="secondary"
                  onClick={(event) => {
                    event.stopPropagation();
                    onDirectionsClick();
                  }}
                  className="border border-white/20 bg-white/95 text-slate-900 shadow-lg hover:bg-white"
                  aria-label={`${actionLabel} for ${title}`}
                >
                  {actionLabel}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </motion.div>
            ) : null}
          </div>
        </div>

        <div className="p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              {difficulty ? <p className="font-bold text-foreground">{difficulty}</p> : null}
              {creators ? <p className="text-xs text-muted-foreground">{creators}</p> : null}
            </div>
            <img src={resolvedMapImageUrl} alt="Trail map" className="h-10 w-20 object-contain" />
          </div>
          {resolvedStats.length > 0 ? <div className="my-4 h-px w-full bg-border" /> : null}
          {resolvedStats.length > 0 ? (
            <div className="flex justify-between gap-4">
              {resolvedStats.map((item) => (
                <StatItem key={`${item.label}-${item.value}`} label={item.label} value={item.value} />
              ))}
            </div>
          ) : null}
          {footerActions ? <div className="mt-5 flex flex-wrap gap-2">{footerActions}</div> : null}
        </div>
      </motion.div>
    );
  }
);

TrailCard.displayName = "TrailCard";

export { TrailCard };
