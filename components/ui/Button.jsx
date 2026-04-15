export default function Button({
  children,
  variant = "primary",
  className = "",
  type = "button",
  ...props
}) {
  const baseClasses =
    "inline-flex items-center justify-center rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-55";

  const variantClasses = {
    primary: "bg-app-slate text-white hover:opacity-90",
    sand: "bg-app-sand text-app-slate hover:brightness-95",
    outline:
      "border border-app-border bg-white text-app-slate hover:bg-app-sky hover:border-app-blue",
    ghost: "bg-transparent text-app-muted hover:bg-white/60"
  };

  return (
    <button
      type={type}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
