export default function ProgressBar({ currentStep, totalSteps }) {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-app-muted">
        <span>Step {currentStep}</span>
        <span>{totalSteps} total</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-app-skyDeep">
        <div
          className="h-full rounded-full bg-app-slate transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
