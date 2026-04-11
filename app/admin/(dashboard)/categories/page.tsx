import { AdminCategoriesManager } from "@/components/admin/categories-manager";
import prisma from "@/lib/prisma";

async function getCategoryData() {
  if (!process.env.DATABASE_URL) {
    return {
      databaseReady: false,
      items: []
    };
  }

  try {
    const categories = await prisma.blogCategory.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      include: {
        _count: {
          select: {
            posts: true
          }
        }
      }
    });

    return {
      databaseReady: true,
      items: categories.map((category) => ({
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description ?? "",
        sortOrder: category.sortOrder,
        isActive: category.isActive,
        postCount: category._count.posts,
        updatedAt: category.updatedAt.toISOString()
      }))
    };
  } catch {
    return {
      databaseReady: false,
      items: []
    };
  }
}

export default async function AdminCategoriesPage() {
  const { items, databaseReady } = await getCategoryData();

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">Quản lý danh mục bài viết</h1>
        <p className="mt-2 text-sm text-slate-600">
          Tạo và quản trị danh mục để nhóm nội dung bài viết theo chủ đề, hỗ trợ SEO và điều hướng nội dung rõ ràng.
        </p>
      </section>

      <AdminCategoriesManager items={items} databaseReady={databaseReady} />
    </div>
  );
}
