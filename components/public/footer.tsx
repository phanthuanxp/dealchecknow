import Link from "next/link";

import { ChatIcon, MapPinIcon, PhoneCallIcon } from "@/components/public/ui-icons";
import { getFooterContentData } from "@/lib/footer-content";
import { getPublicSiteSettings } from "@/lib/site-settings";

const quickLinkColumns = [
  {
    title: "Dịch vụ & thông tin",
    links: [
      { label: "Trang chủ", href: "/" },
      { label: "Giới thiệu", href: "/gioi-thieu" },
      { label: "Dịch vụ", href: "/dich-vu" },
      { label: "Bảng giá", href: "/bang-gia" },
      { label: "FAQ", href: "/faq" },
      { label: "Liên hệ", href: "/lien-he" }
    ]
  },
  {
    title: "Nội dung hữu ích",
    links: [
      { label: "Blog", href: "/blog" },
      { label: "Nhận báo giá", href: "/#bao-gia" },
      { label: "Đánh giá khách hàng", href: "/#danh-gia" },
      { label: "Chính sách bảo mật", href: "/chinh-sach-bao-mat" },
      { label: "Điều khoản sử dụng", href: "/dieu-khoan-su-dung" }
    ]
  }
];

const footerButtonClassName = "rounded-md border border-slate-800 bg-slate-900 px-2 py-1.5";

function buildBottomNote(template: string) {
  const currentYear = String(new Date().getFullYear());
  return template.includes("{year}") ? template.replaceAll("{year}", currentYear) : template;
}

export async function PublicFooter() {
  const [footerContent, settings] = await Promise.all([getFooterContentData(), getPublicSiteSettings()]);

  return (
    <footer id="lien-he" className="mt-12 border-t border-slate-200 bg-slate-950 text-slate-100">
      <div className="mx-auto grid w-[90%] gap-8 py-10 md:grid-cols-2 xl:grid-cols-4">
        <section>
          <h3 className="text-lg font-semibold">{footerContent.companyName}</h3>
          <p className="mt-3 text-sm text-slate-300">{footerContent.description}</p>
          <div className="mt-4 space-y-2 text-sm">
            <p className="inline-flex items-center gap-2">
              <PhoneCallIcon className="theme-accent-text h-4 w-4" />
              Hotline:{" "}
              <Link href={settings.hotlineTel} className="theme-accent-text font-semibold hover:underline">
                {settings.hotlineDisplay}
              </Link>
            </p>
            <p className="inline-flex items-center gap-2">
              <ChatIcon className="h-4 w-4 text-slate-300" />
              Email:{" "}
              <Link href={`mailto:${settings.email}`} className="font-semibold text-slate-200 hover:underline">
                {settings.email}
              </Link>
            </p>
            <p className="inline-flex items-center gap-2">
              <MapPinIcon className="h-4 w-4 text-slate-300" />
              Domain:{" "}
              <Link href={settings.siteUrl} className="font-semibold text-slate-200 hover:underline">
                {settings.siteDomain}
              </Link>
            </p>
          </div>
        </section>

        <section>
          <h3 className="text-lg font-semibold">Khu vực phục vụ</h3>
          <ul className="mt-3 grid grid-cols-2 gap-2 text-sm text-slate-300">
            {footerContent.serviceAreas.map((area) => (
              <li key={area} className={footerButtonClassName}>
                {area}
              </li>
            ))}
          </ul>
        </section>

        {quickLinkColumns.map((column) => (
          <section key={column.title}>
            <h3 className="text-lg font-semibold">{column.title}</h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-300">
              {column.links.map((link) => (
                <li key={link.href} className={footerButtonClassName}>
                  <Link href={link.href} className="block transition hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <div className="border-t border-slate-800 px-4 py-3 text-center text-xs text-slate-400 sm:px-6">
        {buildBottomNote(footerContent.bottomNote)}
      </div>
    </footer>
  );
}
