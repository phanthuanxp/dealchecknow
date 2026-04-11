import { AdminMediaManager } from "@/components/admin/media-manager";
import prisma from "@/lib/prisma";

async function getMediaData() {
  if (!process.env.DATABASE_URL) {
    return {
      databaseReady: false,
      items: []
    };
  }

  try {
    const mediaAssets = await prisma.mediaAsset.findMany({
      orderBy: [{ groupKey: "asc" }, { sortOrder: "asc" }, { createdAt: "desc" }]
    });

    return {
      databaseReady: true,
      items: mediaAssets.map((item) => ({
        id: item.id,
        code: item.code,
        title: item.title,
        url: item.url,
        altText: item.altText,
        groupKey: item.groupKey,
        sortOrder: item.sortOrder,
        isActive: item.isActive,
        width: item.width,
        height: item.height,
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

export default async function AdminMediaPage() {
  const { items, databaseReady } = await getMediaData();

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">Thư viện ảnh</h1>
        <p className="mt-2 text-sm text-slate-600">
          Quản lý ảnh banner, ảnh xe và ảnh minh họa cho landing page. Bạn có thể upload trực tiếp
          lên Vercel Blob hoặc nhập URL thủ công, sau đó dùng ngay trong module{" "}
          <strong>Khối nội dung</strong>.
        </p>
      </section>

      <AdminMediaManager items={items} databaseReady={databaseReady} />
    </div>
  );
}
