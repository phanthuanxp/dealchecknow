import Link from "next/link";
import { notFound } from "next/navigation";

import { AdminBlogEditorForm } from "@/components/admin/blog-editor-form";
import prisma from "@/lib/prisma";

type AdminBlogEditPageProps = {
  params: Promise<{
    id: string;
  }>;
};

async function getBlogEditData(id: string) {
  if (!process.env.DATABASE_URL) {
    return {
      databaseReady: false,
      categories: [],
      post: null
    };
  }

  try {
    const [categories, post] = await Promise.all([
      prisma.blogCategory.findMany({
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
        select: {
          id: true,
          name: true,
          isActive: true
        }
      }),
      prisma.blogPost.findUnique({
        where: { id },
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          content: true,
          coverImageUrl: true,
          categoryId: true,
          seoTitle: true,
          seoDescription: true,
          status: true,
          publishedAt: true
        }
      })
    ]);

    return {
      databaseReady: true,
      categories,
      post
    };
  } catch {
    return {
      databaseReady: false,
      categories: [],
      post: null
    };
  }
}

export default async function AdminBlogEditPage({ params }: AdminBlogEditPageProps) {
  const resolvedParams = await params;
  const { categories, post, databaseReady } = await getBlogEditData(resolvedParams.id);

  if (!post) {
    notFound();
  }

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">Chỉnh sửa bài blog</h1>
            <p className="mt-2 text-sm text-slate-600">
              Cập nhật nội dung, SEO metadata và trạng thái xuất bản của bài viết.
            </p>
          </div>
          <Link
            href="/admin/blog"
            className="inline-flex items-center rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Quay lại danh sách blog
          </Link>
        </div>
      </section>

      <AdminBlogEditorForm
        mode="edit"
        categories={categories}
        databaseReady={databaseReady}
        initialData={{
          id: post.id,
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt ?? "",
          content: post.content,
          coverImageUrl: post.coverImageUrl ?? "",
          categoryId: post.categoryId,
          seoTitle: post.seoTitle ?? "",
          seoDescription: post.seoDescription ?? "",
          status: post.status,
          publishedAt: post.publishedAt?.toISOString() ?? ""
        }}
      />
    </div>
  );
}
