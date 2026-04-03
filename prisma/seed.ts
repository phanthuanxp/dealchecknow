import { hash } from "bcryptjs";
import { Prisma, PrismaClient, PublishStatus, SectionType, UserRole } from "@prisma/client";

const prisma = new PrismaClient();

async function hashPassword(input: string) {
  return hash(input, 12);
}

async function seedAdminUser() {
  const adminEmail = "admin@taxininhbinh.com";
  const adminPassword = "Admin@123456";
  const passwordHash = await hashPassword(adminPassword);

  return prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      passwordHash,
      fullName: "Taxi Ninh Binh Admin",
      role: UserRole.ADMIN,
      isActive: true
    },
    create: {
      email: adminEmail,
      passwordHash,
      fullName: "Taxi Ninh Binh Admin",
      role: UserRole.ADMIN,
      isActive: true
    }
  });
}

async function seedSiteSectionsAndBlocks() {
  const sections = [
    {
      key: "home-hero",
      name: "Home Hero",
      type: SectionType.HERO,
      title: "Taxi Ninh Bình - Xe sạch, đón nhanh, giá rõ ràng",
      description: "Đặt taxi và xe du lịch Ninh Bình 24/7, hỗ trợ nhanh qua điện thoại và Zalo.",
      sortOrder: 1
    },
    {
      key: "home-quote",
      name: "Home Quote Form",
      type: SectionType.CTA,
      title: "Nhận báo giá nhanh theo lộ trình",
      description: "Điền thông tin chuyến đi để nhận tư vấn và báo giá phù hợp.",
      sortOrder: 2
    },
    {
      key: "home-services",
      name: "Home Services",
      type: SectionType.SERVICES,
      title: "Dịch vụ chính",
      description: "Đa dạng dịch vụ đi lại cho khách địa phương và khách du lịch.",
      sortOrder: 3
    },
    {
      key: "home-pricing",
      name: "Home Pricing",
      type: SectionType.PRICING,
      title: "Tuyến phổ biến / Bảng giá tham khảo",
      description: "Tham khảo nhanh các mức giá thường dùng trước khi đặt xe.",
      sortOrder: 4
    },
    {
      key: "home-why-us",
      name: "Home Why Us",
      type: SectionType.SERVICES,
      title: "Lý do chọn chúng tôi",
      description: "Cam kết trải nghiệm đi xe an toàn, đúng giờ và minh bạch.",
      sortOrder: 5
    },
    {
      key: "home-testimonials",
      name: "Home Testimonials",
      type: SectionType.TESTIMONIAL,
      title: "Khách hàng nói gì về Taxi Ninh Bình",
      description: "Phản hồi thực tế từ khách đã sử dụng dịch vụ.",
      sortOrder: 6
    },
    {
      key: "home-faq",
      name: "Home FAQ",
      type: SectionType.FAQ,
      title: "Câu hỏi thường gặp",
      description: "Giải đáp nhanh các thắc mắc trước khi đặt xe.",
      sortOrder: 7
    },
    {
      key: "home-final-cta",
      name: "Home Final CTA",
      type: SectionType.CTA,
      title: "Sẵn sàng đặt xe ngay hôm nay?",
      description: "Gọi hotline hoặc nhắn Zalo để được xác nhận chuyến nhanh.",
      sortOrder: 8
    }
  ];

  const sectionIdByKey = new Map<string, string>();

  for (const section of sections) {
    const upserted = await prisma.siteSection.upsert({
      where: { key: section.key },
      update: {
        name: section.name,
        type: section.type,
        title: section.title,
        description: section.description,
        sortOrder: section.sortOrder,
        isActive: true
      },
      create: {
        key: section.key,
        name: section.name,
        type: section.type,
        title: section.title,
        description: section.description,
        sortOrder: section.sortOrder,
        isActive: true
      }
    });

    sectionIdByKey.set(section.key, upserted.id);
  }

  const blocks = [
    {
      sectionKey: "home-hero",
      blockKey: "hero-badge",
      blockType: "text",
      title: "Hero Badge",
      content: {
        text: "Taxi Ninh Bình"
      },
      sortOrder: 0
    },
    {
      sectionKey: "home-hero",
      blockKey: "hero-title",
      blockType: "text",
      title: "Hero Title",
      content: {
        text: "Taxi và xe du lịch Ninh Bình cho gia đình, nhóm bạn và khách đoàn"
      },
      sortOrder: 1
    },
    {
      sectionKey: "home-hero",
      blockKey: "hero-description",
      blockType: "text",
      title: "Hero Description",
      content: {
        text: "Chúng tôi hỗ trợ đón nhanh, tài xế thân thiện, xe sạch và báo giá minh bạch theo từng tuyến."
      },
      sortOrder: 2
    },
    {
      sectionKey: "home-hero",
      blockKey: "hero-primary-cta",
      blockType: "cta",
      title: "Primary CTA",
      content: {
        label: "Gọi ngay 0345 07 6789",
        href: "tel:0345076789",
        helperText: "Hotline: 0345 07 6789"
      },
      sortOrder: 3
    },
    {
      sectionKey: "home-hero",
      blockKey: "hero-secondary-cta",
      blockType: "cta",
      title: "Secondary CTA",
      content: {
        label: "Chat Zalo",
        href: "https://zalo.me/0345076789"
      },
      sortOrder: 4
    },
    {
      sectionKey: "home-hero",
      blockKey: "hero-highlight-1",
      blockType: "text",
      title: "Hero Highlight 1",
      content: { text: "Có mặt nhanh trong khu vực Ninh Bình" },
      sortOrder: 5
    },
    {
      sectionKey: "home-hero",
      blockKey: "hero-highlight-2",
      blockType: "text",
      title: "Hero Highlight 2",
      content: { text: "Giá minh bạch, không phụ phí mập mờ" },
      sortOrder: 6
    },
    {
      sectionKey: "home-hero",
      blockKey: "hero-highlight-3",
      blockType: "text",
      title: "Hero Highlight 3",
      content: { text: "Hỗ trợ khách du lịch và khách đoàn 24/7" },
      sortOrder: 7
    },
    {
      sectionKey: "home-quote",
      blockKey: "quote-note",
      blockType: "text",
      title: "Quote Note",
      content: {
        text: "Sau khi gửi thông tin, đội ngũ điều phối sẽ liên hệ xác nhận và báo giá trong thời gian sớm nhất."
      },
      sortOrder: 1
    },
    {
      sectionKey: "home-services",
      blockKey: "service-item-1",
      blockType: "feature",
      title: "Taxi nội tỉnh",
      content: {
        title: "Taxi nội tỉnh Ninh Bình",
        description: "Đón nhanh tại trung tâm thành phố, ga Ninh Bình, khách sạn và điểm du lịch."
      },
      sortOrder: 1
    },
    {
      sectionKey: "home-services",
      blockKey: "service-item-2",
      blockType: "feature",
      title: "Đưa đón sân bay",
      content: {
        title: "Đưa đón sân bay Nội Bài",
        description: "Lịch trình rõ ràng, đón đúng giờ theo lịch bay, hỗ trợ hành lý đầy đủ."
      },
      sortOrder: 2
    },
    {
      sectionKey: "home-services",
      blockKey: "service-item-3",
      blockType: "feature",
      title: "Xe theo chuyến",
      content: {
        title: "Xe du lịch theo chuyến",
        description: "Phù hợp lịch trình Tam Cốc, Tràng An, Bái Đính, Hoa Lư cho nhóm gia đình và công ty."
      },
      sortOrder: 3
    },
    {
      sectionKey: "home-pricing",
      blockKey: "pricing-note",
      blockType: "text",
      title: "Pricing Note",
      content: {
        text: "Giá có thể thay đổi theo khung giờ, lễ tết và phí cầu đường. Vui lòng liên hệ để nhận báo giá chính xác."
      },
      sortOrder: 1
    },
    {
      sectionKey: "home-why-us",
      blockKey: "why-item-1",
      blockType: "feature",
      title: "Đúng giờ",
      content: {
        title: "Đón đúng giờ đã hẹn",
        description: "Theo dõi lịch và chủ động liên hệ để đảm bảo chuyến đi đúng kế hoạch của bạn."
      },
      sortOrder: 1
    },
    {
      sectionKey: "home-why-us",
      blockKey: "why-item-2",
      blockType: "feature",
      title: "Xe sạch",
      content: {
        title: "Xe sạch, tài xế lịch sự",
        description: "Xe được vệ sinh thường xuyên, tài xế thân thiện và hỗ trợ khách tận tình."
      },
      sortOrder: 2
    },
    {
      sectionKey: "home-why-us",
      blockKey: "why-item-3",
      blockType: "feature",
      title: "Giá rõ ràng",
      content: {
        title: "Giá minh bạch, tư vấn rõ trước chuyến",
        description: "Thông tin chi phí được thống nhất rõ ràng trước khi khởi hành."
      },
      sortOrder: 3
    },
    {
      sectionKey: "home-faq",
      blockKey: "faq-intro",
      blockType: "text",
      title: "FAQ Intro",
      content: {
        text: "Giải đáp các câu hỏi về đặt xe, thanh toán và thay đổi lịch trình."
      },
      sortOrder: 1
    },
    {
      sectionKey: "home-final-cta",
      blockKey: "final-cta-primary",
      blockType: "cta",
      title: "Final CTA Primary",
      content: {
        label: "Gọi hotline 0345 07 6789",
        href: "tel:0345076789"
      },
      sortOrder: 1
    },
    {
      sectionKey: "home-final-cta",
      blockKey: "final-cta-secondary",
      blockType: "cta",
      title: "Final CTA Secondary",
      content: {
        label: "Nhắn Zalo ngay",
        href: "https://zalo.me/0345076789"
      },
      sortOrder: 2
    }
  ];

  for (const block of blocks) {
    const sectionId = sectionIdByKey.get(block.sectionKey);
    if (!sectionId) {
      throw new Error(`Missing section id for key: ${block.sectionKey}`);
    }

    await prisma.pageBlock.upsert({
      where: {
        sectionId_blockKey: {
          sectionId,
          blockKey: block.blockKey
        }
      },
      update: {
        blockType: block.blockType,
        title: block.title,
        content: block.content as Prisma.InputJsonValue,
        sortOrder: block.sortOrder,
        isActive: true
      },
      create: {
        sectionId,
        blockKey: block.blockKey,
        blockType: block.blockType,
        title: block.title,
        content: block.content as Prisma.InputJsonValue,
        sortOrder: block.sortOrder,
        isActive: true
      }
    });
  }
}

