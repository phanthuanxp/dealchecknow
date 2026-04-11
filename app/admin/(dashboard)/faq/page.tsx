import { AdminFaqManager } from "@/components/admin/faq-manager";
import prisma from "@/lib/prisma";

async function getFaqData() {
  if (!process.env.DATABASE_URL) {
    return {
      databaseReady: false,
      items: []
    };
  }

  try {
    const faqs = await prisma.faq.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }]
    });

    return {
      databaseReady: true,
      items: faqs.map((faq) => ({
        id: faq.id,
        slug: faq.slug,
        question: faq.question,
        answer: faq.answer,
        isActive: faq.isActive,
        sortOrder: faq.sortOrder,
        updatedAt: faq.updatedAt.toISOString()
      }))
    };
  } catch {
    return {
      databaseReady: false,
      items: []
    };
  }
}

export default async function AdminFaqPage() {
  const { items, databaseReady } = await getFaqData();

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">Quản lý hỏi đáp</h1>
        <p className="mt-2 text-sm text-slate-600">
          Quản lý đầy đủ câu hỏi thường gặp, bao gồm bật hoặc tắt hiển thị để kiểm soát nội dung trên trang công khai.
        </p>
      </section>

      <AdminFaqManager items={items} databaseReady={databaseReady} />
    </div>
  );
}
