import type { Metadata } from "next";
import Link from "next/link";

import { FaqSection } from "@/components/public/faq-section";
import { FinalCtaSection } from "@/components/public/final-cta-section";
import { HomeHero } from "@/components/public/home-hero";
import { PricingSection } from "@/components/public/pricing-section";
import { QuoteFormSection } from "@/components/public/quote-form-section";
import { ServicesSection } from "@/components/public/services-section";
import { TestimonialsSection } from "@/components/public/testimonials-section";
import { WhyUsSection } from "@/components/public/why-us-section";
import { getHomePageData } from "@/lib/queries";
import {
  createFaqPageSchema,
  createOrganizationSchema,
  createPageMetadata,
  createTaxiServiceSchema,
  createWebSiteSchema,
  getSeoContext
} from "@/lib/seo";
import { getPublicSiteSettings } from "@/lib/site-settings";

export async function generateMetadata(): Promise<Metadata> {
  return createPageMetadata({
    title: "Taxi Ninh Bình - Dịch Vụ Taxi Và Xe Du Lịch 24/7",
    description:
      "Taxi Ninh Bình chuyên xe nội tỉnh, taxi Ninh Bình đi Hà Nội, đi sân bay Nội Bài và thuê xe du lịch Tam Cốc, Tràng An, Bái Đính. Hỗ trợ 24/7.",
    path: "/",
    keywords: [
      "taxi ninh bình",
      "taxi ninh bình đi hà nội",
      "taxi ninh bình đi sân bay nội bài",
      "thuê xe du lịch ninh bình",
      "taxi tam cốc",
      "taxi tràng an",
      "taxi bái đính"
    ]
  });
}

export default async function HomePage() {
  const [data, settings, seo] = await Promise.all([
    getHomePageData(),
    getPublicSiteSettings(),
    getSeoContext()
  ]);

  const organizationSchema = createOrganizationSchema(seo);
  const webSiteSchema = createWebSiteSchema(seo);
  const taxiServiceSchema = createTaxiServiceSchema(seo);
  const faqSchema = createFaqPageSchema(
    data.faq.items.map((item) => ({
      question: item.question,
      answer: item.answer
    }))
  );

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(taxiServiceSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <HomeHero data={data.hero} hotlineTel={settings.hotlineTel} zaloUrl={settings.zaloUrl} />
      <QuoteFormSection
        data={data.quote}
        hotlineDisplay={settings.hotlineDisplay}
        hotlineTel={settings.hotlineTel}
      />
      <ServicesSection data={data.services} />
      <PricingSection data={data.pricing} hotlineTel={settings.hotlineTel} />
      <WhyUsSection data={data.whyUs} />
      <TestimonialsSection data={data.testimonials} />
      <FaqSection data={data.faq} />
      <FinalCtaSection data={data.finalCta} hotlineTel={settings.hotlineTel} zaloUrl={settings.zaloUrl} />

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-slate-900 sm:text-xl">Khám phá thêm</h2>
        <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
          <Link href="/dich-vu" className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-teal-700 hover:underline">
            Tổng hợp dịch vụ taxi Ninh Bình
          </Link>
          <Link href="/bang-gia" className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-teal-700 hover:underline">
            Bảng giá tham khảo
          </Link>
          <Link href="/blog" className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-teal-700 hover:underline">
            Blog kinh nghiệm đi lại
          </Link>
          <Link href="/lien-he" className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-teal-700 hover:underline">
            Thông tin liên hệ
          </Link>
        </div>
      </section>
    </div>
  );
}
