import type { Metadata } from "next";
import Link from "next/link";

import { createBreadcrumbSchema, createPageMetadata, getSeoContext } from "@/lib/seo";
import { getPublicSiteSettings } from "@/lib/site-settings";

export async function generateMetadata(): Promise<Metadata> {
  return createPageMetadata({
    title: "Giới Thiệu Taxi Ninh Bình",
    description:
      "Taxi Ninh Bình cung cấp dịch vụ taxi và xe du lịch an toàn, đúng giờ tại Ninh Bình. Hỗ trợ tuyến Tam Cốc, Tràng An, Bái Đính, Hà Nội và sân bay Nội Bài.",
    path: "/gioi-thieu",
    keywords: [
      "taxi ninh bình",
      "giới thiệu taxi ninh bình",
      "thuê xe du lịch ninh bình",
      "taxi tam cốc",
      "taxi tràng an",
      "taxi bái đính"
    ]
  });
}

export default async function AboutPage() {
  const [seo, settings] = await Promise.all([getSeoContext(), getPublicSiteSettings()]);
  const breadcrumbSchema = createBreadcrumbSchema(seo.siteUrl, [
    { name: "Trang chủ", path: "/" },
    { name: "Giới thiệu", path: "/gioi-thieu" }
  ]);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <section className="rounded-3xl border border-teal-100 bg-gradient-to-br from-white to-teal-50 p-6 sm:p-10">
        <p className="inline-flex rounded-full bg-teal-100 px-3 py-1 text-xs font-semibold text-teal-700">
          Giới thiệu dịch vụ
        </p>
        <h1 className="mt-3 text-2xl font-bold text-slate-900 sm:text-4xl">Taxi Ninh Bình - Đồng hành mọi hành trình</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">
          Chúng tôi là đơn vị vận chuyển địa phương chuyên phục vụ khách du lịch và khách công tác tại Ninh Bình.
          Dịch vụ tập trung vào tiêu chí đúng giờ, lái xe an toàn, xe sạch và tư vấn rõ giá trước chuyến đi.
        </p>
        <div className="mt-5 flex flex-wrap gap-2 sm:gap-3">
          <Link
            href={settings.hotlineTel}
            className="inline-flex items-center rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            Gọi hotline {settings.hotlineDisplay}
          </Link>
          <Link
            href={settings.zaloUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center rounded-lg bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-700"
          >
            Chat Zalo
          </Link>
        </div>
      </section>

      <section className="mt-6 grid gap-4 sm:grid-cols-3">
        <article className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="text-base font-semibold text-slate-900">Tuyến phục vụ đa dạng</h2>
          <p className="mt-2 text-sm text-slate-600">
            Taxi Ninh Bình nội tỉnh, taxi Ninh Bình đi Hà Nội, taxi Ninh Bình đi sân bay Nội Bài và tuyến đường dài
            theo yêu cầu.
          </p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="text-base font-semibold text-slate-900">Phù hợp khách du lịch</h2>
          <p className="mt-2 text-sm text-slate-600">
            Hỗ trợ lịch trình Tam Cốc, Tràng An, Bái Đính, Hoa Lư, Hang Múa với lịch trình linh hoạt theo nhóm.
          </p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="text-base font-semibold text-slate-900">Chăm sóc 24/7</h2>
          <p className="mt-2 text-sm text-slate-600">
            Đội điều phối sẵn sàng nhận chuyến gấp, chuyến sớm hoặc tối muộn qua điện thoại và Zalo.
          </p>
        </article>
      </section>

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-slate-900 sm:text-xl">Khám phá thêm các trang dịch vụ</h2>
        <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
          <Link href="/dich-vu" className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-teal-700 hover:underline">
            Xem trang tổng hợp dịch vụ taxi Ninh Bình
          </Link>
          <Link
            href="/dich-vu/taxi-ninh-binh-di-ha-noi"
            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-teal-700 hover:underline"
          >
            Dịch vụ taxi Ninh Bình đi Hà Nội
          </Link>
          <Link
            href="/dich-vu/taxi-ninh-binh-di-san-bay-noi-bai"
            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-teal-700 hover:underline"
          >
            Dịch vụ taxi Ninh Bình đi sân bay Nội Bài
          </Link>
          <Link href="/bang-gia" className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-teal-700 hover:underline">
            Tham khảo bảng giá taxi Ninh Bình
          </Link>
        </div>
      </section>
    </div>
  );
}
