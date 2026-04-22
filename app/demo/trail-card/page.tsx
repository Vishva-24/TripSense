import Link from "next/link";
import TrailCardDemo from "@/components/ui/trail-card-demo";

export default function TrailCardPreviewPage() {
  return (
    <main className="min-h-[calc(100dvh-4rem)] bg-gradient-to-br from-blue-50 via-sky-50 to-amber-50 px-4 py-10">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <div className="rounded-3xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
                UI Preview
              </p>
              <h1 className="text-3xl font-extrabold text-slate-900">Trail Card Demo</h1>
              <p className="mt-2 text-sm text-slate-600">
                This route is only for previewing the reusable `TrailCard` component.
              </p>
            </div>

            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
            >
              Back to Home
            </Link>
          </div>
        </div>

        <div className="rounded-[2rem] border border-slate-200/70 bg-white/60 p-4 shadow-sm backdrop-blur sm:p-8">
          <TrailCardDemo />
        </div>
      </div>
    </main>
  );
}
