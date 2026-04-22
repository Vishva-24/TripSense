"use client";

import { AlertTriangle, Banknote } from "lucide-react";

export default function UtilityDrawer({
  weatherAlert,
  estimatedCost,
  estimateNote
}) {
  return (
    <aside className="card-surface space-y-5 p-5">
      <div className="space-y-2">
        <h3 className="text-sm font-bold uppercase tracking-wide text-app-muted">
          Weather Alert
        </h3>
        <div className="rounded-xl bg-amber-50 p-3 text-amber-900">
          <p className="flex items-start gap-2 text-sm">
            <AlertTriangle size={16} className="mt-0.5 shrink-0" />
            {weatherAlert}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-bold uppercase tracking-wide text-app-muted">
          Estimated Price
        </h3>
        <div className="rounded-xl bg-sky-50 p-3 text-slate-900">
          <p className="flex items-center gap-2 text-sm font-semibold text-slate-600">
            <Banknote size={16} className="shrink-0 text-slate-500" />
            AI-estimated total
          </p>
          <p className="mt-2 text-2xl font-extrabold text-app-slate">
            {estimatedCost || "Estimate unavailable"}
          </p>
          <p className="mt-1 text-xs font-medium leading-5 text-app-muted">
            {estimateNote || "Estimated by TripSense AI during trip generation."}
          </p>
        </div>
      </div>
    </aside>
  );
}