async function seedPricingItems() {
  const pricingItems = [
    {
      code: "nb-tamcoc-sedan",
      routeName: "Ninh Binh City -> Tam Coc",
      fromLocation: "Ninh Binh City",
      toLocation: "Tam Coc",
      vehicleType: "Sedan 4 seats",
      price: new Prisma.Decimal("200000"),
      description: "Door-to-door one-way transfer",
      isPopular: true,
      sortOrder: 1
    },
    {
      code: "nb-trangan-suv",
      routeName: "Ninh Binh City -> Trang An",
      fromLocation: "Ninh Binh City",
      toLocation: "Trang An",
      vehicleType: "SUV 7 seats",
      price: new Prisma.Decimal("300000"),
      description: "Comfortable ride for family groups",
      isPopular: true,
      sortOrder: 2
    },
    {
      code: "nb-hanoi-airport",
      routeName: "Ninh Binh -> Noi Bai Airport",
      fromLocation: "Ninh Binh",
      toLocation: "Noi Bai Airport",
      vehicleType: "Sedan 4 seats",
      price: new Prisma.Decimal("1300000"),
      description: "Private airport transfer",
      isPopular: false,
      sortOrder: 3
    }
  ];

  for (const item of pricingItems) {
    await prisma.pricingItem.upsert({
      where: { code: item.code },
      update: {
        routeName: item.routeName,
        fromLocation: item.fromLocation,
        toLocation: item.toLocation,
        vehicleType: item.vehicleType,
        price: item.price,
        description: item.description,
        isPopular: item.isPopular,
        isActive: true,
        sortOrder: item.sortOrder
      },
      create: {
        code: item.code,
        routeName: item.routeName,
        fromLocation: item.fromLocation,
        toLocation: item.toLocation,
        vehicleType: item.vehicleType,
        price: item.price,
        description: item.description,
        isPopular: item.isPopular,
        isActive: true,
        sortOrder: item.sortOrder
      }
    });
  }
}

