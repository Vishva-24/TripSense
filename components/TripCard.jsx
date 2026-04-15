import { CalendarDays, Trash2 } from "lucide-react";
import Link from "next/link";

export default function TripCard({ trip, onOpen, onDelete, deleting = false }) {
  const fallbackImage = `https://picsum.photos/seed/${encodeURIComponent(
    trip.title || "trip-cover"
  )}/900/600`;

  return (
    <article className="card-surface overflow-hidden">
      <div className="h-40 w-full overflow-hidden">
        <img
          src={trip.image || fallbackImage}
          alt={trip.title}
          className="h-full w-full object-cover"
          onError={(event) => {
            const target = event.currentTarget;
            if (target.src === fallbackImage) return;
            target.src = fallbackImage;
          }}
        />
      </div>

      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg font-bold text-app-slate">{trip.title}</h3>
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              trip.status === "Completed"
                ? "bg-emerald-100 text-emerald-700"
                : "bg-amber-100 text-amber-700"
            }`}
          >
            {trip.status}
          </span>
        </div>

        <p className="flex items-center gap-2 text-sm text-app-muted">
          <CalendarDays size={16} />
          {trip.dates}
        </p>

        <div className="flex items-center gap-2">
          {trip.openHref ? (
            <Link
              href={trip.openHref}
              onClick={onOpen}
              className="inline-flex items-center rounded-lg border border-app-border px-3 py-1.5 text-xs font-semibold text-app-slate transition hover:bg-app-sky"
            >
              Open Trip
            </Link>
          ) : null}

          {onDelete ? (
            <button
              type="button"
              onClick={onDelete}
              disabled={deleting}
              className="inline-flex items-center gap-1 rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Trash2 size={14} />
              {deleting ? "Deleting..." : "Delete"}
            </button>
          ) : null}
        </div>
      </div>
    </article>
  );
}
