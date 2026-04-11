import { PublishStatus } from "@prisma/client";

import prisma from "@/lib/prisma";

export type PublicBlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  coverImageUrl: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  publishedAt: string | null;
  createdAt: string;
  category: {
    id: string;
    name: string;
    slug: string;
  };
};

export type PublicBlogCategory = {
  id: string;
  slug: string;
  name: string;
};

function localizeCategoryName(slug: string, name: string) {
  if (slug === "taxi-tips") {
    return "Mẹo đặt xe";
  }

  if (slug === "travel-guide") {
    return "Cẩm nang du lịch";
  }

  if (name.toLowerCase() === "taxi tips") {
    return "Mẹo đặt xe";
  }

  if (name.toLowerCase() === "travel guide") {
    return "Cẩm nang du lịch";
  }

  return name;
}

function localizeKnownPostContent(slug: string, source: { title: string; excerpt: string | null; content: string }) {
  if (slug === "top-7-places-to-visit-in-ninh-binh") {
    return {
      title: "Top 7 điểm du lịch Ninh Bình nên đi trong một ngày",
      excerpt: "Lịch trình gợi ý cho khách lần đầu đến Ninh Bình, tối ưu thời gian và cung đường.",
      content:
        "## Bắt đầu từ Tràng An vào buổi sáng\nĐể tránh đông, bạn nên đi Tràng An trước rồi chuyển về Tam Cốc vào cuối buổi sáng.\n\n## Ăn trưa gần khu du lịch\nChọn quán ăn gần tuyến đường để tiết kiệm thời gian di chuyển.\n\n## Buổi chiều tham quan Hang Múa hoặc Bái Đính\nTùy sức khỏe và quỹ thời gian, bạn có thể chọn một trong hai điểm để không bị quá tải lịch trình.\n\n## Gợi ý đặt xe\nNên đặt taxi riêng theo ngày để chủ động điểm dừng, phù hợp gia đình có trẻ nhỏ hoặc người lớn tuổi."
    };
  }

  if (slug === "choose-right-taxi-for-family-trip") {
    return {
      title: "Kinh nghiệm chọn taxi phù hợp cho chuyến đi gia đình",
      excerpt: "Checklist đơn giản giúp đặt xe đúng nhu cầu khi đi cùng trẻ em và người lớn tuổi.",
      content:
        "## Chọn dòng xe theo số người và hành lý\nNếu có nhiều hành lý, bạn nên ưu tiên xe 7 chỗ để thoải mái hơn.\n\n## Xác nhận rõ điểm đón, điểm trả\nThông tin càng rõ thì thời gian điều phối càng nhanh và chính xác.\n\n## Đặt trước vào giờ cao điểm\nCuối tuần và ngày lễ nên đặt sớm để giữ đúng loại xe phù hợp.\n\n## Kiểm tra phương án dự phòng\nBạn có thể hỏi trước phương án đổi giờ hoặc thay điểm trả nếu lịch trình phát sinh."
    };
  }

  return source;
}

