export function FormInput({ label, className = "", ...props }) {
  return (
    <label className="flex flex-col gap-2 text-sm text-app-slate">
      <span className="font-semibold">{label}</span>
      <input
        className={`w-full rounded-xl border border-app-border bg-white px-4 py-2.5 text-sm text-app-slate outline-none transition focus:border-app-blue ${className}`}
        {...props}
      />
    </label>
  );
}

export function FormTextArea({ label, className = "", ...props }) {
  return (
    <label className="flex flex-col gap-2 text-sm text-app-slate">
      <span className="font-semibold">{label}</span>
      <textarea
        className={`min-h-[130px] w-full resize-none rounded-xl border border-app-border bg-white px-4 py-3 text-sm text-app-slate outline-none transition focus:border-app-blue ${className}`}
        {...props}
      />
    </label>
  );
}
