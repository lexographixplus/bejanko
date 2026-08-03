export default function DashboardLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header skeleton */}
      <div>
        <div className="h-7 w-36 bg-stone rounded-lg" />
        <div className="h-4 w-56 bg-stone/60 rounded mt-2" />
      </div>

      {/* Stats grid skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-rule bg-surface p-4 space-y-3"
          >
            <div className="w-9 h-9 rounded-lg bg-stone" />
            <div className="h-7 w-12 bg-stone rounded" />
            <div className="h-3 w-16 bg-stone/60 rounded" />
          </div>
        ))}
      </div>

      {/* Content skeleton */}
      <div className="grid lg:grid-cols-[1fr,340px] gap-8">
        <div className="space-y-4">
          <div className="rounded-xl border border-rule bg-surface p-5 h-32" />
          <div className="rounded-xl border border-rule bg-surface p-5 h-48" />
        </div>
        <div className="space-y-4">
          <div className="rounded-xl border border-rule bg-surface p-5 h-40" />
          <div className="rounded-xl border border-rule bg-surface p-5 h-52" />
        </div>
      </div>
    </div>
  );
}
