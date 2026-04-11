import { Prisma } from "@prisma/client";

import prisma from "@/lib/prisma";

export type PublicPricingItem = {
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
};

export type PublicPricingSectionMeta = {
  title: string;
  description: string;
  note: string;
};

export type PublicFaqItem = {
  id: string;
  question: string;
  answer: string;
  slug: string;
};

type PricingQueryOptions = {
  onlyHome?: boolean;
};

function makeFallbackRoute(params: {
  prefix: string;
  routeName: string;
  fromLocation: string;
  toLocation: string;
  description: string;
  isPopular?: boolean;
  showOnHome?: boolean;
  price4: number;
  price7: number;
  price16: number;
}): PublicPricingItem[] {
  return [
    {
      id: `${params.prefix}-4`,
      routeName: params.routeName,
      fromLocation: params.fromLocation,
      toLocation: params.toLocation,
      vehicleType: "Xe 4 chỗ",
      price: params.price4,
      currency: "VND",
      unit: "chuyến",
      description: params.description,
      isPopular: Boolean(params.isPopular),
      showOnHome: params.showOnHome !== false
    },
    {
      id: `${params.prefix}-7`,
      routeName: params.routeName,
      fromLocation: params.fromLocation,
      toLocation: params.toLocation,
      vehicleType: "Xe 7 chỗ",
      price: params.price7,
      currency: "VND",
      unit: "chuyến",
      description: params.description,
      isPopular: Boolean(params.isPopular),
      showOnHome: params.showOnHome !== false
    },
    {
      id: `${params.prefix}-16`,
      routeName: params.routeName,
      fromLocation: params.fromLocation,
      toLocation: params.toLocation,
      vehicleType: "Xe 16 chỗ",
      price: params.price16,
      currency: "VND",
      unit: "chuyến",
      description: params.description,
      isPopular: Boolean(params.isPopular),
      showOnHome: params.showOnHome !== false
    }
  ];
}

const fallbackPricingItems: PublicPricingItem[] = [
  ...makeFallbackRoute({
    prefix: "fallback-route-tam-coc",
    routeName: "TP Ninh Bình ↔ Tam Cốc",
    fromLocation: "TP Ninh Bình",
    toLocation: "Tam Cốc",
    description: "Đón tận nơi, phù hợp khách lẻ và gia đình đi tham quan trong ngày.",
    isPopular: true,
    showOnHome: true,
    price4: 200000,
    price7: 300000,
    price16: 500000
  }),
  ...makeFallbackRoute({
    prefix: "fallback-route-trang-an",
    routeName: "TP Ninh Bình ↔ Tràng An",
    fromLocation: "TP Ninh Bình",
    toLocation: "Tràng An",
    description: "Xe rộng rãi cho nhóm bạn, gia đình có trẻ nhỏ và nhiều hành lý.",
    isPopular: true,
    showOnHome: true,
    price4: 250000,
    price7: 350000,
    price16: 550000
  }),
  ...makeFallbackRoute({
    prefix: "fallback-route-noi-bai",
    routeName: "Ninh Bình ↔ Sân bay Nội Bài",
    fromLocation: "Ninh Bình",
    toLocation: "Sân bay Nội Bài",
    description: "Theo dõi giờ bay, hỗ trợ chuyến sớm và chuyến đêm đúng lịch.",
    isPopular: true,
    showOnHome: true,
    price4: 1300000,
    price7: 1500000,
    price16: 1900000
  }),
  ...makeFallbackRoute({
    prefix: "fallback-route-ha-noi",
    routeName: "TP Ninh Bình ↔ TP Hà Nội",
    fromLocation: "TP Ninh Bình",
    toLocation: "TP Hà Nội",
    description: "Phù hợp lịch đi công tác và khám chữa bệnh, chủ động giờ đón trả.",
    isPopular: true,
    showOnHome: true,
    price4: 1150000,
    price7: 1350000,
    price16: 1700000
  }),
  ...makeFallbackRoute({
    prefix: "fallback-route-bai-dinh",
    routeName: "TP Ninh Bình ↔ Bái Đính",
    fromLocation: "TP Ninh Bình",
    toLocation: "Bái Đính",
    description: "Thuận tiện cho lịch trình tham quan theo nửa ngày hoặc cả ngày.",
    isPopular: false,
    showOnHome: true,
    price4: 350000,
    price7: 450000,
    price16: 650000
  }),
  ...makeFallbackRoute({
    prefix: "fallback-route-hang-mua",
    routeName: "TP Ninh Bình ↔ Hang Múa",
    fromLocation: "TP Ninh Bình",
    toLocation: "Hang Múa",
    description: "Lịch trình linh hoạt cho khách du lịch, hỗ trợ đón trả theo yêu cầu.",
    isPopular: true,
    showOnHome: true,
    price4: 280000,
    price7: 380000,
    price16: 580000
  })
];

