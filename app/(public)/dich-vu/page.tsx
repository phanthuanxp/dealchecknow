import type { Metadata } from "next";
import Link from "next/link";

import { createBreadcrumbSchema, createPageMetadata, getSeoContext } from "@/lib/seo";
import { getPublicSiteSettings } from "@/lib/site-settings";

export async function generateMetadata(): Promise<Metadata> {
  return createPageMetadata({
    title: "Dịch Vụ Taxi Và Xe Du Lịch Ninh Bình",
    description:
      "Danh sách dịch vụ Taxi Ninh Bình: taxi đi Hà Nội, taxi đi sân bay Nội Bài, taxi đường dài, thuê xe du lịch Ninh Bình theo lịch trình Tam Cốc, Tràng An, Bái Đính.",
    path: "/dich-vu",
    keywords: [
      "dịch vụ taxi ninh bình",
      "taxi ninh bình đi hà nội",
      "taxi ninh bình đi sân bay nội bài",
      "taxi đường dài",
      "thuê xe du lịch ninh bình"
    ]
  });
}

const serviceCards = [
  {
    title: "Taxi Ninh Bình đi Hà Nội",
    description: "Đưa đón nhanh, đúng giờ cho khách công tác, khách gia đình và khách đi khám chữa bệnh.",
    href: "/dich-vu/taxi-ninh-binh-di-ha-noi"
  },
  {
    title: "Taxi Ninh Bình đi sân bay Nội Bài",
    description: "Theo dõi giờ bay, chủ động lịch trình, hỗ trợ hành lý và đón trả tận nơi.",
    href: "/dich-vu/taxi-ninh-binh-di-san-bay-noi-bai"
  },
  {
    title: "Taxi đường dài",
    description: "Phục vụ tuyến liên tỉnh với xe sạch, tài xế nhiều kinh nghiệm và báo giá minh bạch.",
    href: "/dich-vu/taxi-duong-dai"
  },
  {
    title: "Thuê xe du lịch Ninh Bình",
    description: "Linh hoạt lịch trình tham quan Tam Cốc, Tràng An, Bái Đính, Hoa Lư theo nhu cầu.",
    href: "/dich-vu/thue-xe-du-lich"
  }
];

export default async function ServicesPage() {
  const [seo, settings] = await Promise.all([getSeoContext(), getPublicSiteSettings()]);
  const breadcrumbSchema = createBreadcrumbSchema(seo.siteUrl, [
    { name: "Trang chủ", path: "/" },
    { name: "Dịch vụ", path: "/dich-vu" }
  ]);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <section className="rounded-3xl border border-teal-100 bg-white p-6 shadow-sm sm:p-10">
        <p className="inline-flex rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">Dịch vụ nổi bật</p>
        <h1 className="mt-3 text-2xl font-bold leading-tight text-slate-900 sm:text-4xl">Dịch vụ taxi Ninh Bình cho khách địa phương và khách du lịch</h1>
        <p className="mt-3 max-w-3xl text-sm text-slate-600 sm:text-base">
          Taxi Ninh Bình cung cấp giải pháp di chuyển linh hoạt theo giờ, theo chuyến và theo tuyến cố định. Chúng
          tôi ưu tiên trải nghiệm an toàn, đúng giờ và hỗ trợ nhanh qua hotline/Zalo.
        </p>
      </section>

      <section className="mt-6 grid gap-4 sm:grid-cols-2">
        {serviceCards.map((service) => (
          <article key={service.href} className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="text-lg font-semibold text-slate-900">{service.title}</h2>
            <p className="mt-2 text-sm text-slate-600">{service.description}</p>
            <Link href={service.href} className="mt-4 inline-flex text-sm font-semibold text-teal-700 hover:underline">
              Xem chi tiết dịch vụ
            </Link>
          </article>
        ))}
      </section>

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-slate-900 sm:text-xl">Tuyến điểm phổ biến tại Ninh Bình</h2>
        <div className="mt-3 grid gap-2 text-sm text-slate-700 sm:grid-cols-2">
          <p className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">Taxi Tam Cốc</p>
          <p className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">Taxi Tràng An</p>
          <p className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">Taxi Bái Đính</p>
          <p className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">Taxi Hoa Lư</p>
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-teal-200 bg-teal-50 p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-slate-900 sm:text-xl">Cần xe ngay hôm nay?</h2>
        <p className="mt-2 text-sm text-slate-700">
          Gọi trực tiếp để nhận báo giá theo hành trình hoặc điền form báo giá nhanh tại trang chủ.
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
          <Link href="/#bao-gia" className="inline-flex items-center rounded-lg border border-teal-300 px-4 py-2.5 text-sm font-semibold text-teal-700">
            Mở form báo giá
          </Link>
        </div>
      </section>
    </div>
  );
}