const fallbackPosts: PublicBlogPost[] = [
  {
    id: "fallback-blog-1",
    slug: "top-7-dia-diem-du-lich-ninh-binh-trong-ngay",
    title: "Top 7 địa điểm du lịch Ninh Bình trong 1 ngày",
    excerpt: "Gợi ý lịch trình thực tế cho khách đi Tam Cốc, Tràng An, Bái Đính và Hang Múa.",
    content:
      "## Buổi sáng\nBắt đầu từ Tràng An để tránh đông, sau đó đi thuyền Tam Cốc nếu đi cùng gia đình.\n\n## Buổi trưa\nDi chuyển về trung tâm hoặc khu Tam Cốc để ăn trưa, nghỉ ngắn trước khi tiếp tục lịch trình.\n\n## Buổi chiều\nTham quan Hang Múa, ngắm toàn cảnh Ninh Bình lúc hoàng hôn.\n\n## Gợi ý di chuyển\nBạn nên đặt taxi Ninh Bình theo ngày để linh hoạt thời gian và không bị phụ thuộc giờ xe ghép.",
    coverImageUrl: "/images/services/service-tour.jpg",
    seoTitle: "Top 7 địa điểm du lịch Ninh Bình trong 1 ngày",
    seoDescription: "Lịch trình tham quan Ninh Bình tối ưu cho khách đi trong ngày.",
    publishedAt: "2026-04-01T08:00:00.000Z",
    createdAt: "2026-04-01T08:00:00.000Z",
    category: {
      id: "fallback-cat-1",
      name: "Cẩm nang du lịch",
      slug: "travel-guide"
    }
  },
  {
    id: "fallback-blog-2",
    slug: "kinh-nghiem-chon-taxi-ninh-binh-cho-gia-dinh",
    title: "Kinh nghiệm chọn taxi Ninh Bình cho gia đình",
    excerpt: "Những điểm cần lưu ý để đặt xe phù hợp khi đi cùng trẻ em và người lớn tuổi.",
    content:
      "## Chọn loại xe phù hợp\nƯu tiên xe rộng nếu có nhiều hành lý, xe đẩy hoặc đi cùng người lớn tuổi.\n\n## Xác nhận giá trước chuyến\nNên xác nhận điểm đón, điểm trả, số điểm dừng và mức giá dự kiến trước khi khởi hành.\n\n## Chủ động giờ đón\nVới tuyến Ninh Bình đi Hà Nội hoặc Nội Bài, bạn nên đặt xe sớm để giữ xe đúng loại và đúng giờ.",
    coverImageUrl: "/images/services/service-ha-noi.webp",
    seoTitle: "Kinh nghiệm chọn taxi Ninh Bình cho gia đình",
    seoDescription: "Checklist đặt taxi an toàn, thoải mái cho nhóm gia đình tại Ninh Bình.",
    publishedAt: "2026-04-02T09:30:00.000Z",
    createdAt: "2026-04-02T09:30:00.000Z",
    category: {
      id: "fallback-cat-2",
      name: "Mẹo đặt xe",
      slug: "taxi-tips"
    }
  }
];

