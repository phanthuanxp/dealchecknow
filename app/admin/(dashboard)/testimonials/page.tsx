import { AdminTestimonialsManager } from "@/components/admin/testimonials-manager";
import prisma from "@/lib/prisma";

async function getTestimonialsData() {
  if (!process.env.DATABASE_URL) {
    return {
      databaseReady: false,
      items: []
    };
  }

  try {
    const items = await prisma.testimonial.findMany({
      orderBy: [{ isFeatured: "desc" }, { sortOrder: "asc" }, { createdAt: "desc" }]
    });

    return {
      databaseReady: true,
      items: items.map((item) => ({
        id: item.id,
        code: item.code,
        customerName: item.customerName,
        content: item.content,
        rating: item.rating,
        location: item.location ?? "",
        serviceName: item.serviceName ?? "",
        sortOrder: item.sortOrder,
        isFeatured: item.isFeatured,
        isActive: item.isActive,
        updatedAt: item.updatedAt.toISOString()
      }))
    };
  } catch {
    return {
      databaseReady: false,
      items: []
    };
  }
}

export default async function AdminTestimonialsPage() {
  const { items, databaseReady } = await getTestimonialsData();

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">Quản lý đánh giá khách hàng</h1>
        <p className="mt-2 text-sm text-slate-600">
          Quản lý đầy đủ đánh giá khách hàng, gồm đánh dấu nổi bật và bật hoặc tắt hiển thị trên trang chủ.
        </p>
      </section>

      <AdminTestimonialsManager items={items} databaseReady={databaseReady} />
    </div>
  );
}
