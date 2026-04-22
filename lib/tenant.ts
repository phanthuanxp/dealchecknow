import { cache } from "react";

import prisma from "@/lib/prisma";

export type TenantContext = {
  id: string;
  slug: string;
  name: string;
};

const DEFAULT_TENANT_SLUG =
  process.env.DEFAULT_TENANT_SLUG?.trim() || process.env.TENANT_SLUG?.trim() || "taxininhbinh";

const getDefaultTenant = cache(async (): Promise<TenantContext | null> => {
  if (!process.env.DATABASE_URL) {
    return null;
  }

  try {
    const bySlug = await prisma.tenant.findFirst({
      where: {
        slug: DEFAULT_TENANT_SLUG,
        isActive: true
      },
      select: {
        id: true,
        slug: true,
        name: true
      }
    });

    if (bySlug) {
      return bySlug;
    }

    const firstActiveTenant = await prisma.tenant.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        slug: true,
        name: true
      }
    });

    return firstActiveTenant;
  } catch {
    return null;
  }
});

export async function resolveTenantByHost(host: string | null | undefined) {
  void host;
  return getDefaultTenant();
}

export async function resolveTenantForCurrentRequest() {
  return getDefaultTenant();
}

export async function resolveTenantForRequest(request: Request) {
  void request;
  return getDefaultTenant();
}

export async function resolveTenantIdForSessionUser(sessionUser?: {
  id?: string | null;
  tenantId?: string | null;
}) {
  if (sessionUser?.tenantId) {
    return sessionUser.tenantId;
  }

  if (!process.env.DATABASE_URL) {
    return null;
  }

  if (sessionUser?.id) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: sessionUser.id },
        select: { tenantId: true }
      });

      if (user?.tenantId) {
        return user.tenantId;
      }
    } catch {
      // ignore and fallback
    }
  }

  const tenant = await getDefaultTenant();
  return tenant?.id ?? null;
}

export function whereByTenantId(tenantId?: string | null) {
  if (!tenantId) {
    return {};
  }

  return { tenantId };
}
