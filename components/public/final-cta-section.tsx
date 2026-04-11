import Link from "next/link";

import { ArrowRightIcon, PhoneCallIcon, ZaloIcon } from "@/components/public/ui-icons";
import { FinalCtaData } from "@/lib/queries";
import { cn } from "@/lib/utils";

type FinalCtaSectionProps = {
  data: FinalCtaData;
  hotlineTel: string;
  zaloUrl: string;
  className?: string;
};

export function FinalCtaSection({ data, hotlineTel, zaloUrl, className }: FinalCtaSectionProps) {
  return (
    <section
      className={cn(
        "h-full rounded-3xl border border-teal-200 bg-gradient-to-br from-teal-600 to-emerald-600 p-6 text-center text-white sm:p-8",
        className
      )}
    >
      <h2 className="text-2xl font-bold leading-tight sm:text-3xl">{data.title}</h2>
      <p className="mx-auto mt-3 max-w-2xl text-sm text-teal-50 sm:text-base">{data.description}</p>

      <div className="mt-5 flex flex-wrap justify-center gap-2 sm:gap-3">
        <Link
          href={hotlineTel}
          className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-teal-700 transition hover:bg-teal-50"
        >
          <PhoneCallIcon className="h-4 w-4" />
          {data.primaryCtaText}
        </Link>
        <Link
          href={zaloUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-lg border border-white/50 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/20"
        >
          <ZaloIcon className="h-4 w-4" />
          {data.secondaryCtaText}
          <ArrowRightIcon className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