const fallbackPricingSectionMeta: PublicPricingSectionMeta = {
  title: "Tuyến phổ biến / Bảng giá tham khảo",
  description: "Tham khảo nhanh các mức giá thường dùng trước khi đặt xe.",
  note: "Cam kết 100% xe riêng đời mới - Phục vụ 24/24 !"
};

const fallbackFaqItems: PublicFaqItem[] = [
  {
    id: "fallback-faq-1",
    question: "Taxi Ninh Bình có phục vụ 24/7 không?",
    answer: "Có. Chúng tôi nhận điều phối xe 24/7, kể cả chuyến sáng sớm và tối muộn.",
    slug: "taxi-ninh-binh-phuc-vu-24-7"
  },
  {
    id: "fallback-faq-2",
    question: "Đặt xe đi Hà Nội hoặc Nội Bài cần báo trước bao lâu?",
    answer: "Nên đặt trước từ 30-60 phút để chúng tôi sắp xếp xe nhanh và chủ động lộ trình.",
    slug: "dat-xe-di-ha-noi-noi-bai"
  },
  {
    id: "fallback-faq-3",
    question: "Có hỗ trợ xe du lịch theo ngày không?",
    answer: "Có. Dịch vụ thuê xe du lịch theo lịch trình Tam Cốc, Tràng An, Bái Đính, Hoa Lư luôn sẵn sàng.",
    slug: "thue-xe-du-lich-theo-ngay"
  }
];

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

function getFallbackPricingItems(options: PricingQueryOptions): PublicPricingItem[] {
  if (!options.onlyHome) {
    return fallbackPricingItems;
  }

  return fallbackPricingItems.filter((item) => item.showOnHome);
}

export async function getPublicPricingSectionMeta(): Promise<PublicPricingSectionMeta> {
  if (!process.env.DATABASE_URL) {
    return fallbackPricingSectionMeta;
  }

  try {
    const section = await prisma.siteSection.findUnique({
      where: { key: "home-pricing" },
      include: {
        blocks: {
          where: {
            isActive: true,
            blockKey: "pricing-note"
          },
          orderBy: { sortOrder: "asc" }
        }
      }
    });

    if (!section) {
      return fallbackPricingSectionMeta;
    }

    return {
      title: section.title?.trim() || fallbackPricingSectionMeta.title,
      description: section.description?.trim() || fallbackPricingSectionMeta.description,
      note:
        textFromRecord(asRecord(section.blocks[0]?.content)) || fallbackPricingSectionMeta.note
    };
  } catch {
    return fallbackPricingSectionMeta;
  }
}

export async function getPublicPricingItems(
  options: PricingQueryOptions = {}
): Promise<PublicPricingItem[]> {
  if (!process.env.DATABASE_URL) {
    return getFallbackPricingItems(options);
  }

  try {
    const baseOrder = [{ sortOrder: "asc" as const }, { createdAt: "desc" as const }];
    let items = await prisma.pricingItem.findMany({
      where: {
        isActive: true,
        ...(options.onlyHome ? { showOnHome: true } : {})
      },
      orderBy: baseOrder
    });

    if (options.onlyHome && items.length === 0) {
      items = await prisma.pricingItem.findMany({
        where: {
          isActive: true,
          isPopular: true
        },
        orderBy: baseOrder
      });
    }

    if (options.onlyHome && items.length === 0) {
      items = await prisma.pricingItem.findMany({
        where: { isActive: true },
        orderBy: baseOrder
      });
    }

    if (items.length === 0) {
      return getFallbackPricingItems(options);
    }

    return items.map((item) => ({
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
  } catch {
    return getFallbackPricingItems(options);
  }
}

export async function getPublicFaqItems(): Promise<PublicFaqItem[]> {
  if (!process.env.DATABASE_URL) {
    return fallbackFaqItems;
  }

  try {
    const items = await prisma.faq.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }]
    });

    if (items.length === 0) {
      return fallbackFaqItems;
    }

    return items.map((item) => ({
      id: item.id,
      question: item.question,
      answer: item.answer,
      slug: item.slug
    }));
  } catch {
    return fallbackFaqItems;
  }
}
