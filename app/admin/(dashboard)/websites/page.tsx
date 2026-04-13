import { UserRole } from "@prisma/client";

import { AdminWebsitesManager, type AdminWebsiteItem } from "@/components/admin/websites-manager";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import {
  evaluateTenantStatus,
  lifecycleSettingKey,
  parseTenantLifecycleValue
} from "@/lib/tenant-lifecycle";
import {
  defaultTenantTheme,
  parseTenantThemeValue,
  tenantThemeSettingKey
} from "@/lib/tenant-theme";

function toDateInputValue(value: string | null) {
  if (!value) {
    return "";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  return parsed.toISOString().slice(0, 10);
}

async function getWebsiteAdminData(canManage: boolean) {
  if (!process.env.DATABASE_URL || !canManage) {
    return {
      databaseReady: Boolean(process.env.DATABASE_URL),
      websites: [] as AdminWebsiteItem[]
    };
  }

  try {
    const tenants = await prisma.tenant.findMany({
      orderBy: [{ isActive: "desc" }, { createdAt: "asc" }],
      include: {
        domains: {
          orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }]
        },
        _count: {
          select: {
            users: true,
            blogPosts: true,
            quoteRequests: true,
            servicePages: true
          }
        }
      }
    });

    const tenantSettingRows = await prisma.siteSetting.findMany({
      where: {
        key: {
          in: [lifecycleSettingKey, tenantThemeSettingKey]
        },
        tenantId: {
          in: tenants.map((tenant) => tenant.id)
        }
      },
      select: {
        key: true,
        tenantId: true,
        value: true
      }
    });

    const lifecycleMap = new Map<string, ReturnType<typeof parseTenantLifecycleValue>>();
    const themeMap = new Map<string, ReturnType<typeof parseTenantThemeValue>>();
    for (const row of tenantSettingRows) {
      if (!row.tenantId) {
        continue;
      }
      if (row.key === lifecycleSettingKey) {
        lifecycleMap.set(row.tenantId, parseTenantLifecycleValue(row.value));
      }
      if (row.key === tenantThemeSettingKey) {
        themeMap.set(row.tenantId, parseTenantThemeValue(row.value));
      }
    }

    const websites: AdminWebsiteItem[] = tenants.map((tenant) => {
      const primaryDomain = tenant.domains.find((domain) => domain.isPrimary)?.domain ?? tenant.domains[0]?.domain ?? "";
      const aliasDomainsText = tenant.domains
        .map((domain) => domain.domain)
        .filter((domain) => domain !== primaryDomain)
        .join("\n");
      const lifecycle = lifecycleMap.get(tenant.id) ?? {
        manualStatus: "ACTIVE" as const,
        startsAt: null,
        expiresAt: null,
        graceDays: 0
      };
      const theme = themeMap.get(tenant.id) ?? defaultTenantTheme;
      const effectiveStatus = evaluateTenantStatus(
        {
          isActive: tenant.isActive
        },
        lifecycle
      );

      return {
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug,
        cmsDomain: tenant.cmsDomain ?? "",
        isActive: tenant.isActive,
        primaryDomain,
        aliasDomainsText,
        updatedAt: tenant.updatedAt.toISOString(),
        domains: tenant.domains.map((domain) => ({
          domain: domain.domain,
          isPrimary: domain.isPrimary,
          isActive: domain.isActive
        })),
        lifecycle: {
          manualStatus: lifecycle.manualStatus,
          startsAt: toDateInputValue(lifecycle.startsAt),
          expiresAt: toDateInputValue(lifecycle.expiresAt),
          graceDays: lifecycle.graceDays,
          effectiveStatus
        },
        theme: {
          preset: theme.preset,
          primaryColor: theme.primaryColor,
          secondaryColor: theme.secondaryColor,
          accentColor: theme.accentColor,
          backgroundFrom: theme.backgroundFrom,
          backgroundTo: theme.backgroundTo,
          headingFont: theme.headingFont,
          bodyFont: theme.bodyFont
        },
        stats: {
          users: tenant._count.users,
          posts: tenant._count.blogPosts,
          leads: tenant._count.quoteRequests,
          services: tenant._count.servicePages
        }
      };
    });

    return {
      databaseReady: true,
      websites
    };
  } catch {
    return {
      databaseReady: false,
      websites: [] as AdminWebsiteItem[]
    };
  }
}

export default async function AdminWebsitesPage() {
  const session = await auth();
  const canManage = session?.user?.role === UserRole.ADMIN;
  const { databaseReady, websites } = await getWebsiteAdminData(canManage);

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">Quản lý website đa domain</h1>
        <p className="mt-2 text-sm text-slate-600">
          Trung tâm tạo và vận hành nhiều website taxi: cấu hình domain, trạng thái hoạt động, thời hạn thuê bao
          và theo dõi dữ liệu từng website.
        </p>
      </section>

      <AdminWebsitesManager items={websites} databaseReady={databaseReady} canManage={canManage} />
    </div>
  );
}
