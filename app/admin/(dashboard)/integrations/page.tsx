import { UserRole } from "@prisma/client";

import {
  AdminIntegrationsManager,
  type IntegrationTenantOption
} from "@/components/admin/integrations-manager";
import { auth } from "@/lib/auth";
import { listApiCredentialsForTenant } from "@/lib/api-credentials";
import prisma from "@/lib/prisma";
import { resolveTenantIdForSessionUser } from "@/lib/tenant";

type AdminIntegrationsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function firstParamValue(input: string | string[] | undefined) {
  if (Array.isArray(input)) {
    return input[0] ?? "";
  }
  return input ?? "";
}

async function getTenantOptions(canManageAll: boolean): Promise<IntegrationTenantOption[]> {
  if (!process.env.DATABASE_URL || !canManageAll) {
    return [];
  }

  const tenants = await prisma.tenant.findMany({
    where: {
      isActive: true
    },
    orderBy: {
      name: "asc"
    },
    select: {
      id: true,
      name: true,
      slug: true
    }
  });

  return tenants.map((tenant) => ({
    id: tenant.id,
    name: tenant.name,
    slug: tenant.slug
  }));
}

export default async function AdminIntegrationsPage({ searchParams }: AdminIntegrationsPageProps) {
  const session = await auth();
  const resolvedSearchParams = await searchParams;
  const canManageAll = session?.user?.role === UserRole.ADMIN;
  const sessionTenantId = session?.user ? await resolveTenantIdForSessionUser(session.user) : null;

  const tenantOptions = await getTenantOptions(canManageAll);
  const requestedTenant = firstParamValue(resolvedSearchParams.tenant);

  const targetTenantId =
    canManageAll && requestedTenant
      ? tenantOptions.some((item) => item.id === requestedTenant)
        ? requestedTenant
        : sessionTenantId
      : sessionTenantId;

  const credentials = await listApiCredentialsForTenant(targetTenantId ?? null);
  const targetTenantLabel =
    tenantOptions.find((item) => item.id === targetTenantId)?.name ?? "Website hien tai";

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">API Credentials Hub</h1>
        <p className="mt-2 text-sm text-slate-600">
          Quan ly API key theo tung website. Secret duoc ma hoa bang ENCRYPTION_MASTER_KEY va chi hien thi dang mask.
        </p>
      </section>

      <AdminIntegrationsManager
        credentials={credentials}
        databaseReady={Boolean(process.env.DATABASE_URL)}
        encryptionReady={Boolean(process.env.ENCRYPTION_MASTER_KEY)}
        tenantOptions={tenantOptions}
        selectedTenantId={targetTenantId ?? ""}
        selectedTenantLabel={targetTenantLabel}
        canManageAll={canManageAll}
      />
    </div>
  );
}
