import Link from "next/link";

import { FinalCtaData } from "@/lib/queries";

type FinalCtaSectionProps = {
  data: FinalCtaData;
  hotlineTel: string;
  zaloUrl: string;
};

export function FinalCtaSection({ data, hotlineTel, zaloUrl }: FinalCtaSectionProps) {
  return (
    <section className="mt-6 rounded-3xl border border-teal-200 bg-gradient-to-br from-teal-600 to-emerald-600 p-6 text-white sm:p-10">
      <h2 className="text-2xl font-bold leading-tight sm:text-3xl">{data.title}</h2>
      <p className="mt-3 max-w-2xl text-sm text-teal-50 sm:text-base">{data.description}</p>
      <div className="mt-5 flex flex-wrap gap-2 sm:gap-3">
        <Link
          href={hotlineTel}
          className="inline-flex items-center rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-teal-700 transition hover:bg-teal-50"
        >
          {data.primaryCtaText}
        </Link>
        <Link
          href={zaloUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center rounded-lg border border-white/50 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/20"
        >
          {data.secondaryCtaText}
        </Link>
      </div>
    </section>
  );
}