async function seedFaqs() {
  const faqs = [
    {
      slug: "how-to-book",
      question: "How do I book a taxi?",
      answer:
        "You can call the hotline 0345 07 6789, send a Zalo message, or submit a quote request on the website.",
      sortOrder: 1
    },
    {
      slug: "payment-methods",
      question: "What payment methods are accepted?",
      answer: "We accept cash, bank transfer and selected e-wallet methods for confirmed rides.",
      sortOrder: 2
    },
    {
      slug: "cancelation-policy",
      question: "Can I cancel a booking?",
      answer:
        "Yes. Please notify as early as possible. Cancellation fees may apply for long-distance or peak-time bookings.",
      sortOrder: 3
    }
  ];

  for (const faq of faqs) {
    await prisma.faq.upsert({
      where: { slug: faq.slug },
      update: {
        question: faq.question,
        answer: faq.answer,
        isActive: true,
        sortOrder: faq.sortOrder
      },
      create: {
        slug: faq.slug,
        question: faq.question,
        answer: faq.answer,
        isActive: true,
        sortOrder: faq.sortOrder
      }
    });
  }
}

async function seedTestimonials() {
  const testimonials = [
    {
      code: "review-ha-noi-family-trip",
      customerName: "Nguyen Tuan",
      content:
        "Driver arrived on time and supported our family throughout the trip to Trang An and Tam Coc.",
      rating: 5,
      location: "Ha Noi",
      serviceName: "Ninh Binh day tour transfer",
      isFeatured: true,
      sortOrder: 1
    },
    {
      code: "review-airport-transfer",
      customerName: "Tran Huyen",
      content:
        "Smooth airport transfer to Ninh Binh, clear pricing and polite communication before pickup.",
      rating: 5,
      location: "Ho Chi Minh City",
      serviceName: "Airport transfer",
      isFeatured: true,
      sortOrder: 2
    },
    {
      code: "review-business-ride",
      customerName: "Le Minh",
      content: "Reliable service for business travel with clean car and safe driving.",
      rating: 4,
      location: "Ninh Binh",
      serviceName: "Business transfer",
      isFeatured: false,
      sortOrder: 3
    }
  ];

  for (const item of testimonials) {
    await prisma.testimonial.upsert({
      where: { code: item.code },
      update: {
        customerName: item.customerName,
        content: item.content,
        rating: item.rating,
        location: item.location,
        serviceName: item.serviceName,
        isFeatured: item.isFeatured,
        isActive: true,
        sortOrder: item.sortOrder
      },
      create: {
        code: item.code,
        customerName: item.customerName,
        content: item.content,
        rating: item.rating,
        location: item.location,
        serviceName: item.serviceName,
        isFeatured: item.isFeatured,
        isActive: true,
        sortOrder: item.sortOrder
      }
    });
  }
}

