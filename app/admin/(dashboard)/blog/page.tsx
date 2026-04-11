import { PublishStatus, type Prisma } from "@prisma/client";
import Link from "next/link";

import { AdminBlogListManager } from "@/components/admin/blog-list-manager";
import prisma from "@/lib/prisma";

type BlogStatusFilter = "all" | "draft" | "published";

type AdminBlogPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function firstParamValue(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }
  return value ?? "";
}

function resolveStatusFilter(rawValue: string): BlogStatusFilter {
  if (rawValue === "draft" || rawValue === "published") {
    return rawValue;
  }
  return "all";
}

async function getBlogData(searchParams: Record<string, string | string[] | undefined>) {
  const status = resolveStatusFilter(firstParamValue(searchParams.status));
  const keyword = firstParamValue(searchParams.q).trim();

  if (!process.env.DATABASE_URL) {
    return {
      databaseReady: false,
      filters: { status, keyword },
      items: []
    };
  }

  const where: Prisma.BlogPostWhereInput = {};

  if (status === "draft") {
    where.status = PublishStatus.DRAFT;
  }

  if (status === "published") {
    where.status = PublishStatus.PUBLISHED;
  }

  if (keyword) {
    where.OR = [
      { title: { contains: keyword, mode: "insensitive" } },
      { slug: { contains: keyword, mode: "insensitive" } }
    ];
  }

  try {
    const posts = await prisma.blogPost.findMany({
      where,
      include: {
        category: {
          select: {
            name: true
          }
        }
      },
      orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }]
    });

    return {
      databaseReady: true,
      filters: { status, keyword },
      items: posts.map((post) => ({
        id: post.id,
        title: post.title,
        slug: post.slug,
        status: post.status,
        categoryName: post.category.name,
        publishedAt: post.publishedAt?.toISOString() ?? null,
        createdAt: post.createdAt.toISOString(),
        updatedAt: post.updatedAt.toISOString()
      }))
    };
  } catch {
    return {
      databaseReady: false,
      filters: { status, keyword },
      items: []
    };
  }
}

export default async function AdminBlogPage({ searchParams }: AdminBlogPageProps) {
  const resolvedSearchParams = await searchParams;
  const { items, databaseReady, filters } = await getBlogData(resolvedSearchParams);

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">Quản lý bài viết</h1>
            <p className="mt-2 text-sm text-slate-600">
              Danh sách bài viết, lọc theo bản nháp hoặc đã xuất bản và quản lý thông tin SEO cho nội dung công khai.
            </p>
          </div>
          <Link
            href="/admincp/blog/new"
            className="inline-flex items-center rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-800"
          >
            Tạo bài viết mới
          </Link>
        </div>
      </section>

      <AdminBlogListManager items={items} databaseReady={databaseReady} filters={filters} />
    </div>
  );
}
