import { ReactNode } from "react";
import Script from "next/script";

import { FloatingContact } from "@/components/public/floating-contact";
import { PublicFooter } from "@/components/public/footer";
import { PublicHeader } from "@/components/public/header";
import { MobileStickyBar } from "@/components/public/mobile-sticky-bar";
import { TenantSiteUnavailable } from "@/components/public/tenant-site-unavailable";
import { getCurrentTenantRuntimeState } from "@/lib/tenant-lifecycle";
import { getCurrentTenantTheme, toTenantThemeCssVariables } from "@/lib/tenant-theme";

type PublicLayoutProps = {
  children: ReactNode;
};

export const dynamic = "force-dynamic";

export default async function PublicLayout({ children }: PublicLayoutProps) {
  const [runtimeState, theme] = await Promise.all([getCurrentTenantRuntimeState(), getCurrentTenantTheme()]);
  const googleAdsTagId = "AW-11324459657";
  const canRenderPublic = runtimeState.status === "active" || runtimeState.status === "not_found";

  if (!canRenderPublic) {
    return <TenantSiteUnavailable state={runtimeState} />;
  }

  const themeVars = toTenantThemeCssVariables(theme);

  return (
    <div className="tenant-theme-shell" style={themeVars}>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${googleAdsTagId}`} strategy="afterInteractive" />
      <Script id="google-ads-gtag" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${googleAdsTagId}');
        `}
      </Script>
      <PublicHeader />
      <main className="pb-24 pt-0 md:pb-0">{children}</main>
      <PublicFooter />
      <FloatingContact />
      <MobileStickyBar />
    </div>
  );
}
