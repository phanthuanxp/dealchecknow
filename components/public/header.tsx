import Link from "next/link";

import { CarIcon, PhoneCallIcon, ZaloIcon } from "@/components/public/ui-icons";
import { getPublicSiteSettings } from "@/lib/site-settings";

const mainMenu = [
  { label: "Trang chủ", href: "/" },
  { label: "Giới thiệu", href: "/gioi-thieu" },
  { label: "Dịch vụ", href: "/dich-vu" },
  { label: "Bảng giá", href: "/bang-gia" },
  { label: "Blog", href: "/blog" },
  { label: "FAQ", href: "/faq" },
  { label: "Liên hệ", href: "/lien-he" }
];

export async function PublicHeader() {
  const settings = await getPublicSiteSettings();

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto w-[90%] py-3">
        <div className="flex items-center justify-between gap-3 md:grid md:grid-cols-[auto_1fr_auto] md:items-center md:gap-4">
          <Link href="/" className="group inline-flex min-w-0 items-center gap-3">
            <span className="theme-brand-gradient inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white shadow-md transition group-hover:scale-105">
              <CarIcon className="h-5 w-5" />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-base font-extrabold tracking-tight text-slate-900 sm:text-lg">
                {settings.siteName}
              </span>
              <span className="block truncate text-[11px] text-slate-500 sm:text-xs">{settings.tagline}</span>
            </span>
          </Link>

          <nav className="hidden md:block">
            <ul className="flex min-w-max items-center justify-center gap-2">
              {mainMenu.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="theme-nav-pill inline-flex rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            <Link
              href={settings.hotlineTel}
              className="theme-primary-btn inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold shadow-sm transition"
            >
              <PhoneCallIcon className="h-4 w-4" />
              {settings.hotlineDisplay}
            </Link>
            <Link
              href={settings.zaloUrl}
              target="_blank"
              rel="noreferrer"
              className="theme-outline-btn inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-semibold transition"
            >
              <ZaloIcon className="h-4 w-4" />
              Chat Zalo
            </Link>
          </div>
        </div>

        <nav className="-mx-1 mt-3 overflow-x-auto px-1 pb-1 md:hidden">
          <ul className="flex min-w-max items-center gap-2">
            {mainMenu.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="theme-nav-pill inline-flex rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
