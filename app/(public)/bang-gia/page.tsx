import type { Metadata } from "next";
import Link from "next/link";

import { PricingSection } from "@/components/public/pricing-section";
import { ChatIcon, PhoneCallIcon, RouteIcon } from "@/components/public/ui-icons";
import { getPublicPricingItems, getPublicPricingSectionMeta } from "@/lib/public-content";
import { createBreadcrumbSchema, createPageMetadata, getSeoContext } from "@/lib/seo";
import { getPublicSiteSettings } from "@/lib/site-settings";

export async function generateMetadata(): Promise<Metadata> {
  return createPageMetadata({
    title: "Bảng Giá Taxi Ninh Bình",
    description:
      "Bảng giá taxi Ninh Bình tham khảo cho các tuyến phổ biến: Ninh Bình đi Hà Nội, Ninh Bình đi sân bay Nội Bài, Tam Cốc, Tràng An, Bái Đính.",
    path: "/bang-gia",
    keywords: [
      "bảng giá taxi ninh bình",
      "giá taxi ninh bình đi hà nội",
      "giá taxi ninh bình đi sân bay nội bài",
      "giá thuê xe du lịch ninh bình"
    ]
  });
}

export default async function PricingPage() {
  const [pricingItems, pricingMeta, seo, settings] = await Promise.all([
    getPublicPricingItems(),
    getPublicPricingSectionMeta(),
    getSeoContext(),
    getPublicSiteSettings()
  ]);

  const breadcrumbSchema = createBreadcrumbSchema(seo.siteUrl, [
    { name: "Trang chủ", path: "/" },
    { name: "Bảng giá", path: "/bang-gia" }
  ]);

  return (
    <div className="mx-auto w-[90%] py-6 sm:py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <section className="rounded-3xl border border-teal-100 bg-white p-6 shadow-sm sm:p-10">
        <p className="inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
          <RouteIcon className="h-3.5 w-3.5" />
          Bảng giá tham khảo
        </p>
        <h1 className="mt-3 text-2xl font-bold text-slate-900 sm:text-4xl">
          Bảng giá taxi Ninh Bình theo tuyến phổ biến
        </h1>
        <p className="mt-3 max-w-3xl text-sm text-slate-600 sm:text-base">
          Mức giá dưới đây giúp bạn ước lượng chi phí trước chuyến đi. Giá thực tế có thể thay đổi theo thời điểm,
          điểm đón và yêu cầu phát sinh của từng lịch trình.
        </p>
      </section>

      <PricingSection
        data={{
          title: pricingMeta.title,
          description: pricingMeta.description,
          note: pricingMeta.note,
          items: pricingItems
        }}
        hotlineTel={settings.hotlineTel}
      />

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-slate-900 sm:text-xl">Bạn có thể xem thêm</h2>
        <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
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
          <Link
            href="/dich-vu/thue-xe-du-lich"
            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-teal-700 hover:underline"
          >
            Thuê xe du lịch Ninh Bình
          </Link>
          <Link
            href="/#bao-gia"
            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-teal-700 hover:underline"
          >
            Gửi yêu cầu báo giá chi tiết
          </Link>
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-teal-200 bg-teal-50 p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-slate-900 sm:text-xl">Cần xác nhận giá nhanh?</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link
            href={settings.hotlineTel}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white"
          >
            <PhoneCallIcon className="h-4 w-4" />
            Gọi {settings.hotlineDisplay}
          </Link>
          <Link
            href={settings.zaloUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-lg bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white"
          >
            <ChatIcon className="h-4 w-4" />
            Chat Zalo
          </Link>
        </div>
      </section>
    </div>
  );
}
