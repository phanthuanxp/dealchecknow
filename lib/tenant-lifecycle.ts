import { cache } from "react";
import type { Prisma } from "@prisma/client";
import { headers } from "next/headers";

import prisma from "@/lib/prisma";

const LIFECYCLE_SETTING_KEY = "tenant_lifecycle";
const DEFAULT_TENANT_SLUG =
  process.env.DEFAULT_TENANT_SLUG?.trim() || process.env.TENANT_SLUG?.trim() || "taxininhbinh";

export type TenantLifecycleManualStatus = "ACTIVE" | "PAUSED";
export type TenantEffectiveStatus = "active" | "paused" | "expired" | "not_found";

export type TenantLifecycleConfig = {
  manualStatus: TenantLifecycleManualStatus;
  startsAt: string | null;
  expiresAt: string | null;
  graceDays: number;
};

type TenantBasic = {
  id: string;
  slug: string;
  name: string;
  isActive: boolean;
};

export type TenantRuntimeState = {
  status: TenantEffectiveStatus;
  tenant: TenantBasic | null;
  config: TenantLifecycleConfig;
  reason: string;
  host: string;
};

const DEFAULT_LIFECYCLE_CONFIG: TenantLifecycleConfig = {
  manualStatus: "ACTIVE",
  startsAt: null,
  expiresAt: null,
  graceDays: 0
};

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

function parseIsoDate(value: unknown) {
  if (typeof value !== "string" || !value.trim()) {
    return null;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed.toISOString();
}

function parseGraceDays(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.max(0, Math.min(365, Math.floor(value)));
  }

  if (typeof value === "string") {
    const numberValue = Number(value);
    if (Number.isFinite(numberValue)) {
      return Math.max(0, Math.min(365, Math.floor(numberValue)));
    }
  }

  return 0;
}

function asRecord(value: Prisma.JsonValue | null | undefined): Record<string, unknown> | null {
  if (!value || Array.isArray(value) || typeof value !== "object") {
    return null;
  }

  return value as Record<string, unknown>;
}

export function parseTenantLifecycleValue(value: Prisma.JsonValue | null | undefined): TenantLifecycleConfig {
  const record = asRecord(value);
  const rawStatus = record?.manualStatus;
  const manualStatus: TenantLifecycleManualStatus = rawStatus === "PAUSED" ? "PAUSED" : "ACTIVE";

  return {
    manualStatus,
    startsAt: parseIsoDate(record?.startsAt),
    expiresAt: parseIsoDate(record?.expiresAt),
    graceDays: parseGraceDays(record?.graceDays)
  };
}

export function toTenantLifecycleJson(config: TenantLifecycleConfig): Prisma.JsonObject {
  return {
    manualStatus: config.manualStatus,
    startsAt: config.startsAt,
    expiresAt: config.expiresAt,
    graceDays: config.graceDays
  };
}

export function evaluateTenantStatus(
  tenant: Pick<TenantBasic, "isActive"> | null | undefined,
  config: TenantLifecycleConfig,
  nowDate = new Date()
): TenantEffectiveStatus {
  if (!tenant) {
    return "not_found";
  }

  if (!tenant.isActive || config.manualStatus === "PAUSED") {
    return "paused";
  }

  const now = nowDate.getTime();

  if (config.startsAt) {
    const startsAt = new Date(config.startsAt).getTime();
    if (!Number.isNaN(startsAt) && now < startsAt) {
      return "paused";
    }
  }

  if (config.expiresAt) {
    const expiresAt = new Date(config.expiresAt).getTime();
    if (!Number.isNaN(expiresAt)) {
      const effectiveExpiresAt = expiresAt + config.graceDays * 24 * 60 * 60 * 1000;
      if (now > effectiveExpiresAt) {
        return "expired";
      }
    }
  }

  return "active";
}

export async function getTenantLifecycleByTenantId(tenantId: string | null | undefined) {
  if (!tenantId || !process.env.DATABASE_URL) {
    return DEFAULT_LIFECYCLE_CONFIG;
  }

  try {
    const row = await prisma.siteSetting.findFirst({
      where: {
        tenantId,
        key: LIFECYCLE_SETTING_KEY
      },
      select: {
        value: true
      }
    });

    if (!row) {
      return DEFAULT_LIFECYCLE_CONFIG;
    }

    return parseTenantLifecycleValue(row.value);
  } catch {
    return DEFAULT_LIFECYCLE_CONFIG;
  }
}

export async function upsertTenantLifecycleByTenantId(tenantId: string, config: TenantLifecycleConfig) {
  await prisma.siteSetting.upsert({
    where: {
      tenantId_key: {
        tenantId,
        key: LIFECYCLE_SETTING_KEY
      }
    },
    update: {
      value: toTenantLifecycleJson(config),
      groupKey: "tenant",
      isPublic: false,
      description: "Vòng đời hoạt động website tenant"
    },
    create: {
      tenantId,
      key: LIFECYCLE_SETTING_KEY,
      value: toTenantLifecycleJson(config),
      groupKey: "tenant",
      isPublic: false,
      description: "Vòng đời hoạt động website tenant"
    }
  });
}

const resolveTenantByHostRuntime = cache(async (host: string): Promise<TenantBasic | null> => {
  if (!process.env.DATABASE_URL) {
    return null;
  }

  const hostCandidates = getHostCandidates(host);

  if (hostCandidates.length > 0) {
    const domainMatch = await prisma.tenantDomain.findFirst({
      where: {
        domain: { in: hostCandidates }
      },
      orderBy: [{ isPrimary: "desc" }, { updatedAt: "desc" }],
      select: {
        tenant: {
          select: {
            id: true,
            slug: true,
            name: true,
            isActive: true
          }
        }
      }
    });

    if (domainMatch?.tenant) {
      return domainMatch.tenant;
    }
  }

  const fallback = await prisma.tenant.findFirst({
    where: {
      slug: DEFAULT_TENANT_SLUG
    },
    select: {
      id: true,
      slug: true,
      name: true,
      isActive: true
    }
  });

  if (fallback) {
    return fallback;
  }

  return prisma.tenant.findFirst({
    where: { isActive: true },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      slug: true,
      name: true,
      isActive: true
    }
  });
});

export async function getCurrentTenantRuntimeState(): Promise<TenantRuntimeState> {
  if (!process.env.DATABASE_URL) {
    return {
      status: "active",
      tenant: null,
      config: DEFAULT_LIFECYCLE_CONFIG,
      reason: "database_not_configured",
      host: ""
    };
  }

  try {
    const requestHeaders = await headers();
    const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
    const normalizedHost = normalizeHost(host);
    const tenant = await resolveTenantByHostRuntime(normalizedHost);

    if (!tenant) {
      return {
        status: "not_found",
        tenant: null,
        config: DEFAULT_LIFECYCLE_CONFIG,
        reason: "tenant_not_found",
        host: normalizedHost
      };
    }

    const config = await getTenantLifecycleByTenantId(tenant.id);
    const status = evaluateTenantStatus(tenant, config);

    return {
      status,
      tenant,
      config,
      reason: status,
      host: normalizedHost
    };
  } catch {
    return {
      status: "active",
      tenant: null,
      config: DEFAULT_LIFECYCLE_CONFIG,
      reason: "resolver_failed",
      host: ""
    };
  }
}

export const lifecycleSettingKey = LIFECYCLE_SETTING_KEY;
