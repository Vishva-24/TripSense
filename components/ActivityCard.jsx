import {
  Bus,
  Landmark,
  LoaderCircle,
  PencilLine,
  RotateCcw,
  UtensilsCrossed
} from "lucide-react";

const iconMap = {
  food: UtensilsCrossed,
  transit: Bus,
  landmark: Landmark
};

export default function ActivityCard({
  activity,
  onReroll,
  onSpecificRequest,
  rerolling = false,
  rerollDisabled = false,
  showReroll = true
}) {
  const Icon = iconMap[activity.type] || Landmark;
  const fallbackUrl = `https://placehold.co/480x320/png?text=${encodeURIComponent(activity.title || "Location")}`;

  return (
    <div className="relative rounded-2xl border border-app-border bg-white p-4 shadow-sm">
      <div className={`flex items-start gap-3 ${showReroll ? "justify-between" : ""}`}>
        <div className="min-w-0 flex flex-1 gap-3">
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

          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-wide text-app-muted">
              {activity.time}
            </p>
            <h4 className="text-base font-bold text-app-slate">{activity.title}</h4>
            <p className="text-sm text-app-muted">{activity.description}</p>
          </div>
        </div>

        {showReroll ? (
          <div className="ml-2 flex shrink-0 flex-col gap-2">
            <button
              type="button"
              onClick={onReroll}
              disabled={rerollDisabled || rerolling}
              className="rounded-lg border border-app-border p-2 text-app-muted transition hover:bg-app-sky disabled:cursor-not-allowed disabled:opacity-60"
              aria-label="Re-roll activity"
              title="Re-roll"
            >
              {rerolling ? (
                <LoaderCircle size={16} className="animate-spin" />
              ) : (
                <RotateCcw size={16} />
              )}
            </button>

            <button
              type="button"
              onClick={onSpecificRequest}
              disabled={rerollDisabled || rerolling}
              className="rounded-lg border border-app-border p-2 text-app-muted transition hover:bg-app-sky disabled:cursor-not-allowed disabled:opacity-60"
              aria-label="Request a specific change"
              title="Request a specific change"
            >
              <PencilLine size={16} />
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
