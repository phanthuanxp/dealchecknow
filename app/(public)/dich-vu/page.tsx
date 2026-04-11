import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { CarIcon, ChatIcon, PhoneCallIcon, RouteIcon } from "@/components/public/ui-icons";
import { createBreadcrumbSchema, createPageMetadata, getSeoContext } from "@/lib/seo";
import { getServiceListings } from "@/lib/services";
import { getPublicSiteSettings } from "@/lib/site-settings";

const fallbackImage = "/images/services/service-tour.jpg";

export async function generateMetadata(): Promise<Metadata> {
  return createPageMetadata({
    title: "Dịch Vụ Taxi Ninh Bình Theo Tuyến - Đặt Xe Nhanh, Giá Minh Bạch",
    description:
      "Khám phá các tuyến taxi Ninh Bình đi Hà Nội, Nội Bài và chiều ngược lại. Mỗi trang dịch vụ có điểm đón trả, bảng giá tham khảo, FAQ và nút đặt xe nhanh.",
    path: "/dich-vu",
    keywords: [
      "dịch vụ taxi ninh bình",
      "taxi hà nội ninh bình",
      "taxi nội bài ninh bình",
      "taxi ninh bình hà nội",
      "taxi ninh bình nội bài"
    ]
  });
}

export default async function ServicesPage() {
  const [seo, settings, services] = await Promise.all([
    getSeoContext(),
    getPublicSiteSettings(),
    getServiceListings()
  ]);

  const breadcrumbSchema = createBreadcrumbSchema(seo.siteUrl, [
    { name: "Trang chủ", path: "/" },
    { name: "Dịch vụ", path: "/dich-vu" }
  ]);

  return (
    <div className="mx-auto w-[90%] py-6 sm:py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <section className="rounded-3xl border border-teal-100 bg-white p-6 shadow-sm sm:p-10">
        <p className="inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
          <CarIcon className="h-3.5 w-3.5" />
          Dịch vụ trọng tâm
        </p>
        <h1 className="mt-3 text-2xl font-bold leading-tight text-slate-900 sm:text-4xl">
          Danh sách dịch vụ taxi Ninh Bình theo từng tuyến thực tế
        </h1>
        <p className="mt-3 max-w-4xl text-sm leading-7 text-slate-700 sm:text-base">
          Chọn đúng tuyến bạn cần để xem chi tiết điểm đón/trả, giá tham khảo theo loại xe, câu hỏi thường gặp và nút liên
          hệ đặt xe ngay.
        </p>
      </section>

      <section className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {services.map((service) => (
          <article
            key={service.slug}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-teal-200 hover:shadow-md"
          >
            <Link
              href={service.href}
              className="group flex h-full flex-col focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2"
              aria-label={`Xem chi tiết dịch vụ ${service.title}`}
            >
              <div className="relative w-full overflow-hidden rounded-xl border border-slate-200">
                <Image
                  src={service.featuredImage || fallbackImage}
                  alt={service.title}
                  width={960}
                  height={540}
                  className="aspect-[16/9] w-full object-cover transition duration-200 group-hover:scale-[1.01]"
                />
              </div>

              <h2 className="mt-4 text-lg font-semibold leading-snug text-slate-900 transition group-hover:text-teal-700">
                {service.title}
              </h2>
              <p className="mt-2 line-clamp-4 text-sm leading-6 text-slate-600">{service.shortDescription}</p>

              <div className="mt-3">
                <p className="inline-flex rounded-full border border-teal-200 bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-700">
                  Tuyến SEO: {service.keyword}
                </p>
              </div>

              <span className="mt-4 inline-flex w-fit items-center rounded-lg bg-teal-700 px-3.5 py-2 text-sm font-semibold text-white transition group-hover:bg-teal-800">
                Xem chi tiết và đặt xe
              </span>
            </Link>
          </article>
        ))}
      </section>

      {services.length === 0 ? (
        <section className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-sm text-slate-600">
          Hiện chưa có dịch vụ công khai. Vui lòng quay lại sau hoặc liên hệ hotline để được tư vấn trực tiếp.
        </section>
      ) : null}

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <h2 className="inline-flex items-center gap-2 text-lg font-semibold text-slate-900 sm:text-xl">
          <RouteIcon className="h-5 w-5 text-teal-700" />
          Liên kết SEO quan trọng
        </h2>
        <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <Link
              key={`link-${service.slug}`}
              href={service.href}
              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-teal-700 hover:underline"
            >
              Xem dịch vụ {service.keyword}
            </Link>
          ))}
          <Link
            href="/bang-gia"
            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-teal-700 hover:underline"
          >
            Bảng giá taxi Ninh Bình
          </Link>
          <Link
            href="/lien-he"
            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-teal-700 hover:underline"
          >
            Liên hệ đặt xe nhanh
          </Link>
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-teal-200 bg-teal-50 p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-slate-900 sm:text-xl">Cần tư vấn tuyến đi ngay?</h2>
        <p className="mt-2 text-sm text-slate-700">
          Gọi hotline để được điều phối xe nhanh hoặc nhắn Zalo để gửi điểm đón chi tiết và nhận báo giá phù hợp.
        </p>
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
