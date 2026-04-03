import { Prisma } from "@prisma/client";

import prisma from "@/lib/prisma";

type HomeSectionKey =
  | "home-hero"
  | "home-quote"
  | "home-services"
  | "home-pricing"
  | "home-why-us"
  | "home-testimonials"
  | "home-faq"
  | "home-final-cta";

type HomeSectionWithBlocks = {
  id: string;
  key: string;
  title: string | null;
  description: string | null;
  blocks: Array<{
    id: string;
    blockKey: string;
    title: string | null;
    content: Prisma.JsonValue | null;
    sortOrder: number;
  }>;
};

export type HeroData = {
  badge: string;
  title: string;
  description: string;
  primaryCtaText: string;
  secondaryCtaText: string;
  highlights: string[];
};

export type QuoteSectionData = {
  title: string;
  description: string;
  note: string;
};

export type ServiceItem = {
  title: string;
  description: string;
};

export type GenericSectionWithItems = {
  title: string;
  description: string;
  items: ServiceItem[];
};

export type PricingData = {
  title: string;
  description: string;
  note: string;
  items: Array<{
    id: string;
    routeName: string;
    fromLocation: string;
    toLocation: string;
    vehicleType: string;
    price: number;
    currency: string;
    unit: string;
    description: string | null;
    isPopular: boolean;
  }>;
};

export type TestimonialData = {
  title: string;
  description: string;
  items: Array<{
    id: string;
    customerName: string;
    content: string;
    location: string | null;
    serviceName: string | null;
    rating: number;
  }>;
};

export type FaqData = {
  title: string;
  description: string;
  items: Array<{
    id: string;
    question: string;
    answer: string;
    slug: string;
  }>;
};

export type FinalCtaData = {
  title: string;
  description: string;
  primaryCtaText: string;
  secondaryCtaText: string;
};

export type HomePageData = {
  hero: HeroData;
  quote: QuoteSectionData;
  services: GenericSectionWithItems;
  pricing: PricingData;
  whyUs: GenericSectionWithItems;
  testimonials: TestimonialData;
  faq: FaqData;
  finalCta: FinalCtaData;
};

const fallbackHomePageData: HomePageData = {
  hero: {
    badge: "Taxi Ninh Bình",
    title: "Dịch vụ taxi và xe du lịch Ninh Bình an toàn, đúng giờ",
    description:
      "Hỗ trợ đặt xe 24/7 cho khách địa phương và khách du lịch. Đón nhanh, tài xế lịch sự, xe sạch.",
    primaryCtaText: "Gọi ngay 0345 07 6789",
    secondaryCtaText: "Chat Zalo",
    highlights: [
      "Có mặt nhanh trong khu vực Ninh Bình",
      "Giá minh bạch trước chuyến đi",
      "Hỗ trợ hotline và Zalo 24/7"
    ]
  },
  quote: {
    title: "Nhận báo giá nhanh theo lộ trình",
    description: "Điền thông tin để nhận báo giá phù hợp trong thời gian sớm nhất.",
    note: "Bạn cũng có thể gọi trực tiếp 0345 07 6789 để được tư vấn ngay."
  },
  services: {
    title: "Dịch vụ chính",
    description: "Các dịch vụ di chuyển phổ biến tại Ninh Bình.",
    items: [
      {
        title: "Taxi nội tỉnh Ninh Bình",
        description: "Đón nhanh tại trung tâm, khách sạn, ga tàu và điểm du lịch."
      },
      {
        title: "Đưa đón sân bay",
        description: "Linh hoạt thời gian, hỗ trợ hành lý và theo dõi lịch bay."
      },
      {
        title: "Xe du lịch theo chuyến",
        description: "Phù hợp lịch trình Tam Cốc, Tràng An, Bái Đính, Hoa Lư."
      }
    ]
  },
  pricing: {
    title: "Tuyến phổ biến / Bảng giá tham khảo",
    description: "Giá tham khảo cho một số lộ trình thường dùng.",
    note: "Giá thực tế có thể thay đổi theo thời điểm và yêu cầu cụ thể.",
    items: [
      {
        id: "fallback-price-1",
        routeName: "Ninh Bình City → Tam Cốc",
        fromLocation: "Ninh Bình City",
        toLocation: "Tam Cốc",
        vehicleType: "Sedan 4 chỗ",
        price: 200000,
        currency: "VND",
        unit: "trip",
        description: "Đón tận nơi, trả tận điểm du lịch",
        isPopular: true
      }
    ]
  },
  whyUs: {
    title: "Lý do chọn chúng tôi",
    description: "Cam kết dịch vụ minh bạch và hỗ trợ tận tâm.",
    items: [
      {
        title: "Đón đúng giờ",
        description: "Xác nhận và theo dõi lịch trình để đảm bảo đúng kế hoạch."
      },
      {
        title: "Xe sạch, tài xế lịch sự",
        description: "Trải nghiệm thoải mái cho khách cá nhân và gia đình."
      },
      {
        title: "Giá rõ ràng",
        description: "Tư vấn chi phí trước chuyến, không phát sinh bất ngờ."
      }
    ]
  },
  testimonials: {
    title: "Khách hàng nói gì về Taxi Ninh Bình",
    description: "Phản hồi thực tế từ khách đã đi xe.",
    items: [
      {
        id: "fallback-review-1",
        customerName: "Khách hàng Taxi Ninh Bình",
        content: "Dịch vụ nhanh, tài xế thân thiện và hỗ trợ rất nhiệt tình.",
        location: "Ninh Bình",
        serviceName: "Taxi nội tỉnh",
        rating: 5
      }
    ]
  },
  faq: {
    title: "Câu hỏi thường gặp",
    description: "Giải đáp nhanh trước khi đặt xe.",
    items: [
      {
        id: "fallback-faq-1",
        question: "Làm sao để đặt xe nhanh?",
        answer: "Bạn có thể gọi trực tiếp hotline 0345 07 6789 hoặc nhắn Zalo để được hỗ trợ ngay.",
        slug: "lam-sao-dat-xe"
      }
    ]
  },
  finalCta: {
    title: "Sẵn sàng đặt xe ngay hôm nay?",
    description: "Liên hệ ngay để được điều phối xe phù hợp với nhu cầu của bạn.",
    primaryCtaText: "Gọi hotline 0345 07 6789",
    secondaryCtaText: "Nhắn Zalo"
  }
};

