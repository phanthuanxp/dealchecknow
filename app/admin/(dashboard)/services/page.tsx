import { AdminServicesManager, type AdminServiceItem } from "@/components/admin/services-manager";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { resolveTenantIdForSessionUser, whereByTenantId } from "@/lib/tenant";

function toPricingText(value: unknown) {
  if (!Array.isArray(value)) {
    return "";
  }

  return value
    .map((item) => {
      if (!item || typeof item !== "object") {
        return "";
      }

      const vehicle = typeof (item as Record<string, unknown>).vehicle === "string" ? (item as Record<string, string>).vehicle : "";
      const price = typeof (item as Record<string, unknown>).price === "string" ? (item as Record<string, string>).price : "";
      const note = typeof (item as Record<string, unknown>).note === "string" ? (item as Record<string, string>).note : "";

      if (!vehicle || !price) {
        return "";
      }

      return `${vehicle}|${price}|${note}`;
    })
    .filter(Boolean)
    .join("\n");
}

function toFaqText(value: unknown) {
  if (!Array.isArray(value)) {
    return "";
  }

  return value
    .map((item) => {
      if (!item || typeof item !== "object") {
        return "";
      }

      const question =
        typeof (item as Record<string, unknown>).question === "string"
          ? (item as Record<string, string>).question
          : "";
      const answer =
        typeof (item as Record<string, unknown>).answer === "string"
          ? (item as Record<string, string>).answer
          : "";

      if (!question || !answer) {
        return "";
      }

      return `${question}|${answer}`;
    })
    .filter(Boolean)
    .join("\n");
}

function toLinesText(value: string[]) {
  return value.join("\n");
}

async function getServiceAdminData() {
  if (!process.env.DATABASE_URL) {
    return {
      databaseReady: false,
      services: [] as AdminServiceItem[],
      serviceOptions: [] as Array<{ slug: string; title: string }>,
      mediaOptions: [] as Array<{ id: string; title: string; url: string }>
    };
  }

  try {
    const session = await auth();
    const tenantId = await resolveTenantIdForSessionUser(session?.user);

    const [tableCheck, mediaAssets] = await Promise.all([
      prisma.$queryRaw<Array<{ table_exists: boolean }>>`
        SELECT EXISTS (
          SELECT 1
          FROM information_schema.tables
          WHERE table_schema = 'public'
            AND table_name = 'ServicePage'
        ) AS table_exists
      `,
      prisma.mediaAsset.findMany({
        where: {
          ...whereByTenantId(tenantId),
          isActive: true
        },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
        take: 120
      })
    ]);

    const hasServiceTable = Boolean(tableCheck[0]?.table_exists);
    if (!hasServiceTable) {
      return {
        databaseReady: false,
        services: [] as AdminServiceItem[],
        serviceOptions: [] as Array<{ slug: string; title: string }>,
        mediaOptions: mediaAssets.map((item) => ({
          id: item.id,
          title: item.title,
          url: item.url
        }))
      };
    }

    let services = await prisma.servicePage.findMany({
      where: whereByTenantId(tenantId),
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }]
    });

    if (tenantId && services.length === 0) {
      services = await prisma.servicePage.findMany({
        where: { tenantId: null },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }]
      });
    }

    const mappedServices: AdminServiceItem[] = services.map((item) => ({
      id: item.id,
      title: item.title,
      slug: item.slug,
      shortDescription: item.shortDescription,
      metaTitle: item.metaTitle ?? "",
      metaDescription: item.metaDescription ?? "",
      h1: item.h1 ?? "",
      heroTitle: item.heroTitle ?? "",
      heroDescription: item.heroDescription ?? "",
      featuredImage: item.featuredImage ?? "",
      mainContent: item.mainContent ?? "",
      pricingTableText: toPricingText(item.pricingTable),
      faqItemsText: toFaqText(item.faqItems),
      routeBenefitsText: toLinesText(item.routeBenefits),
      pickupLocationsText: toLinesText(item.pickupLocations),
      dropoffLocationsText: toLinesText(item.dropoffLocations),
      trustHighlightsText: toLinesText(item.trustHighlights),
      legacySlugsText: toLinesText(item.legacySlugs),
      canonicalUrl: item.canonicalUrl ?? "",
      relatedServiceSlugs: item.relatedServiceSlugs,
      sortOrder: item.sortOrder,
      isPublished: item.isPublished,
      updatedAt: item.updatedAt.toISOString()
    }));

    return {
      databaseReady: true,
      services: mappedServices,
      serviceOptions: mappedServices.map((item) => ({
        slug: item.slug,
        title: item.title
      })),
      mediaOptions: mediaAssets.map((item) => ({
        id: item.id,
        title: item.title,
        url: item.url
      }))
    };
  } catch {
    return {
      databaseReady: false,
      services: [] as AdminServiceItem[],
      serviceOptions: [] as Array<{ slug: string; title: string }>,
      mediaOptions: [] as Array<{ id: string; title: string; url: string }>
    };
  }
}

export default async function AdminServicesPage() {
  const { databaseReady, services, serviceOptions, mediaOptions } = await getServiceAdminData();

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">Quản lý dịch vụ SEO</h1>
        <p className="mt-2 text-sm text-slate-600">
          Tạo và cập nhật landing page dịch vụ taxi theo chuẩn SEO, quản lý publish/draft, canonical, FAQ và bảng giá ngay trong AdminCP.
        </p>
      </section>

      <AdminServicesManager
        services={services}
        serviceOptions={serviceOptions}
        mediaOptions={mediaOptions}
        databaseReady={databaseReady}
      />
    </div>
  );
}
