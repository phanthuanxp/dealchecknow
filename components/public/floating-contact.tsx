import Link from "next/link";

import { getPublicSiteSettings } from "@/lib/site-settings";

export async function FloatingContact() {
  const settings = await getPublicSiteSettings();

  return (
    <div className="fixed bottom-24 right-4 z-40 flex flex-col gap-3 md:bottom-6 md:right-6">
      <Link
        href={settings.hotlineTel}
        className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-900/25 transition hover:bg-emerald-700"
      >
        Gọi {settings.hotlineDisplay}
      </Link>
      <Link
        href={settings.zaloUrl}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center justify-center rounded-full bg-sky-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-900/25 transition hover:bg-sky-700"
      >
        Zalo {settings.zaloNumber}
      </Link>
    </div>
  );
}