const demoHomePosts: PublicBlogPost[] = [
  {
    id: "demo-home-1",
    slug: "goi-y-lich-trinh-taxi-ninh-binh-ha-noi-trong-ngay",
    title: "Gợi ý lịch trình taxi Ninh Bình - Hà Nội trong ngày tiết kiệm thời gian",
    excerpt: "Mẹo chọn giờ đi, điểm đón và phương án nghỉ giữa chặng để chuyến đi thoải mái hơn.",
    content: "Bài viết demo dùng để hiển thị block blog ngoài trang chủ.",
    coverImageUrl: "/images/services/service-ha-noi.webp",
    seoTitle: "Lịch trình taxi Ninh Bình - Hà Nội trong ngày",
    seoDescription: "Mẹo di chuyển thuận tiện giữa Ninh Bình và Hà Nội bằng taxi.",
    publishedAt: "2026-04-03T08:30:00.000Z",
    createdAt: "2026-04-03T08:30:00.000Z",
    category: {
      id: "demo-cat-taxi-tips",
      name: "Mẹo đặt xe",
      slug: "taxi-tips"
    }
  },
  {
    id: "demo-home-2",
    slug: "kinh-nghiem-di-trang-an-tam-coc-bang-taxi-rieng",
    title: "Kinh nghiệm đi Tràng An - Tam Cốc bằng taxi riêng cho nhóm gia đình",
    excerpt: "Gợi ý lộ trình linh hoạt cho nhóm có trẻ nhỏ hoặc người lớn tuổi.",
    content: "Bài viết demo dùng để hiển thị block blog ngoài trang chủ.",
    coverImageUrl: "/images/services/service-tour.jpg",
    seoTitle: "Kinh nghiệm đi Tràng An Tam Cốc bằng taxi",
    seoDescription: "Gợi ý lịch trình đi Tràng An Tam Cốc bằng taxi riêng.",
    publishedAt: "2026-04-03T12:00:00.000Z",
    createdAt: "2026-04-03T12:00:00.000Z",
    category: {
      id: "demo-cat-travel-guide",
      name: "Cẩm nang du lịch",
      slug: "travel-guide"
    }
  },
  {
    id: "demo-home-3",
    slug: "taxi-ninh-binh-noi-bai-can-dat-truoc-bao-lau",
    title: "Taxi Ninh Bình đi Nội Bài cần đặt trước bao lâu để luôn có xe?",
    excerpt: "Khoảng thời gian đặt xe khuyến nghị theo khung giờ và mùa cao điểm du lịch.",
    content: "Bài viết demo dùng để hiển thị block blog ngoài trang chủ.",
    coverImageUrl: "/images/services/service-noi-bai.jpg",
    seoTitle: "Đặt taxi Ninh Bình đi Nội Bài",
    seoDescription: "Thời gian đặt taxi Ninh Bình đi Nội Bài phù hợp theo từng khung giờ.",
    publishedAt: "2026-04-04T07:45:00.000Z",
    createdAt: "2026-04-04T07:45:00.000Z",
    category: {
      id: "demo-cat-taxi-tips",
      name: "Mẹo đặt xe",
      slug: "taxi-tips"
    }
  },
  {
    id: "demo-home-4",
    slug: "chi-phi-thue-xe-du-lich-ninh-binh-theo-ngay",
    title: "Chi phí thuê xe du lịch Ninh Bình theo ngày và cách tối ưu ngân sách",
    excerpt: "Các yếu tố ảnh hưởng giá thuê xe và cách lên lịch trình thông minh.",
    content: "Bài viết demo dùng để hiển thị block blog ngoài trang chủ.",
    coverImageUrl: "/images/services/service-tour.jpg",
    seoTitle: "Chi phí thuê xe du lịch Ninh Bình theo ngày",
    seoDescription: "Tổng hợp các yếu tố ảnh hưởng giá thuê xe du lịch tại Ninh Bình.",
    publishedAt: "2026-04-04T13:15:00.000Z",
    createdAt: "2026-04-04T13:15:00.000Z",
    category: {
      id: "demo-cat-travel-guide",
      name: "Cẩm nang du lịch",
      slug: "travel-guide"
    }
  },
  {
    id: "demo-home-5",
    slug: "meo-dat-xe-tham-quan-bai-dinh-hoa-lu-trong-ngay",
    title: "Mẹo đặt xe tham quan Bái Đính - Hoa Lư trong ngày không bị gấp lịch",
    excerpt: "Gợi ý thứ tự điểm đến để hạn chế chờ đợi và di chuyển vòng.",
    content: "Bài viết demo dùng để hiển thị block blog ngoài trang chủ.",
    coverImageUrl: "/images/services/service-tour.jpg",
    seoTitle: "Mẹo đặt xe tham quan Bái Đính Hoa Lư",
    seoDescription: "Lịch trình tham quan Bái Đính Hoa Lư bằng taxi tối ưu.",
    publishedAt: "2026-04-05T09:10:00.000Z",
    createdAt: "2026-04-05T09:10:00.000Z",
    category: {
      id: "demo-cat-travel-guide",
      name: "Cẩm nang du lịch",
      slug: "travel-guide"
    }
  },
  {
    id: "demo-home-6",
    slug: "bang-gia-taxi-ninh-binh-4-7-16-cho-can-luu-y-gi",
    title: "Bảng giá taxi Ninh Bình 4/7/16 chỗ: cần lưu ý gì trước khi đặt?",
    excerpt: "So sánh nhanh theo loại xe và tình huống đi thực tế để chọn đúng chi phí.",
    content: "Bài viết demo dùng để hiển thị block blog ngoài trang chủ.",
    coverImageUrl: "/images/services/service-ha-noi.webp",
    seoTitle: "Bảng giá taxi Ninh Bình 4 7 16 chỗ",
    seoDescription: "So sánh bảng giá taxi Ninh Bình theo loại xe 4/7/16 chỗ.",
    publishedAt: "2026-04-05T15:40:00.000Z",
    createdAt: "2026-04-05T15:40:00.000Z",
    category: {
      id: "demo-cat-taxi-tips",
      name: "Mẹo đặt xe",
      slug: "taxi-tips"
    }
  }
];

