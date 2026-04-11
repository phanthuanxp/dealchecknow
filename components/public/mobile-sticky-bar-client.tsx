"use client";

import Link from "next/link";

import { CarIcon, PhoneCallIcon, ZaloIcon } from "@/components/public/ui-icons";

type MobileStickyBarClientProps = {
  hotlineTel: string;
  zaloUrl: string;
};

export function MobileStickyBarClient({ hotlineTel, zaloUrl }: MobileStickyBarClientProps) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-[95] md:hidden">
      <div className="border-t border-slate-200 bg-white/95 px-2 pt-2 pb-[calc(env(safe-area-inset-bottom)+8px)] shadow-[0_-10px_24px_rgba(15,23,42,0.16)] backdrop-blur-md">
        <div className="mx-[5%] grid w-auto grid-cols-3 gap-2">
          <Link
            href={hotlineTel}
            className="inline-flex h-10 items-center justify-center gap-1 rounded-xl bg-emerald-600 px-2 text-xs font-semibold text-white"
          >
            <PhoneCallIcon className="h-3.5 w-3.5 shrink-0" />
            <span className="leading-none">Gọi ngay</span>
          </Link>

          <Link
            href={zaloUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-10 items-center justify-center gap-1 rounded-xl bg-sky-600 px-2 text-xs font-semibold text-white"
          >
            <ZaloIcon className="h-3.5 w-3.5 shrink-0" />
            <span className="leading-none">Chat Zalo</span>
          </Link>

          <Link
            href="/#bao-gia"
            className="inline-flex h-10 items-center justify-center gap-1 rounded-xl bg-indigo-600 px-2 text-xs font-semibold text-white"
          >
            <CarIcon className="h-3.5 w-3.5 shrink-0" />
            <span className="leading-none">Đặt xe</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
