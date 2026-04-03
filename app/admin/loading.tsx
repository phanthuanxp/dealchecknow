export default function AdminLoading() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-5 sm:px-6 sm:py-6">
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-56 rounded-lg bg-slate-200" />
        <div className="h-4 w-3/4 rounded bg-slate-200" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="h-24 rounded-xl bg-slate-200" />
          <div className="h-24 rounded-xl bg-slate-200" />
          <div className="h-24 rounded-xl bg-slate-200" />
          <div className="h-24 rounded-xl bg-slate-200" />
        </div>
      </div>
    </div>
  );
}