function asRecord(value: Prisma.JsonValue | null | undefined): Record<string, unknown> | null {
  if (!value || Array.isArray(value) || typeof value !== "object") {
    return null;
  }
  return value as Record<string, unknown>;
}

function textFromRecord(record: Record<string, unknown> | null, key = "text"): string | undefined {
  const value = record?.[key];
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function textFromBlock(block: HomeSectionWithBlocks["blocks"][number] | undefined, key = "text") {
  if (!block) {
    return undefined;
  }
  return textFromRecord(asRecord(block.content), key) ?? undefined;
}

function blockByKey(section: HomeSectionWithBlocks | undefined, blockKey: string) {
  return section?.blocks.find((block) => block.blockKey === blockKey);
}

function blocksByPrefix(section: HomeSectionWithBlocks | undefined, prefix: string) {
  return (section?.blocks ?? []).filter((block) => block.blockKey.startsWith(prefix));
}

export async function getHomePageData(): Promise<HomePageData> {
  if (!process.env.DATABASE_URL) {
    return fallbackHomePageData;
  }

  try {
    const targetKeys: HomeSectionKey[] = [
      "home-hero",
      "home-quote",
      "home-services",
      "home-pricing",
      "home-why-us",
      "home-testimonials",
      "home-faq",
      "home-final-cta"
    ];

    const [sections, pricingItems, faqs, testimonials] = await Promise.all([
      prisma.siteSection.findMany({
        where: {
          key: { in: targetKeys },
          isActive: true
        },
        include: {
          blocks: {
            where: { isActive: true },
            orderBy: { sortOrder: "asc" }
          }
        }
      }),
      prisma.pricingItem.findMany({
        where: { isActive: true },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }]
      }),
      prisma.faq.findMany({
        where: { isActive: true },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }]
      }),
      prisma.testimonial.findMany({
        where: { isActive: true },
        orderBy: [{ isFeatured: "desc" }, { sortOrder: "asc" }, { createdAt: "desc" }]
      })
    ]);

    const sectionMap = new Map<string, HomeSectionWithBlocks>();
    for (const section of sections) {
      sectionMap.set(section.key, section);
    }

    const heroSection = sectionMap.get("home-hero");
    const quoteSection = sectionMap.get("home-quote");
    const serviceSection = sectionMap.get("home-services");
    const pricingSection = sectionMap.get("home-pricing");
    const whyUsSection = sectionMap.get("home-why-us");
    const testimonialSection = sectionMap.get("home-testimonials");
    const faqSection = sectionMap.get("home-faq");
    const finalCtaSection = sectionMap.get("home-final-cta");

    const serviceItemsFromSql = (serviceSection?.blocks ?? [])
      .map((block) => {
        const record = asRecord(block.content);
        return {
          title: textFromRecord(record, "title") ?? block.title ?? "",
          description: textFromRecord(record, "description") ?? ""
        };
      })
      .filter((item) => item.title && item.description);

    const whyUsItemsFromSql = (whyUsSection?.blocks ?? [])
      .map((block) => {
        const record = asRecord(block.content);
        return {
          title: textFromRecord(record, "title") ?? block.title ?? "",
          description: textFromRecord(record, "description") ?? ""
        };
      })
      .filter((item) => item.title && item.description);

    const heroHighlights = blocksByPrefix(heroSection, "hero-highlight-")
      .map((block) => textFromBlock(block))
      .filter((text): text is string => Boolean(text));

    return {
      hero: {
        badge:
          textFromBlock(blockByKey(heroSection, "hero-badge")) ??
          heroSection?.title?.split("|")[0]?.trim() ??
          fallbackHomePageData.hero.badge,
        title:
          textFromBlock(blockByKey(heroSection, "hero-title")) ??
          heroSection?.title ??
          fallbackHomePageData.hero.title,
        description:
          textFromBlock(blockByKey(heroSection, "hero-description")) ??
          heroSection?.description ??
          fallbackHomePageData.hero.description,
        primaryCtaText:
          textFromBlock(blockByKey(heroSection, "hero-primary-cta"), "label") ??
          fallbackHomePageData.hero.primaryCtaText,
        secondaryCtaText:
          textFromBlock(blockByKey(heroSection, "hero-secondary-cta"), "label") ??
          fallbackHomePageData.hero.secondaryCtaText,
        highlights:
          heroHighlights.length > 0 ? heroHighlights : fallbackHomePageData.hero.highlights
      },
      quote: {
        title: quoteSection?.title ?? fallbackHomePageData.quote.title,
        description: quoteSection?.description ?? fallbackHomePageData.quote.description,
        note:
          textFromBlock(blockByKey(quoteSection, "quote-note")) ?? fallbackHomePageData.quote.note
      },
      services: {
        title: serviceSection?.title ?? fallbackHomePageData.services.title,
        description: serviceSection?.description ?? fallbackHomePageData.services.description,
        items:
          serviceItemsFromSql.length > 0 ? serviceItemsFromSql : fallbackHomePageData.services.items
      },
      pricing: {
        title: pricingSection?.title ?? fallbackHomePageData.pricing.title,
        description: pricingSection?.description ?? fallbackHomePageData.pricing.description,
        note:
          textFromBlock(blockByKey(pricingSection, "pricing-note")) ??
          fallbackHomePageData.pricing.note,
        items:
          pricingItems.length > 0
            ? pricingItems.map((item) => ({
                id: item.id,
                routeName: item.routeName,
                fromLocation: item.fromLocation,
                toLocation: item.toLocation,
                vehicleType: item.vehicleType,
                price: Number(item.price),
                currency: item.currency,
                unit: item.unit,
                description: item.description,
                isPopular: item.isPopular
              }))
            : fallbackHomePageData.pricing.items
      },
      whyUs: {
        title: whyUsSection?.title ?? fallbackHomePageData.whyUs.title,
        description: whyUsSection?.description ?? fallbackHomePageData.whyUs.description,
        items: whyUsItemsFromSql.length > 0 ? whyUsItemsFromSql : fallbackHomePageData.whyUs.items
      },
      testimonials: {
        title: testimonialSection?.title ?? fallbackHomePageData.testimonials.title,
        description:
          testimonialSection?.description ?? fallbackHomePageData.testimonials.description,
        items:
          testimonials.length > 0
            ? testimonials.map((item) => ({
                id: item.id,
                customerName: item.customerName,
                content: item.content,
                location: item.location,
                serviceName: item.serviceName,
                rating: item.rating
              }))
            : fallbackHomePageData.testimonials.items
      },
      faq: {
        title: faqSection?.title ?? fallbackHomePageData.faq.title,
        description:
          faqSection?.description ??
          textFromBlock(blockByKey(faqSection, "faq-intro")) ??
          fallbackHomePageData.faq.description,
        items:
          faqs.length > 0
            ? faqs.map((item) => ({
                id: item.id,
                question: item.question,
                answer: item.answer,
                slug: item.slug
              }))
            : fallbackHomePageData.faq.items
      },
      finalCta: {
        title: finalCtaSection?.title ?? fallbackHomePageData.finalCta.title,
        description: finalCtaSection?.description ?? fallbackHomePageData.finalCta.description,
        primaryCtaText:
          textFromBlock(blockByKey(finalCtaSection, "final-cta-primary"), "label") ??
          fallbackHomePageData.finalCta.primaryCtaText,
        secondaryCtaText:
          textFromBlock(blockByKey(finalCtaSection, "final-cta-secondary"), "label") ??
          fallbackHomePageData.finalCta.secondaryCtaText
      }
    };
  } catch {
    return fallbackHomePageData;
  }
}
