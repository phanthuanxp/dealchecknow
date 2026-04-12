import { Prisma } from "@prisma/client";

import { getPublicPricingItems } from "@/lib/public-content";
import prisma from "@/lib/prisma";
import { resolveTenantForCurrentRequest, whereByTenantId } from "@/lib/tenant";

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

export type HeroBannerImage = {
  src: string;
  alt: string;
};

export type HeroData = {
  badge: string;
  title: string;
  description: string;
  primaryCtaText: string;
  secondaryCtaText: string;
  highlights: string[];
  bannerImages: HeroBannerImage[];
};

export type QuoteSectionData = {
  title: string;
  description: string;
  note: string;
};

export type ServiceItem = {
  title: string;
  description: string;
  imageUrl?: string;
  iconKey?: string;
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
    showOnHome: boolean;
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
    ],
    bannerImages: [
      {
        src: "/images/taxi-banner-1.svg",
        alt: "Taxi phục vụ khách du lịch tại Ninh Bình"
      },
      {
        src: "/images/taxi-banner-2.svg",
        alt: "Xe đưa đón tuyến Ninh Bình đi sân bay Nội Bài"
      },
      {
        src: "/images/taxi-banner-3.svg",
        alt: "Taxi đường dài và xe đoàn tại Ninh Bình"
      }
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
        description: "Đón nhanh tại trung tâm, khách sạn, ga tàu và điểm du lịch.",
        imageUrl: "/images/services/service-ha-noi.webp",
        iconKey: "car"
      },
      {
        title: "Đưa đón sân bay",
        description: "Linh hoạt thời gian, hỗ trợ hành lý và theo dõi lịch bay.",
        imageUrl: "/images/services/service-noi-bai.jpg",
        iconKey: "route"
      },
      {
        title: "Xe du lịch theo chuyến",
        description: "Phù hợp lịch trình Tam Cốc, Tràng An, Bái Đính, Hoa Lư.",
        imageUrl: "/images/services/service-tour.jpg",
        iconKey: "star"
      }
    ]
  },
  pricing: {
    title: "Tuyến phổ biến / Bảng giá tham khảo",
    description: "Giá tham khảo cho một số lộ trình thường dùng.",
    note: "Cam kết 100% xe riêng đời mới - Phục vụ 24/24 !",
    items: [
      {
        id: "fallback-price-1",
        routeName: "TP Ninh Bình → Tam Cốc",
        fromLocation: "TP Ninh Bình",
        toLocation: "Tam Cốc",
        vehicleType: "Sedan 4 chỗ",
        price: 200000,
        currency: "VND",
        unit: "chuyến",
        description: "Đón tận nơi, phù hợp khách lẻ và gia đình.",
        isPopular: true,
        showOnHome: true
      },
      {
        id: "fallback-price-2",
        routeName: "TP Ninh Bình → Tràng An",
        fromLocation: "TP Ninh Bình",
        toLocation: "Tràng An",
        vehicleType: "SUV 7 chỗ",
        price: 300000,
        currency: "VND",
        unit: "chuyến",
        description: "Xe rộng rãi, phù hợp nhóm bạn và gia đình có trẻ nhỏ.",
        isPopular: true,
        showOnHome: true
      },
      {
        id: "fallback-price-3",
        routeName: "Ninh Bình → Sân bay Nội Bài",
        fromLocation: "Ninh Bình",
        toLocation: "Sân bay Nội Bài",
        vehicleType: "Sedan 4 chỗ",
        price: 1300000,
        currency: "VND",
        unit: "chuyến",
        description: "Theo dõi giờ bay, hỗ trợ đón sớm và chuyến đêm.",
        isPopular: true,
        showOnHome: true
      },
      {
        id: "fallback-price-4",
        routeName: "TP Ninh Bình → TP Hà Nội",
        fromLocation: "TP Ninh Bình",
        toLocation: "TP Hà Nội",
        vehicleType: "Sedan 4 chỗ",
        price: 1150000,
        currency: "VND",
        unit: "chuyến",
        description: "Đi công tác và khám chữa bệnh, lộ trình linh hoạt.",
        isPopular: true,
        showOnHome: true
      },
      {
        id: "fallback-price-5",
        routeName: "TP Ninh Bình → Bái Đính",
        fromLocation: "TP Ninh Bình",
        toLocation: "Bái Đính",
        vehicleType: "Sedan 4 chỗ",
        price: 350000,
        currency: "VND",
        unit: "chuyến",
        description: "Thuận tiện cho lịch trình tham quan trong ngày.",
        isPopular: false,
        showOnHome: true
      },
      {
        id: "fallback-price-6",
        routeName: "TP Ninh Bình → Hang Múa",
        fromLocation: "TP Ninh Bình",
        toLocation: "Hang Múa",
        vehicleType: "Sedan 4 chỗ",
        price: 280000,
        currency: "VND",
        unit: "chuyến",
        description: "Phù hợp khách chụp ảnh, tham quan ngắn giờ.",
        isPopular: true,
        showOnHome: true
      }
    ]
  },
  whyUs: {
    title: "Lý do chọn chúng tôi",
    description: "Cam kết dịch vụ minh bạch và hỗ trợ tận tâm.",
    items: [
      {
        title: "Đón đúng giờ",
        description: "Xác nhận và theo dõi lịch trình để đảm bảo đúng kế hoạch.",
        iconKey: "clock"
      },
      {
        title: "Xe sạch, tài xế lịch sự",
        description: "Trải nghiệm thoải mái cho khách cá nhân và gia đình.",
        iconKey: "shield"
      },
      {
        title: "Giá rõ ràng",
        description: "Tư vấn chi phí trước chuyến, không phát sinh bất ngờ.",
        iconKey: "check"
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

function listFromRecord(record: Record<string, unknown> | null, key: string): string[] {
  const value = record?.[key];
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter((item) => item.length > 0);
}

function textFromBlock(
  block: HomeSectionWithBlocks["blocks"][number] | undefined,
  key = "text"
) {
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
    const tenant = await resolveTenantForCurrentRequest();
    const tenantId = tenant?.id ?? null;

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

    const [sectionsResult, pricingItems, faqsResult, testimonialsResult] = await Promise.all([
      prisma.siteSection.findMany({
        where: {
          ...whereByTenantId(tenantId),
          key: { in: targetKeys },
          isActive: true
        },
        include: {
          blocks: {
            where: {
              ...whereByTenantId(tenantId),
              isActive: true
            },
            orderBy: { sortOrder: "asc" }
          }
        }
      }),
      getPublicPricingItems({ onlyHome: true }),
      prisma.faq.findMany({
        where: {
          ...whereByTenantId(tenantId),
          isActive: true
        },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }]
      }),
      prisma.testimonial.findMany({
        where: {
          ...whereByTenantId(tenantId),
          isActive: true
        },
        orderBy: [{ isFeatured: "desc" }, { sortOrder: "asc" }, { createdAt: "desc" }]
      })
    ]);

    let sections = sectionsResult;
    let faqs = faqsResult;
    let testimonials = testimonialsResult;

    if (tenantId && sections.length === 0) {
      sections = await prisma.siteSection.findMany({
        where: {
          tenantId: null,
          key: { in: targetKeys },
          isActive: true
        },
        include: {
          blocks: {
            where: { tenantId: null, isActive: true },
            orderBy: { sortOrder: "asc" }
          }
        }
      });
    }

    if (tenantId && faqs.length === 0) {
      faqs = await prisma.faq.findMany({
        where: { tenantId: null, isActive: true },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }]
      });
    }

    if (tenantId && testimonials.length === 0) {
      testimonials = await prisma.testimonial.findMany({
        where: { tenantId: null, isActive: true },
        orderBy: [{ isFeatured: "desc" }, { sortOrder: "asc" }, { createdAt: "desc" }]
      });
    }

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
        const iconKey = textFromRecord(record, "iconKey");

        return {
          title: textFromRecord(record, "title") ?? block.title ?? "",
          description: textFromRecord(record, "description") ?? "",
          imageUrl: textFromRecord(record, "imageUrl"),
          iconKey: iconKey ? iconKey.toLowerCase() : undefined
        };
      })
      .filter((item) => item.title && item.description);

    const whyUsItemsFromSql = (whyUsSection?.blocks ?? [])
      .map((block) => {
        const record = asRecord(block.content);
        const iconKey = textFromRecord(record, "iconKey");

        return {
          title: textFromRecord(record, "title") ?? block.title ?? "",
          description: textFromRecord(record, "description") ?? "",
          iconKey: iconKey ? iconKey.toLowerCase() : undefined
        };
      })
      .filter((item) => item.title && item.description);

    const heroHighlights = blocksByPrefix(heroSection, "hero-highlight-")
      .map((block) => textFromBlock(block))
      .filter((text): text is string => Boolean(text));

    const heroBannerBlock = blockByKey(heroSection, "hero-banner-images");
    const heroBannerRecord = asRecord(heroBannerBlock?.content);
    const bannerAlt =
      textFromRecord(heroBannerRecord, "alt") ?? fallbackHomePageData.hero.bannerImages[0]?.alt ?? "Taxi Ninh Bình";
    const heroBannerImages = listFromRecord(heroBannerRecord, "images").map((src) => ({
      src,
      alt: bannerAlt
    }));

    const pricingItemsFromSql: PricingData["items"] = pricingItems.map((item) => ({
      id: item.id,
      routeName: item.routeName,
      fromLocation: item.fromLocation,
      toLocation: item.toLocation,
      vehicleType: item.vehicleType,
      price: Number(item.price),
      currency: item.currency,
      unit: item.unit,
      description: item.description,
      isPopular: item.isPopular,
      showOnHome: item.showOnHome
    }));

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
          heroHighlights.length > 0 ? heroHighlights : fallbackHomePageData.hero.highlights,
        bannerImages:
          heroBannerImages.length > 0 ? heroBannerImages : fallbackHomePageData.hero.bannerImages
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
          serviceItemsFromSql.length > 0
            ? serviceItemsFromSql
            : fallbackHomePageData.services.items
      },
      pricing: {
        title: pricingSection?.title ?? fallbackHomePageData.pricing.title,
        description: pricingSection?.description ?? fallbackHomePageData.pricing.description,
        note:
          textFromBlock(blockByKey(pricingSection, "pricing-note")) ??
          fallbackHomePageData.pricing.note,
        items: pricingItemsFromSql.length > 0 ? pricingItemsFromSql : fallbackHomePageData.pricing.items
      },
      whyUs: {
        title: whyUsSection?.title ?? fallbackHomePageData.whyUs.title,
        description: whyUsSection?.description ?? fallbackHomePageData.whyUs.description,
        items:
          whyUsItemsFromSql.length > 0 ? whyUsItemsFromSql : fallbackHomePageData.whyUs.items
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
