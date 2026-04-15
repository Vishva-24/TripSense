export default function OptionChip({ label, selected, onClick, multi = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${
        selected
          ? "border-app-slate bg-app-slate text-white"
          : "border-app-border bg-white text-app-slate hover:border-app-blue"
      }`}
      aria-pressed={selected}
      aria-label={multi ? `${label} multi select option` : `${label} option`}
    >
      {label}
    </button>
  );
}