function sortPosts(posts: PublicBlogPost[]) {
  return posts.sort((a, b) => {
    const aDate = new Date(a.publishedAt ?? a.createdAt).getTime();
    const bDate = new Date(b.publishedAt ?? b.createdAt).getTime();
    return bDate - aDate;
  });
}

function mapToPublicPost(post: {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  coverImageUrl: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  publishedAt: Date | null;
  createdAt: Date;
  category: { id: string; name: string; slug: string };
}): PublicBlogPost {
  const localized = localizeKnownPostContent(post.slug, {
    title: post.title,
    excerpt: post.excerpt,
    content: post.content
  });

  return {
    id: post.id,
    slug: post.slug,
    title: localized.title,
    excerpt: localized.excerpt,
    content: localized.content,
    coverImageUrl: post.coverImageUrl,
    seoTitle: post.seoTitle,
    seoDescription: post.seoDescription,
    publishedAt: post.publishedAt ? post.publishedAt.toISOString() : null,
    createdAt: post.createdAt.toISOString(),
    category: {
      id: post.category.id,
      name: localizeCategoryName(post.category.slug, post.category.name),
      slug: post.category.slug
    }
  };
}

export async function getPublishedBlogPosts(): Promise<PublicBlogPost[]> {
  if (!process.env.DATABASE_URL) {
    return sortPosts([...fallbackPosts]);
  }

  try {
    const now = new Date();
    const posts = await prisma.blogPost.findMany({
      where: {
        status: PublishStatus.PUBLISHED,
        OR: [{ publishedAt: null }, { publishedAt: { lte: now } }]
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      },
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }]
    });

    if (posts.length === 0) {
      return sortPosts([...fallbackPosts]);
    }

    return posts.map(mapToPublicPost);
  } catch {
    return sortPosts([...fallbackPosts]);
  }
}

export async function getHomeBlogPosts(limit = 6): Promise<PublicBlogPost[]> {
  const publishedPosts = await getPublishedBlogPosts();
  const postBySlug = new Map<string, PublicBlogPost>();

  for (const post of publishedPosts) {
    postBySlug.set(post.slug, post);
  }

  for (const demoPost of demoHomePosts) {
    if (!postBySlug.has(demoPost.slug)) {
      postBySlug.set(demoPost.slug, demoPost);
    }
  }

  return sortPosts([...postBySlug.values()]).slice(0, Math.max(limit, 1));
}

export async function getPublicBlogCategories(): Promise<PublicBlogCategory[]> {
  const fallbackCategories: PublicBlogCategory[] = [
    { id: "fallback-cat-taxi-tips", slug: "taxi-tips", name: "Mẹo đặt xe" },
    { id: "fallback-cat-travel-guide", slug: "travel-guide", name: "Cẩm nang du lịch" }
  ];

  if (!process.env.DATABASE_URL) {
    return fallbackCategories;
  }

  try {
    const categories = await prisma.blogCategory.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      select: {
        id: true,
        slug: true,
        name: true
      }
    });

    if (categories.length === 0) {
      return fallbackCategories;
    }

    return categories.map((item) => ({
      ...item,
      name: localizeCategoryName(item.slug, item.name)
    }));
  } catch {
    return fallbackCategories;
  }
}

export async function getPublishedBlogPostBySlug(slug: string): Promise<PublicBlogPost | null> {
  const posts = await getPublishedBlogPosts();
  return posts.find((post) => post.slug === slug) ?? null;
}

export async function getRelatedPublishedBlogPosts(
  currentPost: PublicBlogPost,
  limit = 3
): Promise<PublicBlogPost[]> {
  const posts = await getPublishedBlogPosts();
  const sameCategory = posts.filter(
    (post) => post.id !== currentPost.id && post.category.slug === currentPost.category.slug
  );
  const otherPosts = posts.filter(
    (post) => post.id !== currentPost.id && post.category.slug !== currentPost.category.slug
  );

  return [...sameCategory, ...otherPosts].slice(0, limit);
}