async function seedBlog(adminUserId: string) {
  const categories = [
    {
      name: "Travel Guide",
      slug: "travel-guide",
      description: "Useful guides for exploring Ninh Binh",
      sortOrder: 1
    },
    {
      name: "Taxi Tips",
      slug: "taxi-tips",
      description: "Booking and transport tips for tourists",
      sortOrder: 2
    }
  ];

  const categoryIdBySlug = new Map<string, string>();

  for (const category of categories) {
    const upserted = await prisma.blogCategory.upsert({
      where: { slug: category.slug },
      update: {
        name: category.name,
        description: category.description,
        isActive: true,
        sortOrder: category.sortOrder
      },
      create: {
        name: category.name,
        slug: category.slug,
        description: category.description,
        isActive: true,
        sortOrder: category.sortOrder
      }
    });

    categoryIdBySlug.set(category.slug, upserted.id);
  }

  const blogPosts = [
    {
      title: "Top 7 places to visit in Ninh Binh in one day",
      slug: "top-7-places-to-visit-in-ninh-binh",
      excerpt: "A practical route for first-time travelers who want to maximize one day in Ninh Binh.",
      content:
        "Start at Trang An in the morning, continue to Bai Dinh, then Mua Cave in late afternoon. End the day at Tam Coc for sunset.",
      status: PublishStatus.PUBLISHED,
      publishedAt: new Date("2026-04-01T08:00:00.000Z"),
      seoTitle: "Top places to visit in Ninh Binh - Taxi Ninh Binh",
      seoDescription: "Suggested one-day travel route with trusted transport advice in Ninh Binh.",
      tags: ["ninh-binh", "travel-guide", "day-trip"],
      categorySlug: "travel-guide"
    },
    {
      title: "How to choose the right taxi for a family trip",
      slug: "choose-right-taxi-for-family-trip",
      excerpt: "Checklist to book safe and comfortable transport for families with kids or elders.",
      content:
        "Choose vehicle size based on passengers and luggage, confirm pickup details, and ask for transparent fare before departure.",
      status: PublishStatus.PUBLISHED,
      publishedAt: new Date("2026-04-02T09:30:00.000Z"),
      seoTitle: "Family taxi booking tips in Ninh Binh",
      seoDescription: "Simple checklist to book a suitable taxi for family travel in Ninh Binh.",
      tags: ["taxi", "family-trip", "travel-tips"],
      categorySlug: "taxi-tips"
    },
    {
      title: "Airport transfer guide: Noi Bai to Ninh Binh",
      slug: "airport-transfer-noi-bai-to-ninh-binh-guide",
      excerpt: "Estimated duration, suggested departure times, and how to avoid last-minute booking issues.",
      content:
        "Book at least 12 hours ahead for peak periods. Provide flight details so drivers can adapt pickup time if your flight changes.",
      status: PublishStatus.DRAFT,
      publishedAt: null,
      seoTitle: "Noi Bai to Ninh Binh transfer guide",
      seoDescription: "Planning tips for smooth airport transfer from Noi Bai to Ninh Binh.",
      tags: ["airport-transfer", "noi-bai", "ninh-binh"],
      categorySlug: "taxi-tips"
    }
  ];

  for (const post of blogPosts) {
    const categoryId = categoryIdBySlug.get(post.categorySlug);
    if (!categoryId) {
      throw new Error(`Missing category id for slug: ${post.categorySlug}`);
    }

    await prisma.blogPost.upsert({
      where: { slug: post.slug },
      update: {
        categoryId,
        authorId: adminUserId,
        title: post.title,
        excerpt: post.excerpt,
        content: post.content,
        status: post.status,
        publishedAt: post.publishedAt,
        seoTitle: post.seoTitle,
        seoDescription: post.seoDescription,
        tags: post.tags
      },
      create: {
        categoryId,
        authorId: adminUserId,
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        content: post.content,
        status: post.status,
        publishedAt: post.publishedAt,
        seoTitle: post.seoTitle,
        seoDescription: post.seoDescription,
        tags: post.tags
      }
    });
  }
}

