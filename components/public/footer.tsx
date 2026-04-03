import Link from "next/link";

import { getFooterContentData } from "@/lib/footer-content";
import { getPublicSiteSettings } from "@/lib/site-settings";

const quickLinks = [
  { label: "Trang chủ", href: "/" },
  { label: "Giới thiệu", href: "/gioi-thieu" },
  { label: "Dịch vụ", href: "/dich-vu" },
  { label: "Bảng giá", href: "/bang-gia" },
  { label: "Blog", href: "/blog" },
  { label: "FAQ", href: "/faq" },
  { label: "Liên hệ", href: "/lien-he" },
  { label: "Chính sách bảo mật", href: "/chinh-sach-bao-mat" },
  { label: "Điều khoản sử dụng", href: "/dieu-khoan-su-dung" },
  { label: "Nhận báo giá", href: "/#bao-gia" },
  { label: "Đánh giá", href: "/#danh-gia" }
];

function buildBottomNote(template: string) {
  const currentYear = String(new Date().getFullYear());
  return template.includes("{year}") ? template.replaceAll("{year}", currentYear) : template;
}

export async function PublicFooter() {
  const [footerContent, settings] = await Promise.all([getFooterContentData(), getPublicSiteSettings()]);

  return (
    <footer id="lien-he" className="mt-12 border-t border-slate-200 bg-slate-950 text-slate-100">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-3">
        <section>
          <h3 className="text-lg font-semibold">{footerContent.companyName}</h3>
          <p className="mt-3 text-sm text-slate-300">{footerContent.description}</p>
          <div className="mt-4 space-y-2 text-sm">
            <p>
              Hotline:{" "}
              <Link href={settings.hotlineTel} className="font-semibold text-emerald-300 hover:underline">
                {settings.hotlineDisplay}
              </Link>
            </p>
            <p>
              Email:{" "}
              <Link href={`mailto:${settings.email}`} className="font-semibold text-sky-300 hover:underline">
                {settings.email}
              </Link>
            </p>
            <p>
              Domain:{" "}
              <Link href={settings.siteUrl} className="font-semibold text-teal-300 hover:underline">
                {settings.siteDomain}
              </Link>
            </p>
          </div>
        </section>

        <section>
          <h3 className="text-lg font-semibold">Khu vực phục vụ</h3>
          <ul className="mt-3 grid grid-cols-2 gap-2 text-sm text-slate-300">
            {footerContent.serviceAreas.map((area) => (
              <li key={area} className="rounded-md border border-slate-800 bg-slate-900 px-2 py-1.5">
                {area}
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h3 className="text-lg font-semibold">Liên kết nhanh</h3>
          <ul className="mt-3 space-y-2 text-sm">
            {quickLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-slate-300 transition hover:text-white hover:underline">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
      <div className="border-t border-slate-800 px-4 py-3 text-center text-xs text-slate-400 sm:px-6">
        {buildBottomNote(footerContent.bottomNote)}
      </div>
    </footer>
  );
}
