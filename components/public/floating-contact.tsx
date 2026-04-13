import Link from "next/link";

import { PhoneCallIcon, ZaloIcon } from "@/components/public/ui-icons";
import { getPublicSiteSettings } from "@/lib/site-settings";

export async function FloatingContact() {
  const settings = await getPublicSiteSettings();

  return (
    <div className="fixed bottom-6 right-6 z-40 hidden flex-col gap-3 md:flex">
      <Link
        href={settings.hotlineTel}
        className="theme-primary-btn inline-flex items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-semibold shadow-lg transition"
      >
        <PhoneCallIcon className="h-4 w-4" />
        Gọi {settings.hotlineDisplay}
      </Link>
      <Link
        href={settings.zaloUrl}
        target="_blank"
        rel="noreferrer"
        className="theme-secondary-btn inline-flex items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-semibold shadow-lg transition"
      >
        <ZaloIcon className="h-4 w-4" />
        Zalo {settings.zaloNumber}
      </Link>
    </div>
  );
}
