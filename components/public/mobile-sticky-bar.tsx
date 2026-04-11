import { getPublicSiteSettings } from "@/lib/site-settings";

import { MobileStickyBarClient } from "@/components/public/mobile-sticky-bar-client";

export async function MobileStickyBar() {
  const settings = await getPublicSiteSettings();

  return (
    <MobileStickyBarClient
      hotlineTel={settings.hotlineTel}
      zaloUrl={settings.zaloUrl}
    />
  );
}
