import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { createBreadcrumbSchema, createPageMetadata, getSeoContext } from "@/lib/seo";
import { getPublicSiteSettings } from "@/lib/site-settings";

export async function generateMetadata(): Promise<Metadata> {
  return createPageMetadata({
    title: "Taxi Ninh Bình Đi Hà Nội",
    description:
      "Dịch vụ taxi Ninh Bình đi Hà Nội an toàn, đúng giờ, xe sạch, giá rõ ràng. Hỗ trợ đón tận nơi tại Tam Cốc, Tràng An, Bái Đính và trung tâm TP Ninh Bình.",
    path: "/dich-vu/taxi-ninh-binh-di-ha-noi",
    keywords: [
      "taxi ninh bình đi hà nội",
      "xe ninh bình đi hà nội",
      "đặt taxi ninh bình đi hà nội",
      "taxi tam cốc đi hà nội",
      "taxi tràng an đi hà nội"
    ]
  });
}

export default async function TaxiNinhBinhHaNoiPage() {
  const [seo, settings] = await Promise.all([getSeoContext(), getPublicSiteSettings()]);
  const breadcrumbSchema = createBreadcrumbSchema(seo.siteUrl, [
    { name: "Trang chủ", path: "/" },
    { name: "Dịch vụ", path: "/dich-vu" },
    { name: "Taxi Ninh Bình đi Hà Nội", path: "/dich-vu/taxi-ninh-binh-di-ha-noi" }
  ]);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <section className="rounded-3xl border border-teal-100 bg-white p-6 shadow-sm sm:p-10">
        <h1 className="text-2xl font-bold text-slate-900 sm:text-4xl">Taxi Ninh Bình đi Hà Nội</h1>
        <p className="mt-3 max-w-3xl text-sm text-slate-600 sm:text-base">
          Dịch vụ phù hợp khách đi công tác, đi bệnh viện, đi bến xe, ga tàu hoặc về trung tâm Hà Nội. Xe đón tận nơi
          tại TP Ninh Bình, Tam Cốc, Tràng An, Bái Đính và khu vực lân cận.
        </p>
        <Image
          src="/images/cover-ha-noi.svg"
          alt="Taxi Ninh Bình đi Hà Nội đón trả tận nơi"
          width={1200}
          height={630}
          className="mt-5 h-44 w-full rounded-2xl border border-teal-100 object-cover sm:h-56"
          priority
        />
        <div className="mt-5 flex flex-wrap gap-2">
          <Link
            href={settings.hotlineTel}
            className="inline-flex items-center rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white"
          >
            Gọi đặt xe ngay
          </Link>
          <Link
            href={settings.zaloUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center rounded-lg bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white"
          >
            Nhắn Zalo
          </Link>
        </div>
      </section>

      <section className="mt-6 grid gap-4 sm:grid-cols-3">
        <article className="rounded-2xl border border-slate-200 bg-white p-5">
          <Image
            src="/images/car-sedan.svg"
            alt="Xe sedan tuyến Ninh Bình đi Hà Nội"
            width={420}
            height={240}
            className="h-20 w-full rounded-lg border border-slate-200 object-cover"
          />
          <h2 className="mt-3 text-base font-semibold text-slate-900">Đón đúng giờ</h2>
          <p className="mt-2 text-sm text-slate-600">
            Xác nhận lịch trước chuyến, chủ động liên hệ tài xế để khách yên tâm khởi hành.
          </p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5">
          <Image
            src="/images/car-suv.svg"
            alt="Xe 7 chỗ tuyến Ninh Bình đi Hà Nội"
            width={420}
            height={240}
            className="h-20 w-full rounded-lg border border-slate-200 object-cover"
          />
          <h2 className="mt-3 text-base font-semibold text-slate-900">Giá rõ ràng</h2>
          <p className="mt-2 text-sm text-slate-600">
            Tư vấn chi phí theo loại xe và điểm đón/trả trước khi xác nhận chuyến.
          </p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5">
          <Image
            src="/images/cover-service-overview.svg"
            alt="Lộ trình linh hoạt tuyến Ninh Bình Hà Nội"
            width={420}
            height={240}
            className="h-20 w-full rounded-lg border border-slate-200 object-cover"
          />
          <h2 className="mt-3 text-base font-semibold text-slate-900">Lộ trình linh hoạt</h2>
          <p className="mt-2 text-sm text-slate-600">
            Có thể đón thêm điểm phù hợp, hỗ trợ nhóm gia đình hoặc nhóm công tác.
          </p>
        </article>
      </section>

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-slate-900 sm:text-xl">Liên kết hữu ích</h2>
        <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
          <Link href="/bang-gia" className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-teal-700 hover:underline">
            Xem bảng giá taxi Ninh Bình
          </Link>
          <Link
            href="/dich-vu/taxi-ninh-binh-di-san-bay-noi-bai"
            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-teal-700 hover:underline"
          >
            Dịch vụ taxi Ninh Bình đi sân bay Nội Bài
          </Link>
          <Link href="/dich-vu/taxi-duong-dai" className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-teal-700 hover:underline">
            Dịch vụ taxi đường dài
          </Link>
          <Link href="/#bao-gia" className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-teal-700 hover:underline">
            Điền form báo giá nhanh
          </Link>
        </div>
      </section>
    </div>
  );
}
