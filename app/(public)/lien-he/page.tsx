import type { Metadata } from "next";
import Link from "next/link";

import { createBreadcrumbSchema, createPageMetadata, getSeoContext } from "@/lib/seo";
import { getPublicSiteSettings } from "@/lib/site-settings";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getPublicSiteSettings();

  return createPageMetadata({
    title: `Liên Hệ ${settings.siteName}`,
    description: `Liên hệ ${settings.siteName} qua hotline ${settings.hotlineDisplay}, Zalo ${settings.zaloNumber} hoặc email ${settings.email} để đặt xe nhanh 24/7.`,
    path: "/lien-he",
    keywords: [
      "liên hệ taxi ninh bình",
      "hotline taxi ninh bình",
      "zalo taxi ninh bình",
      "đặt xe ninh bình 24/7"
    ]
  });
}

export default async function ContactPage() {
  const [settings, seo] = await Promise.all([getPublicSiteSettings(), getSeoContext()]);
  const breadcrumbSchema = createBreadcrumbSchema(seo.siteUrl, [
    { name: "Trang chủ", path: "/" },
    { name: "Liên hệ", path: "/lien-he" }
  ]);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <section className="rounded-3xl border border-teal-100 bg-white p-6 shadow-sm sm:p-10">
        <h1 className="text-2xl font-bold text-slate-900 sm:text-4xl">Liên hệ {settings.siteName}</h1>
        <p className="mt-3 max-w-3xl text-sm text-slate-600 sm:text-base">
          Chúng tôi hỗ trợ đặt xe nhanh cho tuyến nội tỉnh, liên tỉnh và xe du lịch. Bạn có thể gọi trực tiếp hoặc
          nhắn Zalo để nhận xác nhận chuyến sớm.
        </p>
      </section>

      <section className="mt-6 grid gap-4 sm:grid-cols-3">
        <article className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="text-base font-semibold text-slate-900">Hotline</h2>
          <p className="mt-2 text-sm text-slate-600">Phản hồi nhanh cho yêu cầu đặt xe gấp.</p>
          <Link href={settings.hotlineTel} className="mt-3 inline-flex text-sm font-semibold text-emerald-700 hover:underline">
            {settings.hotlineDisplay}
          </Link>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="text-base font-semibold text-slate-900">Zalo</h2>
          <p className="mt-2 text-sm text-slate-600">Phù hợp gửi lịch trình và điểm đón nhanh.</p>
          <Link
            href={settings.zaloUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-flex text-sm font-semibold text-sky-700 hover:underline"
          >
            {settings.zaloNumber}
          </Link>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="text-base font-semibold text-slate-900">Email</h2>
          <p className="mt-2 text-sm text-slate-600">Kênh liên hệ cho đối tác và yêu cầu dài hạn.</p>
          <Link href={`mailto:${settings.email}`} className="mt-3 inline-flex text-sm font-semibold text-teal-700 hover:underline">
            {settings.email}
          </Link>
        </article>
      </section>

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-slate-900 sm:text-xl">Khu vực phục vụ chính</h2>
        <div className="mt-3 grid gap-2 text-sm text-slate-700 sm:grid-cols-3">
          <p className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">TP Ninh Bình</p>
          <p className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">Tam Cốc</p>
          <p className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">Tràng An</p>
          <p className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">Bái Đính</p>
          <p className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">Hoa Lư</p>
          <p className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">Các tuyến liên tỉnh</p>
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-teal-200 bg-teal-50 p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-slate-900 sm:text-xl">Hành động nhanh</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href={settings.hotlineTel}
            className="inline-flex items-center rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white"
          >
            Gọi ngay
          </Link>
          <Link
            href={settings.zaloUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center rounded-lg bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white"
          >
            Nhắn Zalo
          </Link>
          <Link
            href="/#bao-gia"
            className="inline-flex items-center rounded-lg border border-teal-300 bg-white px-4 py-2.5 text-sm font-semibold text-teal-700"
          >
            Mở form báo giá
          </Link>
        </div>
      </section>
    </div>
  );
}
