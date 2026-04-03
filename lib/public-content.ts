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
};

export type PublicFaqItem = {
  id: string;
  question: string;
  answer: string;
  slug: string;
};

const fallbackPricingItems: PublicPricingItem[] = [
  {
    id: "fallback-price-ha-noi",
    routeName: "Taxi Ninh Bình đi Hà Nội",
    fromLocation: "TP Ninh Bình",
    toLocation: "Hà Nội",
    vehicleType: "Sedan 4 chỗ",
    price: 950000,
    currency: "VND",
    unit: "chuyến",
    description: "Đón tận nơi, linh hoạt theo giờ khởi hành.",
    isPopular: true
  },
  {
    id: "fallback-price-noi-bai",
    routeName: "Taxi Ninh Bình đi sân bay Nội Bài",
    fromLocation: "Ninh Bình",
    toLocation: "Sân bay Nội Bài",
    vehicleType: "SUV 7 chỗ",
    price: 1300000,
    currency: "VND",
    unit: "chuyến",
    description: "Hỗ trợ chuyến sớm/chuyến đêm theo lịch bay.",
    isPopular: true
  },
  {
    id: "fallback-price-trang-an",
    routeName: "Taxi Ninh Bình đi Tràng An",
    fromLocation: "TP Ninh Bình",
    toLocation: "Tràng An",
    vehicleType: "Sedan 4 chỗ",
    price: 250000,
    currency: "VND",
    unit: "chuyến",
    description: "Phù hợp khách lẻ và khách gia đình.",
    isPopular: false
  }
];

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

export async function getPublicPricingItems(): Promise<PublicPricingItem[]> {
  if (!process.env.DATABASE_URL) {
    return fallbackPricingItems;
  }

  try {
    const items = await prisma.pricingItem.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }]
    });

    if (items.length === 0) {
      return fallbackPricingItems;
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
      isPopular: item.isPopular
    }));
  } catch {
    return fallbackPricingItems;
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
