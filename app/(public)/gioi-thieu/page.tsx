import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { CarIcon, ChatIcon, CheckCircleIcon, MapPinIcon, PhoneCallIcon, RouteIcon } from "@/components/public/ui-icons";
import {
  createBreadcrumbSchema,
  createLocalBusinessSchema,
  createPageMetadata,
  createTaxiServiceSchema,
  getSeoContext
} from "@/lib/seo";
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

const trustItems = [
  "Đội xe phục vụ nhiều nhu cầu: cá nhân, gia đình, khách đoàn",
  "Điều phối 24/7, xác nhận nhanh qua hotline và Zalo",
  "Tài xế quen tuyến du lịch Ninh Bình và tuyến liên tỉnh",
  "Báo giá rõ ràng trước chuyến, hạn chế phát sinh"
];

export async function generateMetadata(): Promise<Metadata> {
  return createPageMetadata({
    title: "Giới Thiệu Taxi Ninh Bình - Dịch Vụ Xe Riêng 24/7",
    description:
      "Giới thiệu Taxi Ninh Bình: đội xe phục vụ nội tỉnh, đi Hà Nội, đi sân bay Nội Bài và thuê xe du lịch. Điều phối nhanh, hỗ trợ 24/7.",
    path: "/gioi-thieu",
    keywords: [
      "giới thiệu taxi ninh bình",
      "dịch vụ taxi ninh bình",
      "taxi ninh bình hà nội",
      "taxi ninh bình nội bài",
      "thuê xe du lịch ninh bình"
    ]
  });
}

export default async function AboutPage() {
  const [seo, settings] = await Promise.all([getSeoContext(), getPublicSiteSettings()]);
  const breadcrumbSchema = createBreadcrumbSchema(seo.siteUrl, [
    { name: "Trang chủ", path: "/" },
    { name: "Giới thiệu", path: "/gioi-thieu" }
  ]);
  const localBusinessSchema = createLocalBusinessSchema(seo);
  const taxiServiceSchema = createTaxiServiceSchema(seo);

  return (
    <div className="mx-auto w-[90%] py-6 sm:py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(taxiServiceSchema) }} />

      <section className="rounded-3xl border border-teal-100 bg-gradient-to-br from-white to-teal-50 p-6 sm:p-10">
        <p className="inline-flex items-center gap-2 rounded-full bg-teal-100 px-3 py-1 text-xs font-semibold text-teal-700">
          <CarIcon className="h-3.5 w-3.5" />
          Giới thiệu dịch vụ
        </p>
        <h1 className="mt-3 text-2xl font-bold text-slate-900 sm:text-4xl">Taxi Ninh Bình đồng hành mọi hành trình của bạn</h1>
        <p className="mt-3 max-w-4xl text-sm leading-7 text-slate-700 sm:text-base">
          Taxi Ninh Bình là đơn vị vận hành dịch vụ xe riêng và xe du lịch tại khu vực Ninh Bình với mục tiêu phục vụ ổn định, đúng giờ và minh bạch.
          Chúng tôi tập trung vào trải nghiệm thực tế của khách: xác nhận nhanh, hỗ trợ rõ thông tin trước chuyến, tài xế thân thiện và xe sạch. Dịch vụ
          phù hợp cho cả khách đi công tác, khách gia đình và khách đoàn du lịch theo lịch trình riêng.
        </p>
        <Image
          src="/images/services/service-tour.jpg"
          alt="Taxi Ninh Bình phục vụ khách du lịch và khách gia đình"
          width={1200}
          height={630}
          className="mt-5 h-48 w-full rounded-2xl border border-teal-100 object-cover sm:h-64"
          priority
        />
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-3">
        <article className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="inline-flex items-center gap-2 text-base font-semibold text-slate-900">
            <CheckCircleIcon className="h-4.5 w-4.5 text-teal-700" />
            Giờ phục vụ
          </h2>
          <p className="mt-2 text-sm text-slate-700">Phục vụ 24/7 tất cả các ngày trong tuần, kể cả lễ và Tết theo khả năng điều phối xe.</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="inline-flex items-center gap-2 text-base font-semibold text-slate-900">
            <MapPinIcon className="h-4.5 w-4.5 text-teal-700" />
            Khu vực hoạt động
          </h2>
          <p className="mt-2 text-sm text-slate-700">Tập trung tại Ninh Bình và các tuyến liên vùng phổ biến như Hà Nội, sân bay Nội Bài.</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="inline-flex items-center gap-2 text-base font-semibold text-slate-900">
            <RouteIcon className="h-4.5 w-4.5 text-teal-700" />
            Tuyến chính
          </h2>
          <p className="mt-2 text-sm text-slate-700">Nội tỉnh Ninh Bình, tuyến đi Hà Nội, tuyến đi Nội Bài và các tuyến thuê xe du lịch theo ngày.</p>
        </article>
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <h2 className="text-lg font-semibold text-slate-900 sm:text-xl">Tín hiệu tin cậy từ dịch vụ thực tế</h2>
          <ul className="mt-3 space-y-2 text-sm text-slate-700">
            {trustItems.map((item) => (
              <li key={item} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                {item}
              </li>
            ))}
          </ul>

          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <h3 className="text-sm font-semibold text-slate-900">Bản đồ khu vực phục vụ</h3>
            <p className="mt-2 text-sm text-slate-600">
              Theo dõi nhanh vùng phục vụ trọng điểm tại Ninh Bình để chọn điểm đón/trả phù hợp trước khi đặt xe.
            </p>
            <div className="mt-3 overflow-hidden rounded-lg border border-slate-200 bg-white">
              <iframe
                title="Bản đồ khu vực phục vụ Taxi Ninh Bình"
                src="https://www.google.com/maps?q=Ninh%20Binh%20Vietnam&output=embed"
                loading="lazy"
                className="h-52 w-full"
              />
            </div>
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <h2 className="text-lg font-semibold text-slate-900 sm:text-xl">Bộ ảnh phương tiện và dịch vụ thực tế</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <Image
              src="/images/services/service-ha-noi.webp"
              alt="Ảnh xe phục vụ tuyến Ninh Bình Hà Nội"
              width={520}
              height={280}
              className="h-32 w-full rounded-xl border border-slate-200 object-cover"
            />
            <Image
              src="/images/services/service-noi-bai.jpg"
              alt="Ảnh xe phục vụ tuyến Ninh Bình Nội Bài"
              width={520}
              height={280}
              className="h-32 w-full rounded-xl border border-slate-200 object-cover"
            />
            <Image
              src="/images/services/service-tour.jpg"
              alt="Ảnh xe du lịch tuyến Tam Cốc Tràng An"
              width={520}
              height={280}
              className="h-32 w-full rounded-xl border border-slate-200 object-cover sm:col-span-2"
            />
          </div>
        </article>
      </section>

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-slate-900 sm:text-xl">Khu vực phục vụ chi tiết</h2>
        <div className="mt-3 grid gap-2 text-sm text-slate-700 sm:grid-cols-2 lg:grid-cols-3">
          {serviceAreas.map((area) => (
            <p key={area} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
              {area}
            </p>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-teal-200 bg-teal-50 p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-slate-900 sm:text-xl">Liên hệ nhanh</h2>
        <div className="mt-3 grid gap-2 text-sm text-slate-700 sm:grid-cols-2">
          <p className="rounded-lg border border-teal-200 bg-white px-3 py-2">
            <strong>Hotline:</strong> {settings.hotlineDisplay}
          </p>
          <p className="rounded-lg border border-teal-200 bg-white px-3 py-2">
            <strong>Email:</strong> {settings.email}
          </p>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
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
