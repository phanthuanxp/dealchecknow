"use server";

import { UserRole } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import {
  normalizeTenantThemeInput,
  upsertTenantThemeByTenantId
} from "@/lib/tenant-theme";
import {
  type TenantLifecycleConfig,
  upsertTenantLifecycleByTenantId
} from "@/lib/tenant-lifecycle";

type ActionStatus = "idle" | "success" | "error";

export type WebsiteActionState = {
  status: ActionStatus;
  message: string;
};

const lifecycleStatusSchema = z.enum(["ACTIVE", "PAUSED"]);

const baseWebsiteSchema = z.object({
  name: z.string().trim().min(2, "Tên website phải có ít nhất 2 ký tự.").max(160, "Tên website quá dài."),
  slug: z.string().trim().max(120, "Slug quá dài."),
  cmsDomain: z.string().trim().max(255, "Domain CMS quá dài."),
  primaryDomain: z.string().trim().max(255, "Domain chính quá dài."),
  aliasDomainsText: z.string().trim().max(5000, "Danh sách domain phụ quá dài."),
  isActive: z.boolean(),
  manualStatus: lifecycleStatusSchema,
  startsAt: z.string().trim().max(40, "Ngày bắt đầu không hợp lệ."),
  expiresAt: z.string().trim().max(40, "Ngày hết hạn không hợp lệ."),
  graceDays: z.coerce.number().int().min(0, "Số ngày gia hạn phải >= 0.").max(365, "Số ngày gia hạn tối đa 365."),
  themePreset: z.string().trim().max(40, "Theme preset không hợp lệ."),
  themePrimaryColor: z.string().trim().max(20, "Màu chính không hợp lệ."),
  themeSecondaryColor: z.string().trim().max(20, "Màu phụ không hợp lệ."),
  themeAccentColor: z.string().trim().max(20, "Màu nhấn không hợp lệ."),
  themeBackgroundFrom: z.string().trim().max(20, "Màu nền đầu không hợp lệ."),
  themeBackgroundTo: z.string().trim().max(20, "Màu nền cuối không hợp lệ."),
  themeHeadingFont: z.string().trim().max(120, "Font heading quá dài."),
  themeBodyFont: z.string().trim().max(120, "Font body quá dài.")
});

const updateWebsiteSchema = baseWebsiteSchema.extend({
  id: z.string().trim().min(1, "Thiếu ID website.")
});

function failure(message: string): WebsiteActionState {
  return { status: "error", message };
}

function success(message: string): WebsiteActionState {
  return { status: "success", message };
}

function toSlug(input: string) {
  return input
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

function normalizeDomain(raw: string) {
  return raw
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/.*$/, "")
    .replace(/:\d+$/, "");
}

function isValidDomainHost(domain: string) {
  if (!domain) {
    return false;
  }

  if (domain === "localhost") {
    return true;
  }

  if (!domain.includes(".")) {
    return false;
  }

  return /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)+$/i.test(domain);
}

function parseDomains(primaryDomain: string, aliasDomainsText: string) {
  const invalidDomains: string[] = [];
  const uniqueDomains = new Set<string>();
  const orderedDomains: string[] = [];

  const tryPush = (value: string) => {
    const normalized = normalizeDomain(value);
    if (!normalized) {
      return;
    }

    if (!isValidDomainHost(normalized)) {
      invalidDomains.push(value.trim());
      return;
    }

    if (!uniqueDomains.has(normalized)) {
      uniqueDomains.add(normalized);
      orderedDomains.push(normalized);
    }
  };

  tryPush(primaryDomain);
  aliasDomainsText
    .split(/\r?\n|,/g)
    .map((item) => item.trim())
    .filter(Boolean)
    .forEach((item) => tryPush(item));

  return {
    domains: orderedDomains,
    invalidDomains
  };
}

function normalizeCmsDomain(value: string) {
  if (!value.trim()) {
    return null;
  }

  const normalized = normalizeDomain(value);
  if (!isValidDomainHost(normalized)) {
    throw new Error("Domain CMS không hợp lệ.");
  }

  return normalized;
}

function parseDateInput(value: string, mode: "start" | "end") {
  const normalized = value.trim();
  if (!normalized) {
    return null;
  }

  const match = normalized.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) {
    throw new Error("Ngày phải đúng định dạng YYYY-MM-DD.");
  }

  const [, year, month, day] = match;
  const hours = mode === "start" ? 0 : 23;
  const minutes = mode === "start" ? 0 : 59;
  const seconds = mode === "start" ? 0 : 59;
  const milliseconds = mode === "start" ? 0 : 999;

  const utcDate = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day), hours, minutes, seconds, milliseconds));
  if (Number.isNaN(utcDate.getTime())) {
    throw new Error("Ngày không hợp lệ.");
  }

  return utcDate.toISOString();
}

