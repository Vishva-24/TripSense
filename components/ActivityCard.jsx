import { Bus, Landmark, LoaderCircle, RotateCcw, UtensilsCrossed } from "lucide-react";

const iconMap = {
  food: UtensilsCrossed,
  transit: Bus,
  landmark: Landmark
};

export default function ActivityCard({
  activity,
  onReroll,
  rerolling = false,
  rerollDisabled = false
}) {
  const Icon = iconMap[activity.type] || Landmark;
  const fallbackUrl = `https://placehold.co/480x320/png?text=${encodeURIComponent(activity.title || "Location")}`;

  return (
    <div className="relative rounded-2xl border border-app-border bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex gap-3">
          <div className="h-20 w-28 shrink-0 overflow-hidden rounded-xl border border-app-border bg-app-sky">
            {activity.imageUrl ? (
              <img
                src={activity.imageUrl || fallbackUrl}
                alt={activity.title}
                className="h-full w-full object-cover"
                loading="lazy"
                onError={(event) => {
                  const target = event.currentTarget;
                  if (target.src === fallbackUrl) return;
                  target.src = fallbackUrl;
                }}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-app-slate">
                <Icon size={20} />
              </div>
            )}
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-app-muted">
              {activity.time}
            </p>
            <h4 className="text-base font-bold text-app-slate">{activity.title}</h4>
            <p className="text-sm text-app-muted">{activity.description}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={onReroll}
          disabled={rerollDisabled || rerolling}
          className="rounded-lg border border-app-border p-2 text-app-muted transition hover:bg-app-sky"
          aria-label="Re-roll activity"
          title="Re-roll"
        >
          {rerolling ? (
            <LoaderCircle size={16} className="animate-spin" />
          ) : (
            <RotateCcw size={16} />
          )}
        </button>
      </div>
    </div>
  );
}
