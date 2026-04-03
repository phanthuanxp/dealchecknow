import Link from "next/link";
import { PublishStatus } from "@prisma/client";

import { AdminBlogEditorForm } from "@/components/admin/blog-editor-form";
import prisma from "@/lib/prisma";

async function getBlogNewData() {
  if (!process.env.DATABASE_URL) {
    return {
      databaseReady: false,
      categories: []
    };
  }

  try {
    const categories = await prisma.blogCategory.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        isActive: true
      }
    });

    return {
      databaseReady: true,
      categories
    };
  } catch {
    return {
      databaseReady: false,
      categories: []
    };
  }
}

export default async function AdminBlogNewPage() {
  const { categories, databaseReady } = await getBlogNewData();

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">Tạo bài blog mới</h1>
            <p className="mt-2 text-sm text-slate-600">
              Soạn nội dung chuẩn SEO, chọn danh mục và thiết lập trạng thái draft/published.
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
        mode="create"
        categories={categories}
        databaseReady={databaseReady}
        initialData={{
          title: "",
          slug: "",
          excerpt: "",
          content: "",
          coverImageUrl: "",
          categoryId: categories[0]?.id ?? "",
          seoTitle: "",
          seoDescription: "",
          status: PublishStatus.DRAFT,
          publishedAt: ""
        }}
      />
    </div>
  );
}
