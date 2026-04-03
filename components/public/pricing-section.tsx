import Link from "next/link";

import { PricingData } from "@/lib/queries";

type PricingSectionProps = {
  data: PricingData;
  hotlineTel: string;
};

function formatCurrency(price: number, currency: string) {
  if (currency === "VND") {
    return `${new Intl.NumberFormat("vi-VN").format(price)}đ`;
  }

  return `${new Intl.NumberFormat("vi-VN").format(price)} ${currency}`;
}

export function PricingSection({ data, hotlineTel }: PricingSectionProps) {
  return (
    <section id="bang-gia" className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 sm:text-xl">{data.title}</h2>
          <p className="mt-2 text-sm text-slate-600">{data.description}</p>
        </div>
        <Link
          href={hotlineTel}
          className="inline-flex items-center rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-700"
        >
          Gọi để chốt giá tốt
        </Link>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {data.items.map((item) => (
          <article
            key={item.id}
            className={`rounded-xl border p-4 ${
              item.isPopular ? "border-teal-300 bg-teal-50" : "border-slate-200 bg-slate-50"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-sm font-semibold text-slate-900 sm:text-base">{item.routeName}</h3>
              {item.isPopular ? (
                <span className="rounded-full bg-teal-700 px-2 py-1 text-xs font-semibold text-white">
                  Phổ biến
                </span>
              ) : null}
            </div>
            <p className="mt-2 text-xs text-slate-600">
              {item.fromLocation} → {item.toLocation}
            </p>
            <p className="mt-1 text-xs text-slate-600">{item.vehicleType}</p>
            <p className="mt-3 text-lg font-bold text-teal-800">{formatCurrency(item.price, item.currency)}</p>
            <p className="text-xs text-slate-500">/ {item.unit}</p>
            {item.description ? <p className="mt-2 text-xs text-slate-600">{item.description}</p> : null}
          </article>
        ))}
      </div>
      <p className="mt-3 text-xs text-slate-500">{data.note}</p>
    </section>
  );
}
