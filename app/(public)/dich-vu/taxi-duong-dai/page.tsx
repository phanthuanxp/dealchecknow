import type { Metadata } from "next";
import Link from "next/link";

import { createBreadcrumbSchema, createPageMetadata, getSeoContext } from "@/lib/seo";
import { getPublicSiteSettings } from "@/lib/site-settings";

export async function generateMetadata(): Promise<Metadata> {
  return createPageMetadata({
    title: "Taxi Đường Dài Từ Ninh Bình",
    description:
      "Dịch vụ taxi đường dài từ Ninh Bình đi các tỉnh thành với lịch trình linh hoạt, tài xế kinh nghiệm, xe sạch và báo giá trước chuyến đi.",
    path: "/dich-vu/taxi-duong-dai",
    keywords: [
      "taxi đường dài ninh bình",
      "xe ninh bình đi tỉnh",
      "taxi liên tỉnh từ ninh bình",
      "taxi ninh bình đi hà nội",
      "thuê xe đường dài"
    ]
  });
}

export default async function TaxiDuongDaiPage() {
  const [seo, settings] = await Promise.all([getSeoContext(), getPublicSiteSettings()]);
  const breadcrumbSchema = createBreadcrumbSchema(seo.siteUrl, [
    { name: "Trang chủ", path: "/" },
    { name: "Dịch vụ", path: "/dich-vu" },
    { name: "Taxi đường dài", path: "/dich-vu/taxi-duong-dai" }
  ]);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <section className="rounded-3xl border border-teal-100 bg-white p-6 shadow-sm sm:p-10">
        <h1 className="text-2xl font-bold text-slate-900 sm:text-4xl">Taxi đường dài từ Ninh Bình</h1>
        <p className="mt-3 max-w-3xl text-sm text-slate-600 sm:text-base">
          Chuyên tuyến liên tỉnh cho khách gia đình, khách công tác và nhóm du lịch cần xe riêng. Lịch trình được tư
          vấn chi tiết theo thời gian đi, điểm dừng và số lượng hành khách.
        </p>
      </section>

      <section className="mt-6 grid gap-4 sm:grid-cols-3">
        <article className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="text-base font-semibold text-slate-900">Tư vấn lộ trình</h2>
          <p className="mt-2 text-sm text-slate-600">
            Hỗ trợ gợi ý cung đường và khung giờ xuất phát để tối ưu thời gian di chuyển.
          </p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="text-base font-semibold text-slate-900">Chủ động điểm dừng</h2>
          <p className="mt-2 text-sm text-slate-600">
            Có thể bố trí dừng nghỉ hợp lý theo nhu cầu thực tế của hành khách.
          </p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="text-base font-semibold text-slate-900">Cam kết an toàn</h2>
          <p className="mt-2 text-sm text-slate-600">
            Lái xe giàu kinh nghiệm đường dài, thái độ lịch sự và hỗ trợ tận tình.
          </p>
        </article>
      </section>

      <section className="mt-6 rounded-2xl border border-teal-200 bg-teal-50 p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-slate-900 sm:text-xl">Đặt chuyến đường dài nhanh</h2>
        <p className="mt-2 text-sm text-slate-700">
          Gọi hotline để nhận báo giá theo tuyến cụ thể hoặc để lại thông tin qua form báo giá.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href={settings.hotlineTel}
            className="inline-flex items-center rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white"
          >
            Gọi {settings.hotlineDisplay}
          </Link>
          <Link
            href={settings.zaloUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center rounded-lg bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white"
          >
            Chat Zalo
          </Link>
          <Link
            href="/#bao-gia"
            className="inline-flex items-center rounded-lg border border-teal-300 bg-white px-4 py-2.5 text-sm font-semibold text-teal-700"
          >
            Gửi yêu cầu báo giá
          </Link>
          <Link href="/bang-gia" className="inline-flex items-center rounded-lg border border-teal-300 bg-white px-4 py-2.5 text-sm font-semibold text-teal-700">
            Xem bảng giá
          </Link>
        </div>
      </section>
    </div>
  );
}
