import Link from "next/link";

import { getPublicSiteSettings } from "@/lib/site-settings";

export async function MobileStickyBar() {
  const settings = await getPublicSiteSettings();

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white p-3 shadow-[0_-6px_24px_rgba(15,23,42,0.12)] md:hidden">
      <div className="mx-auto grid w-full max-w-6xl grid-cols-2 gap-2">
        <Link
          href={settings.hotlineTel}
          className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-3 py-3 text-sm font-semibold text-white"
        >
          Gọi ngay
        </Link>
        <Link
          href={settings.zaloUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center rounded-lg bg-sky-600 px-3 py-3 text-sm font-semibold text-white"
        >
          Chat Zalo
        </Link>
      </div>
    </div>
  );
}
