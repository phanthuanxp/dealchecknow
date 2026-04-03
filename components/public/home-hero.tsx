import Link from "next/link";

import { HeroData } from "@/lib/queries";

type HomeHeroProps = {
  data: HeroData;
  hotlineTel: string;
  zaloUrl: string;
};

export function HomeHero({ data, hotlineTel, zaloUrl }: HomeHeroProps) {
  return (
    <section className="rounded-3xl border border-teal-100 bg-white p-6 shadow-sm sm:p-10">
      <p className="inline-flex rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700 sm:text-sm">
        {data.badge}
      </p>
      <h1 className="mt-3 text-2xl font-bold leading-tight text-slate-900 sm:text-4xl">{data.title}</h1>
      <p className="mt-3 max-w-3xl text-sm text-slate-600 sm:text-base">{data.description}</p>

      <div className="mt-5 flex flex-wrap gap-2 sm:gap-3">
        <Link
          href={hotlineTel}
          className="inline-flex items-center rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
        >
          {data.primaryCtaText}
        </Link>
        <Link
          href={zaloUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center rounded-lg bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-700"
        >
          {data.secondaryCtaText}
        </Link>
      </div>

      <ul className="mt-5 grid gap-2 text-sm text-slate-600 sm:grid-cols-3">
        {data.highlights.map((item) => (
          <li key={item} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}
