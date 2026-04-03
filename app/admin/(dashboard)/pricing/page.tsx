import { AdminPricingManager } from "@/components/admin/pricing-manager";
import prisma from "@/lib/prisma";

async function getPricingData() {
  if (!process.env.DATABASE_URL) {
    return {
      databaseReady: false,
      items: []
    };
  }

  try {
    const items = await prisma.pricingItem.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }]
    });

    return {
      databaseReady: true,
      items: items.map((item) => ({
        id: item.id,
        code: item.code,
        routeName: item.routeName,
        fromLocation: item.fromLocation,
        toLocation: item.toLocation,
        vehicleType: item.vehicleType,
        price: item.price.toString(),
        currency: item.currency,
        unit: item.unit,
        description: item.description ?? "",
        sortOrder: item.sortOrder,
        isPopular: item.isPopular,
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

export default async function AdminPricingPage() {
  const { items, databaseReady } = await getPricingData();

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">Quản lý bảng giá</h1>
        <p className="mt-2 text-sm text-slate-600">
          CRUD tuyến giá, loại xe, giá tham khảo và trạng thái hiển thị trên public site.
        </p>
      </section>

      <AdminPricingManager items={items} databaseReady={databaseReady} />
    </div>
  );
}
