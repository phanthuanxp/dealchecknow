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

const fallbackPosts: PublicBlogPost[] = [
  {
    id: "fallback-blog-1",
    slug: "top-7-dia-diem-du-lich-ninh-binh-trong-ngay",
    title: "Top 7 địa điểm du lịch Ninh Bình trong 1 ngày",
    excerpt: "Gợi ý lịch trình thực tế cho khách đi Tam Cốc, Tràng An, Bái Đính và Hang Múa.",
    content:
      "## Buổi sáng\nBắt đầu từ Tràng An để tránh đông.\n\n## Buổi trưa\nDi chuyển về khu Tam Cốc để ăn trưa và nghỉ ngắn.\n\n## Buổi chiều\nTham quan Hang Múa, ngắm toàn cảnh Ninh Bình lúc hoàng hôn.",
    coverImageUrl: null,
    seoTitle: "Top 7 địa điểm du lịch Ninh Bình trong 1 ngày",
    seoDescription: "Lịch trình tham quan Ninh Bình tối ưu cho khách đi trong ngày.",
    publishedAt: "2026-04-01T08:00:00.000Z",
    createdAt: "2026-04-01T08:00:00.000Z",
    category: {
      id: "fallback-cat-1",
      name: "Cẩm nang du lịch",
      slug: "cam-nang-du-lich"
    }
  },
  {
    id: "fallback-blog-2",
    slug: "kinh-nghiem-chon-taxi-ninh-binh-cho-gia-dinh",
    title: "Kinh nghiệm chọn taxi Ninh Bình cho gia đình",
    excerpt: "Những điểm cần lưu ý để đặt xe phù hợp khi đi cùng trẻ em và người lớn tuổi.",
    content:
      "## Chọn loại xe phù hợp\nƯu tiên xe rộng nếu có nhiều hành lý.\n\n## Xác nhận giá trước chuyến\nNên xác nhận điểm đón, điểm trả và mức giá dự kiến.",
    coverImageUrl: null,
    seoTitle: "Kinh nghiệm chọn taxi Ninh Bình cho gia đình",
    seoDescription: "Checklist đặt taxi an toàn, thoải mái cho nhóm gia đình tại Ninh Bình.",
    publishedAt: "2026-04-02T09:30:00.000Z",
    createdAt: "2026-04-02T09:30:00.000Z",
    category: {
      id: "fallback-cat-2",
      name: "Mẹo đặt xe",
      slug: "meo-dat-xe"
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
  return {
    id: post.id,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    content: post.content,
    coverImageUrl: post.coverImageUrl,
    seoTitle: post.seoTitle,
    seoDescription: post.seoDescription,
    publishedAt: post.publishedAt ? post.publishedAt.toISOString() : null,
    createdAt: post.createdAt.toISOString(),
    category: {
      id: post.category.id,
      name: post.category.name,
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
