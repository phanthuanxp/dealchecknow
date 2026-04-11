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
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-teal-600 to-sky-500 text-white shadow-md shadow-sky-900/20 transition group-hover:scale-105">
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
                    className="inline-flex rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700"
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
              className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-emerald-900/20 transition hover:bg-emerald-700"
            >
              <PhoneCallIcon className="h-4 w-4" />
              {settings.hotlineDisplay}
            </Link>
            <Link
              href={settings.zaloUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-sky-300 bg-sky-50 px-4 py-2 text-sm font-semibold text-sky-700 transition hover:bg-sky-100"
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
                  className="inline-flex rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700"
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
