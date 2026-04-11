import Link from "next/link";

import { PhoneCallIcon, ZaloIcon } from "@/components/public/ui-icons";
import { getPublicSiteSettings } from "@/lib/site-settings";

export async function FloatingContact() {
  const settings = await getPublicSiteSettings();

  return (
    <div className="fixed bottom-6 right-6 z-40 hidden flex-col gap-3 md:flex">
      <Link
        href={settings.hotlineTel}
        className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-900/25 transition hover:bg-emerald-700"
      >
        <PhoneCallIcon className="h-4 w-4" />
        Gọi {settings.hotlineDisplay}
      </Link>
      <Link
        href={settings.zaloUrl}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center justify-center gap-2 rounded-full bg-sky-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-900/25 transition hover:bg-sky-700"
      >
        <ZaloIcon className="h-4 w-4" />
        Zalo {settings.zaloNumber}
      </Link>
    </div>
  );
}
