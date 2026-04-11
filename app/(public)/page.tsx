import type { Metadata } from "next";
import Link from "next/link";

import { BlogTravelSection } from "@/components/public/blog-travel-section";
import { FaqSection } from "@/components/public/faq-section";
import { FinalCtaSection } from "@/components/public/final-cta-section";
import { HomeHero } from "@/components/public/home-hero";
import { PricingSection } from "@/components/public/pricing-section";
import { QuoteFormSection } from "@/components/public/quote-form-section";
import { ServicesSection } from "@/components/public/services-section";
import { TestimonialsSection } from "@/components/public/testimonials-section";
import { WhyUsSection } from "@/components/public/why-us-section";
import { getHomeBlogPosts, getPublicBlogCategories } from "@/lib/blog-queries";
import { getHomePageData } from "@/lib/queries";
import {
  createFaqPageSchema,
  createLocalBusinessSchema,
  createOrganizationSchema,
  createPageMetadata,
  createTaxiServiceSchema,
  createWebSiteSchema,
  getSeoContext
} from "@/lib/seo";
import { getPublicSiteSettings } from "@/lib/site-settings";

export async function generateMetadata(): Promise<Metadata> {
  return createPageMetadata({
    title: "Taxi Ninh Bình - Dịch Vụ Đặt Xe 24/7 Tại Ninh Bình",
    description:
      "Taxi Ninh Bình chuyên xe nội tỉnh, xe đi Hà Nội, đi sân bay Nội Bài và thuê xe du lịch. Đặt xe nhanh, hỗ trợ 24/7, tư vấn rõ lộ trình.",
    path: "/",
    keywords: [
      "taxi ninh bình",
      "taxi hà nội ninh bình",
      "taxi nội bài ninh bình",
      "taxi ninh bình hà nội",
      "taxi ninh bình nội bài",
      "bảng giá taxi ninh bình"
    ]
  });
}

export default async function HomePage() {
  const [data, settings, seo, blogPosts, blogCategories] = await Promise.all([
    getHomePageData(),
    getPublicSiteSettings(),
    getSeoContext(),
    getHomeBlogPosts(6),
    getPublicBlogCategories()
  ]);

  const organizationSchema = createOrganizationSchema(seo);
  const localBusinessSchema = createLocalBusinessSchema(seo);
  const webSiteSchema = createWebSiteSchema(seo);
  const taxiServiceSchema = createTaxiServiceSchema(seo);
  const faqSchema = createFaqPageSchema(
    data.faq.items.map((item) => ({
      question: item.question,
      answer: item.answer
    }))
  );

  const heroData = {
    ...data.hero,
    badge: "Taxi Ninh Bình",
    title: "Taxi Ninh Bình - Dịch Vụ Xe Riêng An Toàn, Đặt Nhanh 24/7",
    description:
      "Chúng tôi tập trung phục vụ taxi ninh bình với quy trình xác nhận nhanh, lái xe thân thiện, xe sạch và tư vấn lộ trình rõ ràng trước chuyến đi."
  };

  return (
    <div className="mx-auto w-[90%] py-6 sm:py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(taxiServiceSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <section className="grid gap-6 lg:grid-cols-2 lg:items-stretch">
        <HomeHero data={heroData} hotlineTel={settings.hotlineTel} zaloUrl={settings.zaloUrl} className="mt-0" />
        <QuoteFormSection data={data.quote} hotlineDisplay={settings.hotlineDisplay} className="mt-0" />
      </section>

      <section className="mt-4 rounded-2xl border border-teal-200 bg-teal-50 p-4">
        <p className="text-sm font-semibold text-slate-900">Tuyến tìm kiếm phổ biến</p>
        <div className="mt-2 grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-5">
          <Link href="/taxi-ha-noi-ninh-binh" className="rounded-lg border border-teal-200 bg-white px-3 py-2 text-teal-700 hover:underline">
            taxi hà nội ninh bình
          </Link>
          <Link href="/taxi-noi-bai-ninh-binh" className="rounded-lg border border-teal-200 bg-white px-3 py-2 text-teal-700 hover:underline">
            taxi nội bài ninh bình
          </Link>
          <Link href="/taxi-ninh-binh-ha-noi" className="rounded-lg border border-teal-200 bg-white px-3 py-2 text-teal-700 hover:underline">
            taxi ninh bình hà nội
          </Link>
          <Link href="/taxi-ninh-binh-noi-bai" className="rounded-lg border border-teal-200 bg-white px-3 py-2 text-teal-700 hover:underline">
            taxi ninh bình nội bài
          </Link>
          <Link href="/bang-gia" className="rounded-lg border border-teal-200 bg-white px-3 py-2 text-teal-700 hover:underline">
            bảng giá taxi ninh bình
          </Link>
        </div>
      </section>

      <ServicesSection data={data.services} />
      <PricingSection data={data.pricing} hotlineTel={settings.hotlineTel} maxRoutes={6} />
      <BlogTravelSection posts={blogPosts} categories={blogCategories} />

      <section className="mt-6 grid gap-6 lg:grid-cols-2 lg:items-stretch">
        <WhyUsSection data={data.whyUs} className="mt-0 h-full" />
        <FaqSection data={data.faq} className="mt-0 h-full" />
      </section>

      <TestimonialsSection data={data.testimonials} />

      <section className="mt-6 grid gap-6 lg:grid-cols-2 lg:items-stretch">
        <FinalCtaSection data={data.finalCta} hotlineTel={settings.hotlineTel} zaloUrl={settings.zaloUrl} />

        <section className="h-full rounded-3xl border border-slate-200 bg-white p-5 sm:p-6">
          <h2 className="text-lg font-semibold text-slate-900 sm:text-xl">Khám phá thêm</h2>
          <p className="mt-2 text-sm text-slate-600">
            Cụm trang SEO chuyên tuyến giúp bạn so sánh nhanh lộ trình và chọn dịch vụ taxi ninh bình phù hợp.
          </p>
          <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
            <Link href="/taxi-ha-noi-ninh-binh" className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-teal-700 hover:underline">
              taxi hà nội ninh bình
            </Link>
            <Link href="/taxi-noi-bai-ninh-binh" className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-teal-700 hover:underline">
              taxi nội bài ninh bình
            </Link>
            <Link href="/taxi-ninh-binh-ha-noi" className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-teal-700 hover:underline">
              taxi ninh bình hà nội
            </Link>
            <Link href="/taxi-ninh-binh-noi-bai" className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-teal-700 hover:underline">
              taxi ninh bình nội bài
            </Link>
            <Link href="/bang-gia" className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-teal-700 hover:underline">
              bảng giá taxi ninh bình
            </Link>
            <Link href="/blog" className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-teal-700 hover:underline">
              Cẩm nang đi lại và du lịch
            </Link>
          </div>
        </section>
      </section>
    </div>
  );
}
