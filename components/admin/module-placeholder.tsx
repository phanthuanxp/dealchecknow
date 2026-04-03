import Link from "next/link";

type ModulePlaceholderProps = {
  title: string;
  description: string;
  primaryActionLabel?: string;
  primaryActionHref?: string;
};

export function ModulePlaceholder({
  title,
  description,
  primaryActionLabel,
  primaryActionHref
}: ModulePlaceholderProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
      <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">{title}</h1>
      <p className="mt-2 max-w-3xl text-sm text-slate-600">{description}</p>

      <div className="mt-5 flex flex-wrap gap-2">
        {primaryActionLabel && primaryActionHref ? (
          <Link
            href={primaryActionHref}
            className="inline-flex items-center rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-800"
          >
            {primaryActionLabel}
          </Link>
        ) : null}
        <Link
          href="/admincp"
          className="inline-flex items-center rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Quay về tổng quan
        </Link>
      </div>

      <div className="mt-6 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
        Module đang ở trạng thái placeholder cho phase hiện tại. Chức năng CRUD chi tiết sẽ được triển khai ở phase
        tiếp theo.
      </div>
    </section>
  );
}