function buildLifecycleConfig(input: {
  manualStatus: "ACTIVE" | "PAUSED";
  startsAt: string;
  expiresAt: string;
  graceDays: number;
}): TenantLifecycleConfig {
  const startsAt = parseDateInput(input.startsAt, "start");
  const expiresAt = parseDateInput(input.expiresAt, "end");

  if (startsAt && expiresAt) {
    const startMs = new Date(startsAt).getTime();
    const endMs = new Date(expiresAt).getTime();
    if (startMs > endMs) {
      throw new Error("Ngày bắt đầu phải nhỏ hơn hoặc bằng ngày hết hạn.");
    }
  }

  return {
    manualStatus: input.manualStatus,
    startsAt,
    expiresAt,
    graceDays: input.graceDays
  };
}

async function ensureAdminRole() {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false as const, error: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại." };
  }

  if (session.user.role !== UserRole.ADMIN) {
    return { ok: false as const, error: "Chỉ ADMIN mới được quản lý danh sách website." };
  }

  return { ok: true as const };
}

async function resolveUniqueTenantSlug(baseSlug: string, currentId?: string) {
  let suffix = 0;

  while (suffix < 300) {
    const candidate = suffix === 0 ? baseSlug : `${baseSlug}-${suffix + 1}`.slice(0, 120);
    const existing = await prisma.tenant.findUnique({
      where: { slug: candidate },
      select: { id: true }
    });

    if (!existing || existing.id === currentId) {
      return candidate;
    }

    suffix += 1;
  }

  return `${baseSlug}-${Date.now()}`.slice(0, 120);
}

async function ensureDomainConflicts(domains: string[], currentTenantId?: string) {
  if (domains.length === 0) {
    return null;
  }

  const conflicts = await prisma.tenantDomain.findMany({
    where: {
      domain: { in: domains },
      ...(currentTenantId
        ? {
            tenantId: { not: currentTenantId }
          }
        : {})
    },
    select: {
      domain: true,
      tenant: {
        select: {
          name: true,
          slug: true
        }
      }
    }
  });

  if (conflicts.length === 0) {
    return null;
  }

  const firstConflict = conflicts[0];
  return `Domain ${firstConflict.domain} đang thuộc website "${firstConflict.tenant.name}" (${firstConflict.tenant.slug}).`;
}

async function syncTenantDomains(tenantId: string, domains: string[], isActive: boolean) {
  if (domains.length === 0) {
    await prisma.tenantDomain.updateMany({
      where: { tenantId },
      data: {
        isPrimary: false,
        isActive: false
      }
    });
    return;
  }

  for (const [index, domain] of domains.entries()) {
    await prisma.tenantDomain.upsert({
      where: { domain },
      update: {
        tenantId,
        isPrimary: index === 0,
        isActive
      },
      create: {
        tenantId,
        domain,
        isPrimary: index === 0,
        isActive
      }
    });
  }

  await prisma.tenantDomain.updateMany({
    where: {
      tenantId,
      domain: { notIn: domains }
    },
    data: {
      isPrimary: false,
      isActive: false
    }
  });
}

function revalidateWebsitePaths() {
  revalidatePath("/admincp/websites", "page");
  revalidatePath("/admincp", "page");
}

function parseCommonFormData(formData: FormData) {
  return {
    name: String(formData.get("name") ?? ""),
    slug: String(formData.get("slug") ?? ""),
    cmsDomain: String(formData.get("cmsDomain") ?? ""),
    primaryDomain: String(formData.get("primaryDomain") ?? ""),
    aliasDomainsText: String(formData.get("aliasDomainsText") ?? ""),
    isActive: formData.get("isActive") === "on",
    manualStatus: String(formData.get("manualStatus") ?? "ACTIVE"),
    startsAt: String(formData.get("startsAt") ?? ""),
    expiresAt: String(formData.get("expiresAt") ?? ""),
    graceDays: String(formData.get("graceDays") ?? "0"),
    themePreset: String(formData.get("themePreset") ?? ""),
    themePrimaryColor: String(formData.get("themePrimaryColor") ?? ""),
    themeSecondaryColor: String(formData.get("themeSecondaryColor") ?? ""),
    themeAccentColor: String(formData.get("themeAccentColor") ?? ""),
    themeBackgroundFrom: String(formData.get("themeBackgroundFrom") ?? ""),
    themeBackgroundTo: String(formData.get("themeBackgroundTo") ?? ""),
    themeHeadingFont: String(formData.get("themeHeadingFont") ?? ""),
    themeBodyFont: String(formData.get("themeBodyFont") ?? "")
  };
}

