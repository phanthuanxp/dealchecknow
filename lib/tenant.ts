import { cache } from "react";
import { headers } from "next/headers";

import prisma from "@/lib/prisma";

export type TenantContext = {
  id: string;
  slug: string;
  name: string;
};

const DEFAULT_TENANT_SLUG =
  process.env.DEFAULT_TENANT_SLUG?.trim() || process.env.TENANT_SLUG?.trim() || "taxininhbinh";

function normalizeHost(raw: string | null | undefined) {
  if (!raw) {
    return "";
  }

  return raw
    .split(",")[0]
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/\/+$/, "")
    .replace(/:\d+$/, "");
}

function getHostCandidates(host: string) {
  const normalized = normalizeHost(host);
  if (!normalized) {
    return [];
  }

  if (normalized.startsWith("www.")) {
    return [normalized, normalized.slice(4)];
  }

  return [normalized, `www.${normalized}`];
}

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

const resolveTenantByHostCached = cache(async (host: string): Promise<TenantContext | null> => {
  if (!process.env.DATABASE_URL) {
    return null;
  }

  const candidates = getHostCandidates(host);
  if (candidates.length === 0) {
    return getDefaultTenant();
  }

  try {
    const domainMatch = await prisma.tenantDomain.findFirst({
      where: {
        domain: { in: candidates },
        isActive: true,
        tenant: {
          isActive: true
        }
      },
      orderBy: [{ isPrimary: "desc" }, { updatedAt: "desc" }],
      select: {
        tenant: {
          select: {
            id: true,
            slug: true,
            name: true
          }
        }
      }
    });

    if (domainMatch?.tenant) {
      return domainMatch.tenant;
    }

    const cmsTenantCandidates = await prisma.tenant.findMany({
      where: {
        isActive: true,
        cmsDomain: {
          not: null
        }
      },
      select: {
        id: true,
        slug: true,
        name: true,
        cmsDomain: true
      }
    });

    const cmsTenantMatch = cmsTenantCandidates.find((item) =>
      getHostCandidates(item.cmsDomain ?? "").includes(candidates[0])
    );

    if (cmsTenantMatch) {
      return {
        id: cmsTenantMatch.id,
        slug: cmsTenantMatch.slug,
        name: cmsTenantMatch.name
      };
    }

    return getDefaultTenant();
  } catch {
    return getDefaultTenant();
  }
});

export async function resolveTenantByHost(host: string | null | undefined) {
  return resolveTenantByHostCached(normalizeHost(host));
}

export async function resolveTenantForCurrentRequest() {
  try {
    const requestHeaders = await headers();
    const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
    return resolveTenantByHost(host);
  } catch {
    return getDefaultTenant();
  }
}

export async function resolveTenantForRequest(request: Request) {
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  return resolveTenantByHost(host);
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
      // ignore and fallback to request/domain tenant
    }
  }

  const requestTenant = await resolveTenantForCurrentRequest();
  return requestTenant?.id ?? null;
}

export function whereByTenantId(tenantId?: string | null) {
  if (!tenantId) {
    return {};
  }

  return { tenantId };
}
