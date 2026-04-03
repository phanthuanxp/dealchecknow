import type { Metadata } from "next";
import Link from "next/link";

import { createBreadcrumbSchema, createPageMetadata, getSeoContext } from "@/lib/seo";
import { getPublicSiteSettings } from "@/lib/site-settings";

export async function generateMetadata(): Promise<Metadata> {
  return createPageMetadata({
    title: "Taxi Ninh Bình Đi Sân Bay Nội Bài",
    description:
      "Đặt taxi Ninh Bình đi sân bay Nội Bài nhanh chóng, đúng giờ bay, hỗ trợ hành lý. Phục vụ khách tại TP Ninh Bình, Tam Cốc, Tràng An, Bái Đính.",
    path: "/dich-vu/taxi-ninh-binh-di-san-bay-noi-bai",
    keywords: [
      "taxi ninh bình đi sân bay nội bài",
      "xe ninh bình đi nội bài",
      "đặt xe ninh bình đi sân bay",
      "taxi tam cốc đi nội bài",
      "taxi tràng an đi nội bài"
    ]
  });
}

export default async function TaxiNinhBinhNoiBaiPage() {
  const [seo, settings] = await Promise.all([getSeoContext(), getPublicSiteSettings()]);
  const breadcrumbSchema = createBreadcrumbSchema(seo.siteUrl, [
    { name: "Trang chủ", path: "/" },
    { name: "Dịch vụ", path: "/dich-vu" },
    { name: "Taxi Ninh Bình đi sân bay Nội Bài", path: "/dich-vu/taxi-ninh-binh-di-san-bay-noi-bai" }
  ]);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <section className="rounded-3xl border border-teal-100 bg-white p-6 shadow-sm sm:p-10">
        <h1 className="text-2xl font-bold text-slate-900 sm:text-4xl">Taxi Ninh Bình đi sân bay Nội Bài</h1>
        <p className="mt-3 max-w-3xl text-sm text-slate-600 sm:text-base">
          Dịch vụ chuyên tuyến Nội Bài dành cho khách bay sớm, khách bay đêm và khách cần khung giờ chính xác. Chúng
          tôi theo dõi thông tin chuyến để hỗ trợ lịch đón phù hợp.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Link
            href={settings.hotlineTel}
            className="inline-flex items-center rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white"
          >
            Gọi đặt xe Nội Bài
          </Link>
          <Link
            href={settings.zaloUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center rounded-lg bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white"
          >
            Chat Zalo ngay
          </Link>
        </div>
      </section>

      <section className="mt-6 grid gap-4 sm:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="text-base font-semibold text-slate-900">Hỗ trợ giờ bay linh hoạt</h2>
          <p className="mt-2 text-sm text-slate-600">
            Có thể khởi hành theo nhiều khung giờ, kể cả sáng sớm và khuya để kịp lịch check-in.
          </p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="text-base font-semibold text-slate-900">Phù hợp nhóm có hành lý</h2>
          <p className="mt-2 text-sm text-slate-600">
            Đề xuất loại xe phù hợp số người và hành lý để hành trình thoải mái, an toàn.
          </p>
        </article>
      </section>

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-slate-900 sm:text-xl">Bạn có thể xem thêm</h2>
        <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
          <Link
            href="/dich-vu/taxi-ninh-binh-di-ha-noi"
            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-teal-700 hover:underline"
          >
            Taxi Ninh Bình đi Hà Nội
          </Link>
          <Link href="/bang-gia" className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-teal-700 hover:underline">
            Bảng giá tham khảo
          </Link>
          <Link href="/faq" className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-teal-700 hover:underline">
            Câu hỏi thường gặp
          </Link>
          <Link href="/#bao-gia" className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-teal-700 hover:underline">
            Điền form báo giá
          </Link>
        </div>
      </section>
    </div>
  );
}
