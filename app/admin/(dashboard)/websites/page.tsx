import { UserRole } from "@prisma/client";

import { AdminWebsitesManager, type AdminWebsiteItem } from "@/components/admin/websites-manager";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

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

    const websites: AdminWebsiteItem[] = tenants.map((tenant) => {
      const primaryDomain = tenant.domains.find((domain) => domain.isPrimary)?.domain ?? tenant.domains[0]?.domain ?? "";
      const aliasDomainsText = tenant.domains
        .map((domain) => domain.domain)
        .filter((domain) => domain !== primaryDomain)
        .join("\n");

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
        <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">Quản lý website</h1>
        <p className="mt-2 text-sm text-slate-600">
          Tạo thêm website taxi mới, cấu hình domain và quản lý trạng thái hoạt động trên cùng một CMS.
        </p>
      </section>

      <AdminWebsitesManager items={websites} databaseReady={databaseReady} canManage={canManage} />
    </div>
  );
}
