import Link from "next/link";

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
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto w-full max-w-6xl px-4 py-3 sm:px-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <Link href="/" className="text-lg font-bold text-slate-900 sm:text-xl">
              {settings.siteName}
            </Link>
            <p className="text-xs text-slate-500 sm:text-sm">{settings.tagline}</p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={settings.hotlineTel}
              className="inline-flex items-center rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700 sm:px-4 sm:text-sm"
            >
              {settings.hotlineDisplay}
            </Link>
            <Link
              href={settings.zaloUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center rounded-lg border border-sky-300 bg-sky-50 px-3 py-2 text-xs font-semibold text-sky-700 transition hover:bg-sky-100 sm:px-4 sm:text-sm"
            >
              Chat Zalo
            </Link>
          </div>
        </div>

        <nav className="-mx-4 mt-3 overflow-x-auto px-4 pb-1">
          <ul className="flex min-w-max items-center gap-2">
            {mainMenu.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700"
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
