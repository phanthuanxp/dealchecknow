import { AdminPricingManager, type AdminPricingRoute } from "@/components/admin/pricing-manager";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { resolveTenantIdForSessionUser, whereByTenantId } from "@/lib/tenant";

type SeatKey = "seat4" | "seat7" | "seat16";

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function detectSeatKey(vehicleType: string): SeatKey | null {
  const normalized = normalize(vehicleType);
  if (normalized.includes("16")) {
    return "seat16";
  }
  if (normalized.includes("7")) {
    return "seat7";
  }
  if (normalized.includes("4")) {
    return "seat4";
  }
  return null;
}

function toBaseCode(code: string) {
  return code.replace(/-(xe-4-cho|xe-7-cho|xe-16-cho)(-\d+)?$/, "");
}

async function getPricingData() {
  if (!process.env.DATABASE_URL) {
    return {
      databaseReady: false,
      routes: [] as AdminPricingRoute[]
    };
  }

  try {
    const session = await auth();
    const tenantId = await resolveTenantIdForSessionUser(session?.user);

    let items = await prisma.pricingItem.findMany({
      where: whereByTenantId(tenantId),
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }]
    });

    if (tenantId && items.length === 0) {
      items = await prisma.pricingItem.findMany({
        where: { tenantId: null },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }]
      });
    }

    const routeMap = new Map<string, AdminPricingRoute>();

    for (const item of items) {
      const routeKey = normalize(`${item.routeName}|${item.fromLocation}|${item.toLocation}`);
      const seatKey = detectSeatKey(item.vehicleType);

      if (!routeMap.has(routeKey)) {
        routeMap.set(routeKey, {
          id: item.id,
          routeName: item.routeName,
          fromLocation: item.fromLocation,
          toLocation: item.toLocation,
          baseCode: toBaseCode(item.code),
          currency: item.currency,
          unit: item.unit,
          description: item.description ?? "",
          sortOrder: item.sortOrder,
          isPopular: item.isPopular,
          isActive: item.isActive,
          showOnHome: item.showOnHome,
          updatedAt: item.updatedAt.toISOString(),
          itemIds: [],
          seat4: null,
          seat7: null,
          seat16: null
        });
      }

      const route = routeMap.get(routeKey);
      if (!route) {
        continue;
      }

      route.itemIds.push(item.id);
      route.updatedAt = item.updatedAt.toISOString();
      route.isPopular = route.isPopular || item.isPopular;
      route.isActive = route.isActive || item.isActive;
      route.showOnHome = route.showOnHome || item.showOnHome;
      route.sortOrder = Math.min(route.sortOrder, item.sortOrder);
      route.description = route.description || item.description || "";
      route.baseCode = route.baseCode || toBaseCode(item.code);

      if (seatKey) {
        route[seatKey] = {
          id: item.id,
          price: item.price.toString(),
          vehicleType: item.vehicleType
        };
      }
    }

    return {
      databaseReady: true,
      routes: [...routeMap.values()].sort((a, b) => a.sortOrder - b.sortOrder)
    };
  } catch {
    return {
      databaseReady: false,
      routes: [] as AdminPricingRoute[]
    };
  }
}

export default async function AdminPricingPage() {
  const { routes, databaseReady } = await getPricingData();

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">Quản lý bảng giá</h1>
        <p className="mt-2 text-sm text-slate-600">
          Quản lý theo tuyến, mỗi tuyến gồm 3 mức giá xe 4 chỗ, 7 chỗ, 16 chỗ. Bạn có thể chủ động bật/tắt:
          tuyến phổ biến, hiển thị công khai và hiển thị ngoài trang chủ.
        </p>
      </section>

      <AdminPricingManager routes={routes} databaseReady={databaseReady} />
    </div>
  );
}
