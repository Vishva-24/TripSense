"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Banknote, CheckSquare, Square } from "lucide-react";

export default function UtilityDrawer({
  weatherAlert,
  estimatedCost,
  estimateNote,
  packingList
}) {
  const [items, setItems] = useState(packingList || []);

  useEffect(() => {
    setItems(packingList || []);
  }, [packingList]);

  const toggleItem = (id) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              checked: !item.checked
            }
          : item
      )
    );
  };

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

      <div className="space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-wide text-app-muted">
          Packing List
        </h3>
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => toggleItem(item.id)}
                className="flex w-full items-center gap-2 rounded-lg px-1 py-1 text-left text-sm text-app-slate transition hover:bg-app-sky/50"
              >
                {item.checked ? (
                  <CheckSquare size={17} className="text-emerald-600" />
                ) : (
                  <Square size={17} className="text-app-muted" />
                )}
                <span className={item.checked ? "line-through opacity-70" : ""}>
                  {item.label}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