export async function createWebsiteAction(
  _prev: WebsiteActionState,
  formData: FormData
): Promise<WebsiteActionState> {
  const authResult = await ensureAdminRole();
  if (!authResult.ok) {
    return failure(authResult.error);
  }

  if (!process.env.DATABASE_URL) {
    return failure("Thiếu DATABASE_URL nên chưa thể tạo website.");
  }

  const parsed = baseWebsiteSchema.safeParse(parseCommonFormData(formData));
  if (!parsed.success) {
    return failure(parsed.error.issues[0]?.message ?? "Dữ liệu website không hợp lệ.");
  }

  const slugSeed = toSlug(parsed.data.slug || parsed.data.name);
  if (!slugSeed) {
    return failure("Không thể tạo slug hợp lệ. Vui lòng nhập lại tên website.");
  }

  const { domains, invalidDomains } = parseDomains(parsed.data.primaryDomain, parsed.data.aliasDomainsText);
  if (invalidDomains.length > 0) {
    return failure(`Domain không hợp lệ: ${invalidDomains[0]}`);
  }

  try {
    const lifecycle = buildLifecycleConfig({
      manualStatus: parsed.data.manualStatus,
      startsAt: parsed.data.startsAt,
      expiresAt: parsed.data.expiresAt,
      graceDays: parsed.data.graceDays
    });
    const theme = normalizeTenantThemeInput({
      preset: parsed.data.themePreset,
      primaryColor: parsed.data.themePrimaryColor,
      secondaryColor: parsed.data.themeSecondaryColor,
      accentColor: parsed.data.themeAccentColor,
      backgroundFrom: parsed.data.themeBackgroundFrom,
      backgroundTo: parsed.data.themeBackgroundTo,
      headingFont: parsed.data.themeHeadingFont,
      bodyFont: parsed.data.themeBodyFont
    });

    const conflictMessage = await ensureDomainConflicts(domains);
    if (conflictMessage) {
      return failure(conflictMessage);
    }

    const slug = await resolveUniqueTenantSlug(slugSeed);
    const cmsDomain = normalizeCmsDomain(parsed.data.cmsDomain);

    const tenant = await prisma.tenant.create({
      data: {
        name: parsed.data.name,
        slug,
        cmsDomain,
        isActive: parsed.data.isActive
      }
    });

    await Promise.all([
      syncTenantDomains(tenant.id, domains, parsed.data.isActive),
      upsertTenantLifecycleByTenantId(tenant.id, lifecycle),
      upsertTenantThemeByTenantId(tenant.id, theme)
    ]);

    revalidateWebsitePaths();
    return success("Đã tạo website mới.");
  } catch (error) {
    return failure(error instanceof Error ? error.message : "Không thể tạo website mới.");
  }
}

export async function updateWebsiteAction(
  _prev: WebsiteActionState,
  formData: FormData
): Promise<WebsiteActionState> {
  const authResult = await ensureAdminRole();
  if (!authResult.ok) {
    return failure(authResult.error);
  }

  if (!process.env.DATABASE_URL) {
    return failure("Thiếu DATABASE_URL nên chưa thể cập nhật website.");
  }

  const parsed = updateWebsiteSchema.safeParse({
    ...parseCommonFormData(formData),
    id: String(formData.get("id") ?? "")
  });

  if (!parsed.success) {
    return failure(parsed.error.issues[0]?.message ?? "Dữ liệu website không hợp lệ.");
  }

  try {
    const existing = await prisma.tenant.findUnique({
      where: { id: parsed.data.id },
      select: { id: true, slug: true }
    });

    if (!existing) {
      return failure("Không tìm thấy website cần cập nhật.");
    }

    const slugSeed = toSlug(parsed.data.slug || parsed.data.name || existing.slug);
    if (!slugSeed) {
      return failure("Không thể tạo slug hợp lệ. Vui lòng nhập lại.");
    }

    const lifecycle = buildLifecycleConfig({
      manualStatus: parsed.data.manualStatus,
      startsAt: parsed.data.startsAt,
      expiresAt: parsed.data.expiresAt,
      graceDays: parsed.data.graceDays
    });
    const theme = normalizeTenantThemeInput({
      preset: parsed.data.themePreset,
      primaryColor: parsed.data.themePrimaryColor,
      secondaryColor: parsed.data.themeSecondaryColor,
      accentColor: parsed.data.themeAccentColor,
      backgroundFrom: parsed.data.themeBackgroundFrom,
      backgroundTo: parsed.data.themeBackgroundTo,
      headingFont: parsed.data.themeHeadingFont,
      bodyFont: parsed.data.themeBodyFont
    });

    const slug = await resolveUniqueTenantSlug(slugSeed, existing.id);
    const cmsDomain = normalizeCmsDomain(parsed.data.cmsDomain);
    const { domains, invalidDomains } = parseDomains(parsed.data.primaryDomain, parsed.data.aliasDomainsText);

    if (invalidDomains.length > 0) {
      return failure(`Domain không hợp lệ: ${invalidDomains[0]}`);
    }

    const conflictMessage = await ensureDomainConflicts(domains, existing.id);
    if (conflictMessage) {
      return failure(conflictMessage);
    }

    await prisma.tenant.update({
      where: { id: existing.id },
      data: {
        name: parsed.data.name,
        slug,
        cmsDomain,
        isActive: parsed.data.isActive
      }
    });

    await Promise.all([
      syncTenantDomains(existing.id, domains, parsed.data.isActive),
      upsertTenantLifecycleByTenantId(existing.id, lifecycle),
      upsertTenantThemeByTenantId(existing.id, theme)
    ]);

    revalidateWebsitePaths();
    return success("Đã cập nhật website.");
  } catch (error) {
    return failure(error instanceof Error ? error.message : "Không thể cập nhật website.");
  }
}
