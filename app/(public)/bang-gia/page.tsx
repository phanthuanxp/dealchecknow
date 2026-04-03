import type { Metadata } from "next";
import Link from "next/link";

import { getPublicPricingItems } from "@/lib/public-content";
import { createBreadcrumbSchema, createPageMetadata, getSeoContext } from "@/lib/seo";
import { getPublicSiteSettings } from "@/lib/site-settings";

export async function generateMetadata(): Promise<Metadata> {
  return createPageMetadata({
    title: "Bảng Giá Taxi Ninh Bình",
    description:
      "Bảng giá tham khảo dịch vụ taxi Ninh Bình: taxi Ninh Bình đi Hà Nội, taxi Ninh Bình đi sân bay Nội Bài, taxi Tam Cốc, Tràng An, Bái Đính.",
    path: "/bang-gia",
    keywords: [
      "bảng giá taxi ninh bình",
      "giá taxi ninh bình đi hà nội",
      "giá taxi ninh bình đi sân bay nội bài",
      "giá thuê xe du lịch ninh bình"
    ]
  });
}

function formatCurrency(price: number, currency: string) {
  if (currency.toUpperCase() === "VND") {
    return `${new Intl.NumberFormat("vi-VN").format(price)}đ`;
  }
  return `${new Intl.NumberFormat("vi-VN").format(price)} ${currency}`;
}

export default async function PricingPage() {
  const [pricingItems, seo, settings] = await Promise.all([
    getPublicPricingItems(),
    getSeoContext(),
    getPublicSiteSettings()
  ]);
  const breadcrumbSchema = createBreadcrumbSchema(seo.siteUrl, [
    { name: "Trang chủ", path: "/" },
    { name: "Bảng giá", path: "/bang-gia" }
  ]);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <section className="rounded-3xl border border-teal-100 bg-white p-6 shadow-sm sm:p-10">
        <h1 className="text-2xl font-bold text-slate-900 sm:text-4xl">Bảng giá taxi Ninh Bình tham khảo</h1>
        <p className="mt-3 max-w-3xl text-sm text-slate-600 sm:text-base">
          Mức giá dưới đây giúp bạn ước lượng chi phí trước chuyến đi. Giá thực tế có thể thay đổi theo thời điểm,
          loại xe, điểm đón và yêu cầu cụ thể.
        </p>
      </section>

      {pricingItems.length === 0 ? (
        <section className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-sm text-slate-600">
          Chưa có dữ liệu bảng giá. Vui lòng gọi hotline để nhận tư vấn và báo giá nhanh.
        </section>
      ) : (
        <section className="mt-6 grid gap-3 sm:grid-cols-2">
          {pricingItems.map((item) => (
            <article
              key={item.id}
              className={`rounded-2xl border p-4 ${
                item.isPopular ? "border-teal-300 bg-teal-50" : "border-slate-200 bg-white"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-base font-semibold text-slate-900">{item.routeName}</h2>
                {item.isPopular ? (
                  <span className="rounded-full bg-teal-700 px-2 py-1 text-xs font-semibold text-white">Phổ biến</span>
                ) : null}
              </div>
              <p className="mt-2 text-sm text-slate-600">
                {item.fromLocation} → {item.toLocation}
              </p>
              <p className="mt-1 text-sm text-slate-600">{item.vehicleType}</p>
              <p className="mt-3 text-xl font-bold text-teal-800">{formatCurrency(item.price, item.currency)}</p>
              <p className="text-xs text-slate-500">/ {item.unit}</p>
              {item.description ? <p className="mt-2 text-sm text-slate-600">{item.description}</p> : null}
            </article>
          ))}
        </section>
      )}

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
          <Link href="/#bao-gia" className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-teal-700 hover:underline">
            Gửi yêu cầu báo giá chi tiết
          </Link>
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-teal-200 bg-teal-50 p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-slate-900 sm:text-xl">Cần xác nhận giá nhanh?</h2>
        <div className="mt-3 flex flex-wrap gap-2">
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
        </div>
      </section>
    </div>
  );
}