async function seedSiteSettings() {
  const settings = [
    {
      key: "site_name",
      value: { text: "Taxi Ninh Binh" },
      description: "Public website name",
      groupKey: "general",
      isPublic: true
    },
    {
      key: "hotline",
      value: { value: "0345076789", display: "0345 07 6789" },
      description: "Primary hotline number",
      groupKey: "contact",
      isPublic: true
    },
    {
      key: "contact_email",
      value: { value: "info@taxininhbinh.com" },
      description: "Public support email",
      groupKey: "contact",
      isPublic: true
    },
    {
      key: "zalo_hotline",
      value: { value: "0345076789" },
      description: "Zalo hotline number",
      groupKey: "contact",
      isPublic: true
    },
    {
      key: "default_seo",
      value: {
        title: "Taxi Ninh Binh",
        description: "Taxi and travel car service in Ninh Binh with transparent pricing."
      },
      description: "Default SEO metadata for public pages",
      groupKey: "seo",
      isPublic: true
    }
  ];

  for (const setting of settings) {
    await prisma.siteSetting.upsert({
      where: { key: setting.key },
      update: {
        value: setting.value as Prisma.InputJsonValue,
        description: setting.description,
        groupKey: setting.groupKey,
        isPublic: setting.isPublic
      },
      create: {
        key: setting.key,
        value: setting.value as Prisma.InputJsonValue,
        description: setting.description,
        groupKey: setting.groupKey,
        isPublic: setting.isPublic
      }
    });
  }
}

async function main() {
  const admin = await seedAdminUser();
  await seedSiteSectionsAndBlocks();
  await seedPricingItems();
  await seedFaqs();
  await seedTestimonials();
  await seedBlog(admin.id);
  await seedSiteSettings();
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
