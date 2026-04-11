import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { ChatIcon, MailIcon, MapPinIcon, PhoneCallIcon, RouteIcon } from "@/components/public/ui-icons";
import { createBreadcrumbSchema, createLocalBusinessSchema, createPageMetadata, getSeoContext } from "@/lib/seo";
import { getPublicSiteSettings } from "@/lib/site-settings";

const serviceAreas = [
  "TP Ninh Bình",
  "Tam Cốc",
  "Tràng An",
  "Bái Đính",
  "Hoa Lư",
  "Gia Viễn",
  "Ninh Hải",
  "Kim Sơn",
  "Hà Nội",
  "Sân bay Nội Bài"
];

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getPublicSiteSettings();

  return createPageMetadata({
    title: `Liên Hệ ${settings.siteName} - Đặt Xe Nhanh 24/7`,
    description: `Liên hệ ${settings.siteName} qua hotline ${settings.hotlineDisplay}, Zalo ${settings.zaloNumber} hoặc email ${settings.email} để đặt xe nhanh.`,
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
  const localBusinessSchema = createLocalBusinessSchema(seo);

  return (
    <div className="mx-auto w-[90%] py-6 sm:py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }} />

      <section className="rounded-3xl border border-teal-100 bg-white p-6 shadow-sm sm:p-10">
        <h1 className="text-2xl font-bold text-slate-900 sm:text-4xl">Liên hệ {settings.siteName}</h1>
        <p className="mt-3 max-w-4xl text-sm leading-7 text-slate-700 sm:text-base">
          Bạn cần đặt xe gấp, tư vấn lộ trình hoặc xác nhận bảng giá theo tuyến cụ thể? Hãy liên hệ trực tiếp với đội điều phối để được hỗ trợ nhanh.
          Chúng tôi phục vụ 24/7 cho cả tuyến nội tỉnh Ninh Bình và tuyến liên tỉnh đi Hà Nội, sân bay Nội Bài.
        </p>
        <Image
          src="/images/services/service-noi-bai.jpg"
          alt="Liên hệ Taxi Ninh Bình qua hotline, Zalo và email"
          width={1200}
          height={630}
          className="mt-5 h-48 w-full rounded-2xl border border-teal-100 object-cover sm:h-64"
          priority
        />
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-3">
        <article className="rounded-2xl border border-slate-200 bg-white p-5">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
            <PhoneCallIcon className="h-4.5 w-4.5" />
          </span>
          <h2 className="mt-3 text-base font-semibold text-slate-900">Hotline</h2>
          <p className="mt-2 text-sm text-slate-600">Xác nhận chuyến nhanh, hỗ trợ lịch gấp và chuyến ngoài giờ.</p>
          <Link href={settings.hotlineTel} className="mt-3 inline-flex text-sm font-semibold text-emerald-700 hover:underline">
            {settings.hotlineDisplay}
          </Link>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-sky-100 text-sky-700">
            <ChatIcon className="h-4.5 w-4.5" />
          </span>
          <h2 className="mt-3 text-base font-semibold text-slate-900">Zalo</h2>
          <p className="mt-2 text-sm text-slate-600">Phù hợp gửi vị trí đón, lộ trình và điều chỉnh thông tin chuyến.</p>
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
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-teal-100 text-teal-700">
            <MailIcon className="h-4.5 w-4.5" />
          </span>
          <h2 className="mt-3 text-base font-semibold text-slate-900">Email</h2>
          <p className="mt-2 text-sm text-slate-600">Kênh liên hệ cho đối tác, hợp đồng dài hạn và yêu cầu doanh nghiệp.</p>
          <Link href={`mailto:${settings.email}`} className="mt-3 inline-flex text-sm font-semibold text-teal-700 hover:underline">
            {settings.email}
          </Link>
        </article>
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <h2 className="inline-flex items-center gap-2 text-lg font-semibold text-slate-900 sm:text-xl">
            <MapPinIcon className="h-5 w-5 text-teal-700" />
            Khu vực vận hành chi tiết
          </h2>
          <div className="mt-3 grid gap-2 text-sm text-slate-700 sm:grid-cols-2">
            {serviceAreas.map((area) => (
              <p key={area} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                {area}
              </p>
            ))}
          </div>
          <p className="mt-3 text-sm text-slate-600">
            Nếu điểm đón ngoài khu vực trên, bạn vẫn có thể liên hệ để được điều phối phương án phù hợp.
          </p>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <h2 className="inline-flex items-center gap-2 text-lg font-semibold text-slate-900 sm:text-xl">
            <RouteIcon className="h-5 w-5 text-teal-700" />
            Thông tin tin cậy doanh nghiệp
          </h2>
          <ul className="mt-3 space-y-2 text-sm text-slate-700">
            <li className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">Giờ phục vụ: 24/7 (tất cả các ngày trong tuần)</li>
            <li className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">Kênh xác nhận chính: Hotline và Zalo</li>
            <li className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">Dịch vụ chính: Taxi nội tỉnh, liên tỉnh, xe du lịch</li>
            <li className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">Phương thức liên hệ hỗ trợ: Điện thoại, Zalo, Email</li>
          </ul>

          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <h3 className="text-sm font-semibold text-slate-900">Google Map khu vực phục vụ (placeholder)</h3>
            <p className="mt-2 text-sm text-slate-600">Vị trí dành cho bản đồ nhúng để khách kiểm tra khu vực đón/trả xe nhanh hơn.</p>
          </div>
        </article>
      </section>

      <section className="mt-6 rounded-2xl border border-teal-200 bg-teal-50 p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-slate-900 sm:text-xl">Nút hành động nhanh</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href={settings.hotlineTel}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white"
          >
            <PhoneCallIcon className="h-4 w-4" />
            Gọi ngay
          </Link>
          <Link
            href={settings.zaloUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-lg bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white"
          >
            <ChatIcon className="h-4 w-4" />
            Nhắn Zalo
          </Link>
          <Link
            href="/bang-gia"
            className="inline-flex items-center rounded-lg border border-teal-300 bg-white px-4 py-2.5 text-sm font-semibold text-teal-700"
          >
            Xem bảng giá taxi ninh bình
          </Link>
        </div>
      </section>
    </div>
  );
}
